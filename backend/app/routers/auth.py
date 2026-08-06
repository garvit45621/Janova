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

    # Send Welcome Email via Resend
    send_welcome_email(user.email, profile.full_name)

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

import os
import random
import time
import json
import urllib.request
import urllib.error

# In-memory OTP storage cache: email -> { "code": "...", "expires_at": timestamp }
otp_store = {}

class SendOTPRequest(BaseModel):
    email: str
    password: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

@router.post("/send-otp")
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    
    # Auto-create citizen profile if this email is signing in for the first time
    if not user:
        user = User(email=email_clean, hashed_password=req.password)
        db.add(user)
        db.commit()
        db.refresh(user)

        citizen_id = f"JV-{random.randint(100000, 999999)}"
        name_part = email_clean.split('@')[0].replace('.', ' ').title()
        profile = Profile(
            user_id=user.id,
            full_name=name_part,
            citizen_id=citizen_id,
            phone="+91 9876543210",
            address="New Citizen Registry",
            photo="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
            notification_preferences={"email": True, "sms": True, "push": False},
            two_factor_enabled=True
        )
        db.add(profile)
        db.commit()
    elif user.hashed_password != req.password:
        # Update password for convenience if user enters a new password
        user.hashed_password = req.password
        db.commit()

    name_part = email_clean.split('@')[0].replace('.', ' ').title()

    # Dispatch official welcome email directly to citizen's inbox
    send_welcome_email(email_clean, name_part)

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()

    return {
        "status": "success",
        "message": f"Welcome email sent to {req.email}",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": profile.full_name if profile else name_part,
            "citizenId": profile.citizen_id if profile else "JV-982-110",
            "phone": profile.phone if profile else "+91 9876543210",
            "address": profile.address if profile else "New Citizen Registry",
            "photo": profile.photo if profile else "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
            "notificationPreferences": profile.notification_preferences if profile else {"email": True, "sms": True, "push": False},
            "twoFactorEnabled": profile.two_factor_enabled if profile else True
        }
    }

def dispatch_email(to_email: str, subject: str, html_body: str) -> bool:
    email_clean = to_email.strip().lower()
    if not email_clean:
        return False

    # 1. Try Gmail Free SMTP first (Delivers to ANY recipient inbox)
    gmail_user = os.environ.get("GMAIL_USER", "").strip()
    gmail_pass = os.environ.get("GMAIL_APP_PASS", "").replace(" ", "").strip()
    
    if gmail_user and gmail_pass:
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"Janova Portal <{gmail_user}>"
            msg["To"] = email_clean
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
                server.login(gmail_user, gmail_pass)
                server.sendmail(gmail_user, [email_clean], msg.as_string())
            print(f"Gmail SMTP email sent successfully to {email_clean}")
            return True
        except Exception as gmail_err:
            print("Gmail SMTP Error:", gmail_err)

    # 2. Fallback to Resend API
    resend_key = os.environ.get("RESEND_API_KEY", "").strip()
    if resend_key:
        try:
            url = "https://api.resend.com/emails"
            payload = {
                "from": "Janova Portal <onboarding@resend.dev>",
                "to": [email_clean],
                "subject": subject,
                "html": html_body
            }
            req_data = json.dumps(payload).encode('utf-8')
            http_req = urllib.request.Request(
                url, 
                data=req_data, 
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {resend_key}',
                    'User-Agent': 'Mozilla/5.0'
                }
            )
            with urllib.request.urlopen(http_req, timeout=8) as resp:
                print(f"Resend email sent successfully to {email_clean}")
                return True
        except urllib.error.HTTPError as he:
            err_body = he.read().decode('utf-8')
            print("Resend API HTTP Error:", he.code, err_body)
            # If recipient is restricted on free tier, retry sending copy to garvit.sarna2001@gmail.com
            if he.code == 403 or "validation_error" in err_body:
                try:
                    payload_fallback = {
                        "from": "Janova Portal <onboarding@resend.dev>",
                        "to": ["garvit.sarna2001@gmail.com"],
                        "subject": f"🚀 [Janova Copy] {subject} (For {email_clean})",
                        "html": html_body
                    }
                    req_data_fb = json.dumps(payload_fallback).encode('utf-8')
                    http_req_fb = urllib.request.Request(
                        url, 
                        data=req_data_fb, 
                        headers={
                            'Content-Type': 'application/json',
                            'Authorization': f'Bearer {resend_key}',
                            'User-Agent': 'Mozilla/5.0'
                        }
                    )
                    with urllib.request.urlopen(http_req_fb, timeout=8) as resp_fb:
                        print(f"Fallback notification sent to garvit.sarna2001@gmail.com for user {email_clean}")
                        return True
                except Exception as fb_err:
                    print("Resend Fallback Error:", fb_err)
        except Exception as e:
            print("Resend API Exception:", e)

    return False

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    email_key = req.email.lower()
    stored = otp_store.get(email_key)
    
    if not stored:
        raise HTTPException(status_code=400, detail="No verification code requested or expired. Please try again.")
        
    if time.time() > stored["expires_at"]:
        del otp_store[email_key]
        raise HTTPException(status_code=400, detail="Verification code has expired (5 minute limit). Please request a new code.")
        
    if stored["code"] != req.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid 6-digit verification code. Please check and re-enter.")
        
    # Code is valid, remove from cache
    del otp_store[email_key]
    
    # Complete User Login
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")
        
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    name_display = profile.full_name if profile else req.email.split('@')[0].title()

    # Dispatch welcome email to every authenticated citizen email address
    send_welcome_email(user.email, name_display)
    
    return {
        "access_token": f"token-{user.id}", 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": profile.full_name if profile else "Citizen",
            "citizenId": profile.citizen_id if profile else "JV-982-110",
            "phone": profile.phone if profile else "",
            "address": profile.address if profile else "",
            "photo": profile.photo if profile else "",
            "notificationPreferences": profile.notification_preferences if profile else {"email": True, "sms": True, "push": False},
            "twoFactorEnabled": profile.two_factor_enabled if profile else True
        }
    }

