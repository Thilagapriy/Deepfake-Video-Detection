import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True, nullable=True) # Optional now
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)
    
    # OTP Fields
    otp_hash = Column(String, nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    otp_failed_attempts = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    activities = relationship("LoginActivity", back_populates="user")
    histories = relationship("History", back_populates="user")

class LoginActivity(Base):
    __tablename__ = "login_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String) # e.g., "LOGIN_SUCCESS", "LOGIN_FAILED", "OTP_SENT"
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="activities")

class History(Base):
    __tablename__ = "histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    video_filename = Column(String)
    is_fake = Column(String) # "Real" or "Fake"
    fake_percentage = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    frame_data_json = Column(String) # JSON string of frame paths/urls
    gradcam_frame_path = Column(String) # Path to the gradcam image
    stats_json = Column(String)

    user = relationship("User", back_populates="histories")
