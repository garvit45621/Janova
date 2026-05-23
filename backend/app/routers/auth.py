from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict
from ..database import get_db
from ..models import User, Profile, Notification

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    full_name: str
    phone: str
    address: str
    notification_preferences: Optional[Dict[str, bool]] = None
    two_factor_enabled: Optional[bool] = None

@router.post("/register")
def register_user(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    exists = db.query(User).filter(User.email == req.email).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email is already registered.")

    # Create user
    user = User(email=req.email, hashed_password=req.password) # Storing plain/hash simply for demonstration
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create profile
    citizen_id = f"JV-{100000 + user.id * 7}"
    profile = Profile(
        user_id=user.id,
        full_name=req.name,
        citizen_id=citizen_id,
        phone=req.phone,
        address=req.address,
        photo="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
        notification_preferences={"email": True, "sms": True, "push": False},
        two_factor_enabled=True
    )
    db.add(profile)

    # Welcome notification
    notif = Notification(
        user_id=user.id,
        text="Welcome to Janova GovTech Portal! Your digital identity has been verified.",
        type="success"
    )
    db.add(notif)
    db.commit()

    return {
        "access_token": f"token-{user.id}", 
        "token_type": "bearer", 
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": profile.full_name,
            "citizenId": profile.citizen_id,
            "phone": profile.phone,
            "address": profile.address,
            "photo": profile.photo,
            "notificationPreferences": profile.notification_preferences,
            "twoFactorEnabled": profile.two_factor_enabled
        }
    }

@router.post("/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or user.hashed_password != req.password:
        raise HTTPException(status_code=400, detail="Invalid email or password.")

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    
    return {
        "access_token": f"token-{user.id}", 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": profile.full_name if profile else "Aria Sterling",
            "citizenId": profile.citizen_id if profile else "JV-982-110",
            "phone": profile.phone if profile else "",
            "address": profile.address if profile else "",
            "photo": profile.photo if profile else "",
            "notificationPreferences": profile.notification_preferences if profile else {"email": True, "sms": True, "push": False},
            "twoFactorEnabled": profile.two_factor_enabled if profile else True
        }
    }

@router.put("/profile/{user_id}")
def update_profile(user_id: int, req: ProfileUpdateRequest, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")

    profile.full_name = req.full_name
    profile.phone = req.phone
    profile.address = req.address
    
    if req.notification_preferences is not None:
        profile.notification_preferences = req.notification_preferences
    if req.two_factor_enabled is not None:
        profile.two_factor_enabled = req.two_factor_enabled

    db.commit()
    return {"status": "success", "profile": {
        "name": profile.full_name,
        "phone": profile.phone,
        "address": profile.address,
        "notificationPreferences": profile.notification_preferences,
        "twoFactorEnabled": profile.two_factor_enabled
    }}
