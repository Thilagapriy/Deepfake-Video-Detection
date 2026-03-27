import os
import random
import smtplib
from email.message import EmailMessage
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import jwt
import bcrypt
from slowapi import Limiter
from slowapi.util import get_remote_address

from database import get_db
import models

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

router = APIRouter(prefix="/api/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)

class EmailRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def send_email_otp(to_email: str, otp: str):
    sender_email = os.getenv("SMTP_EMAIL", "").strip()
    sender_password = os.getenv("SMTP_PASSWORD", "").strip()
    
    if not sender_email or not sender_password or sender_email == "your_email@gmail.com":
        print(f"\n=========================================")
        print(f" MOCK OTP FOR {to_email}: {otp}")
        print(f"=========================================\n")
        return
        
    msg = EmailMessage()
    msg.set_content(f"Your True Vision secure login code is: {otp}\n\nThis code will expire in 5 minutes. Do not share it with anyone.")
    msg['Subject'] = 'True Vision Authentication Code'
    msg['From'] = sender_email
    msg['To'] = to_email

    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"Failed to send email via SMTP: {e}")
        # Could fail gracefully or raise exception

@router.post("/send-otp")
@limiter.limit("3/minute")
def request_otp(request: Request, email_req: EmailRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email_req.email).first()
    if not user:
        # Create user if doesn't exist to allow easy login
        user = models.User(email=email_req.email)
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Generate 6-digit OTP
    otp_plain = str(random.randint(100000, 999999))
    
    # Securely hash the OTP
    otp_hash = bcrypt.hashpw(otp_plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Set TTL (5 minutes) and reset attempt counter
    user.otp_hash = otp_hash
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=5)
    user.otp_failed_attempts = 0
    db.commit()

    # Log action
    activity = models.LoginActivity(user_id=user.id, action="OTP_REQUESTED")
    db.add(activity)
    db.commit()

    send_email_otp(email_req.email, otp_plain)
    return {"message": "OTP sent successfully. Please check your email (or the backend console)."}

@router.post("/verify-otp")
@limiter.limit("10/minute")
def verify_otp(request: Request, verify_req: OTPVerifyRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == verify_req.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found.")
        
    if not user.otp_hash:
        raise HTTPException(status_code=400, detail="No OTP requested.")
        
    # Check expiry
    if datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")
        
    # Check attempt limits (Brute force protection)
    if user.otp_failed_attempts >= 3:
        raise HTTPException(status_code=403, detail="Too many failed attempts. Please request a new OTP.")
        
    # Verify hash
    if not bcrypt.checkpw(verify_req.otp.encode('utf-8'), user.otp_hash.encode('utf-8')):
        user.otp_failed_attempts += 1
        db.add(models.LoginActivity(user_id=user.id, action="OTP_FAILED"))
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP code.")
        
    # Success! Delete OTP (Single Use Rule)
    user.otp_hash = None
    user.otp_failed_attempts = 0
    
    db.add(models.LoginActivity(user_id=user.id, action="LOGIN_SUCCESS"))
    db.commit()
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "message": "Login successful"}
