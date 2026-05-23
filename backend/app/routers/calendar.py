from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from ..database import get_db
from ..models import Deadline, Notification

router = APIRouter(prefix="/calendar", tags=["calendar"])

class CreateDeadlineRequest(BaseModel):
    user_id: int
    title: str
    date: date
    type: str # license, certificate, tax, application, election
    urgency: str # low, medium, high

@router.get("/{user_id}")
def get_user_deadlines(user_id: int, db: Session = Depends(get_db)):
    return db.query(Deadline).filter(Deadline.user_id == user_id).all()

@router.post("/create")
def create_deadline(req: CreateDeadlineRequest, db: Session = Depends(get_db)):
    dl = Deadline(
        user_id=req.user_id,
        title=req.title,
        date=req.date,
        type=req.type,
        urgency=req.urgency
    )
    db.add(dl)
    
    # Notify user
    notif = Notification(
        user_id=req.user_id,
        text=f"Reminder scheduled: '{req.title}' on {req.date}.",
        type="info"
    )
    db.add(notif)
    db.commit()
    db.refresh(dl)
    return dl