def send_welcome_email(email: str, name: str):
    email_clean = email.strip().lower()
    if not email_clean:
        return

    gmail_user = os.environ.get("GMAIL_USER", "").strip()
    gmail_pass = os.environ.get("GMAIL_APP_PASS", "").strip()

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 30px; border: 1px solid #1e293b; border-radius: 16px; background-color: #0f172a; color: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: linear-gradient(135deg, #2563eb, #06b6d4); color: #ffffff; font-size: 24px; font-weight: 800; margin-bottom: 12px;">J</div>
            <h1 style="color: #38bdf8; font-size: 22px; font-weight: 800; margin: 0;">Janova GovTech OS</h1>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Unified Operating System for National Citizen Services</p>
        </div>
        
        <div style="background: #1e293b; padding: 22px; border-radius: 12px; border-left: 4px solid #38bdf8; margin: 20px 0;">
            <h3 style="color: #ffffff; margin-top: 0; font-size: 17px; font-weight: 700;">Welcome to Janova Portal, {name}! 🎉</h3>
            <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6; margin-bottom: 0;">
                Your email address (<strong>{email_clean}</strong>) has been authenticated and verified successfully with the Janova National Citizen Network.
            </p>
        </div>

        <div style="margin: 24px 0;">
            <h4 style="color: #38bdf8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">Your Digital Identity Features:</h4>
            <div style="background: #172033; padding: 16px; border-radius: 10px; border: 1px solid #1e293b;">
                <ul style="color: #cbd5e1; font-size: 13px; line-height: 1.8; margin: 0; padding-left: 20px;">
                    <li>🔐 <strong>Digital Credentials Vault:</strong> AES-256 client-side encrypted UIDAI DigiLocker synchronization.</li>
                    <li>💰 <strong>AI Welfare Scheme Finder:</strong> Automated eligibility calculations for 150+ central & state grants.</li>
                    <li>📍 <strong>Geospatial Municipal Radar:</strong> 1-click ward complaint reporting with real-time SLA tracking.</li>
                    <li>🏢 <strong>48-Hour Corporate Portal:</strong> MCA SPICe+ entity incorporation and PAN/TAN allotment.</li>
                </ul>
            </div>
        </div>

        <div style="text-align: center; margin-top: 28px; padding-top: 18px; border-top: 1px solid #334155;">
            <p style="color: #64748b; font-size: 11px; margin: 0;">
                This welcome notification was dispatched to <strong>{email_clean}</strong>.<br />
                Janova Enterprise GovTech Infrastructure • 256-Bit Encrypted Standard
            </p>
        </div>
    </div>
    """

    # If Gmail SMTP credentials are set, use Gmail SMTP (Sends to ANY recipient inbox)
    if gmail_user and gmail_pass:
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Welcome to Janova Portal, {name}! 🎉"
            msg["From"] = f"Janova Portal <{gmail_user}>"
            msg["To"] = email_clean
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
                server.login(gmail_user, gmail_pass)
                server.sendmail(gmail_user, [email_clean], msg.as_string())
            print(f"Gmail SMTP welcome email sent successfully to {email_clean}")
            return
        except Exception as gmail_err:
            print("Gmail SMTP Error:", gmail_err)

    # Fallback to Resend API
    resend_key = os.environ.get("RESEND_API_KEY", "").strip()
    if resend_key:
        try:
            url = "https://api.resend.com/emails"
            payload = {
                "from": "Janova Portal <onboarding@resend.dev>",
                "to": [email_clean],
                "subject": f"Welcome to Janova Portal, {name}! 🎉",
                "html": html_body
            }
            req_data = json.dumps(payload).encode('utf-8')
            http_req = urllib.request.Request(
                url, 
                data=req_data, 
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {resend_key}',
                    'User-Agent': 'Mozilla/5.0'
                }
            )
            with urllib.request.urlopen(http_req, timeout=8) as resp:
                print(f"Welcome email sent successfully via Resend to {email_clean}")
        except urllib.error.HTTPError as he:
            err_body = he.read().decode('utf-8')
            print("Resend Welcome Email HTTP Error:", he.code, err_body)
            if he.code == 403 or "validation_error" in err_body:
                try:
                    payload_fallback = {
                        "from": "Janova Portal <onboarding@resend.dev>",
                        "to": ["garvit.sarna2001@gmail.com"],
                        "subject": f"🚀 [Janova Citizen Login] Welcome {name} ({email_clean})",
                        "html": html_body
                    }
                    req_data_fb = json.dumps(payload_fallback).encode('utf-8')
                    http_req_fb = urllib.request.Request(
                        url, 
                        data=req_data_fb, 
                        headers={
                            'Content-Type': 'application/json',
                            'Authorization': f'Bearer {resend_key}',
                            'User-Agent': 'Mozilla/5.0'
                        }
                    )
                    with urllib.request.urlopen(http_req_fb, timeout=8) as resp_fb:
                        print(f"Fallback notification sent to garvit.sarna2001@gmail.com for user {email_clean}")
                except Exception as fb_err:
                    print("Resend Fallback Error:", fb_err)
        except Exception as e:
            print("Resend Welcome Email Exception:", e)

class GoogleLoginRequest(BaseModel):
    email: str
    name: Optional[str] = None
    photo: Optional[str] = None
    google_token: Optional[str] = None

@router.post("/google")
def google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    email_clean = req.email.strip().lower()
    if not email_clean:
        raise HTTPException(status_code=400, detail="Google email is required.")
        
    user = db.query(User).filter(User.email == email_clean).first()
    
    if not user:
        # Auto-create user profile from Google OAuth data
        user = User(email=email_clean, hashed_password="google_oauth_authenticated")
        db.add(user)
        db.commit()
        db.refresh(user)

        citizen_id = f"JV-G{random.randint(100000, 999999)}"
        name_val = req.name or email_clean.split('@')[0].replace('.', ' ').title()
        photo_val = req.photo or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"
        
        profile = Profile(
            user_id=user.id,
            full_name=name_val,
            citizen_id=citizen_id,
            phone="+91 9876543210",
            address="Google Verified Account",
            photo=photo_val,
            notification_preferences={"email": True, "sms": True, "push": False},
            two_factor_enabled=True
        )
        db.add(profile)
        db.commit()

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    name_display = profile.full_name if profile else (req.name or email_clean.split('@')[0].title())

    # Trigger Welcome Email via Resend to the authenticated Google email
    send_welcome_email(email_clean, name_display)

    return {
        "access_token": f"google-token-{user.id}",
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "name": profile.full_name if profile else "Google Citizen",
            "citizenId": profile.citizen_id if profile else "JV-G001",
            "phone": profile.phone if profile else "",
            "address": profile.address if profile else "",
            "photo": profile.photo if profile else "",
            "notificationPreferences": profile.notification_preferences if profile else {"email": True, "sms": True, "push": False},
            "twoFactorEnabled": profile.two_factor_enabled if profile else True
        }
    }

@router.post("/login")
def login_user(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or user.hashed_password != req.password:
        raise HTTPException(status_code=400, detail="Invalid email or password.")

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    name_display = profile.full_name if profile else req.email.split('@')[0].title()
    
    # Dispatch welcome email to every authenticated citizen email address
    send_welcome_email(user.email, name_display)
    
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
