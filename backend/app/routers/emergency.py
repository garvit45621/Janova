from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..database import get_db
from ..models import EmergencyAlert, EmergencyHelpline, ShelterLocation, SOSAlert, Notification

router = APIRouter(prefix="/emergency", tags=["emergency"])

class SOSRequest(BaseModel):
    user_id: int
    user_name: str
    user_phone: Optional[str] = None
    location: str

@router.get("/alerts")
def list_emergency_alerts(db: Session = Depends(get_db)):
    return db.query(EmergencyAlert).filter(EmergencyAlert.active == True).order_by(EmergencyAlert.id.desc()).all()

@router.get("/helplines")
def list_emergency_helplines(db: Session = Depends(get_db)):
    return db.query(EmergencyHelpline).all()

@router.get("/shelters")
def list_shelter_locations(db: Session = Depends(get_db)):
    return db.query(ShelterLocation).all()

@router.post("/sos")
def dispatch_sos_alert(req: SOSRequest, db: Session = Depends(get_db)):
    sos = SOSAlert(
        user_id=req.user_id,
        user_name=req.user_name,
        user_phone=req.user_phone,
        location=req.location,
        status="dispatched"
    )
    db.add(sos)
    
    # Notify user of active emergency broadcast dispatch
    notif = Notification(
        user_id=req.user_id,
        text=f"🔴 EMERGENCY SOS BROADCAST: First Responders & District Control Room notified for location '{req.location}'.",
        type="danger"
    )
    db.add(notif)
    db.commit()
    db.refresh(sos)
    return {"message": "SOS Alert successfully dispatched to Municipal Control Room & Emergency Responders.", "sos": sos}
