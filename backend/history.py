from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, auth
from fastapi.security import OAuth2PasswordBearer
import jwt

router = APIRouter(prefix="/api/history", tags=["history"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/verify-otp")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/")
def get_user_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.email == "aishwaryat701@gmail.com":
        # Admin / Boss mode: See everyone's history
        histories = db.query(models.History).order_by(models.History.timestamp.desc()).all()
    else:
        # Standard user: See only their own
        histories = db.query(models.History).filter(models.History.user_id == current_user.id).order_by(models.History.timestamp.desc()).all()
        
    result = []
    for h in histories:
        user_email = h.user.email if h.user else "Unknown"
        result.append({
            "id": h.id,
            "user_email": user_email,
            "video_filename": h.video_filename,
            "is_fake": h.is_fake,
            "fake_percentage": h.fake_percentage,
            "timestamp": h.timestamp,
            "stats_json": h.stats_json
        })
    return result
