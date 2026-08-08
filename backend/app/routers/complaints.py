from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from ..database import get_db
from ..models import Complaint, Notification, Application

router = APIRouter(prefix="/complaints", tags=["complaints"])

class CreateComplaintRequest(BaseModel):
    user_id: int
    title: str
    category: str
    description: str
    location: str
    x_coord: float
    y_coord: float

@router.get("/list")
def list_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).all()

@router.post("/create")
def create_complaint(req: CreateComplaintRequest, db: Session = Depends(get_db)):
    cmp = Complaint(
        user_id=req.user_id,
        title=req.title,
        category=req.category,
        description=req.description,
        location=req.location,
        x_coord=req.x_coord,
        y_coord=req.y_coord,
        photo_url="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=256&auto=format&fit=crop", # Simulated placeholder
        status="new",
        upvotes=1
    )
    db.add(cmp)
    db.commit()
    db.refresh(cmp)

    # Register as active tracking application
    app = Application(
        user_id=req.user_id,
        title=f"Civic Issue: {req.title}",
        category="Civic Complaints",
        status="pending",
        progress=15,
        history=[
            {"status": "Submitted", "date": date.today().isoformat(), "desc": "Complaint reported online. Location pinned."}
        ]
    )
    db.add(app)

    notif = Notification(
        user_id=req.user_id,
        text=f"Civic Complaint '{req.title}' registered. Pin coordinate is saved.",
        type="success"
    )
    db.add(notif)
    db.commit()
    return cmp

@router.post("/upvote/{complaint_id}")
def upvote_complaint(complaint_id: int, db: Session = Depends(get_db)):
    cmp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not cmp:
        raise HTTPException(status_code=404, detail="Complaint not found.")
    
    cmp.upvotes += 1
    db.commit()
    return {"status": "success", "upvotes": cmp.upvotes}
