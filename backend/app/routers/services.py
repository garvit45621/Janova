from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from ..database import get_db
from ..models import Service, Scheme, Application, Notification, BusinessTemplate, LifeEvent, Checklist

router = APIRouter(prefix="/services", tags=["services"])

class ApplyServiceRequest(BaseModel):
    user_id: int
    title: str
    category: str

class DiscoveryRequest(BaseModel):
    age: int
    gender: str
    state: str
    profession: str
    income: int
    student_status: bool

class ChecklistUpdateRequest(BaseModel):
    user_id: int
    life_event_id: int
    checked_items: dict

@router.get("/list")
def list_services(db: Session = Depends(get_db)):
    return db.query(Service).all()

@router.get("/schemes")
def list_schemes(db: Session = Depends(get_db)):
    return db.query(Scheme).all()

@router.post("/discover")
def discover_benefits(req: DiscoveryRequest, db: Session = Depends(get_db)):
    schemes = db.query(Scheme).all()
    results = []

    for s in schemes:
        score = 30 # Baseline score
        rules = s.eligibility_rules or {}

        # Income match rules
        if "max_income" in rules:
            if req.income <= rules["max_income"]:
                score += 35
            else:
                score -= 20

        # Profession match rules
        if "profession" in rules:
            if req.profession == rules["profession"] or (rules["profession"] == "Student" and req.student_status):
                score += 35
            else:
                score -= 15

        # Cap scores between 10% and 100%
        final_score = max(min(score, 100), 10)

        results.append({
            "id": s.id,
            "title": s.title,
            "desc": s.description,
            "category": s.category,
            "amount": s.amount,
            "deadline": s.deadline,
            "requirements": s.requirements,
            "matchPercentage": final_score
        })

    # Sort by highest match first
    results.sort(key=lambda x: x["matchPercentage"], reverse=True)
    return results

@router.get("/applications/{user_id}")
def get_user_applications(user_id: int, db: Session = Depends(get_db)):
    return db.query(Application).filter(Application.user_id == user_id).all()

@router.post("/apply")
def submit_service_application(req: ApplyServiceRequest, db: Session = Depends(get_db)):
    app = Application(
        user_id=req.user_id,
        title=req.title,
        category=req.category,
        status="pending",
        progress=25,
        history=[
            {"status": "Submitted", "date": date.today().isoformat(), "desc": "Application received. Verification checks starting."}
        ]
    )
    db.add(app)

    notif = Notification(
        user_id=req.user_id,
        text=f"Your request for '{req.title}' has been submitted successfully.",
        type="success"
    )
    db.add(notif)
    db.commit()
    db.refresh(app)
    return app

@router.get("/business/templates")
def list_business_templates(db: Session = Depends(get_db)):
    return db.query(BusinessTemplate).all()

@router.get("/life-events")
def list_life_events(db: Session = Depends(get_db)):
    return db.query(LifeEvent).all()

@router.get("/life-events/checklist/{user_id}/{event_id}")
def get_life_event_checklist(user_id: int, event_id: int, db: Session = Depends(get_db)):
    chk = db.query(Checklist).filter(Checklist.user_id == user_id, Checklist.life_event_id == event_id).first()
    if not chk:
        # Create empty checklist
        chk = Checklist(user_id=user_id, life_event_id=event_id, checked_items={})
        db.add(chk)
        db.commit()
        db.refresh(chk)
    return chk

@router.put("/life-events/checklist")
def update_life_event_checklist(req: ChecklistUpdateRequest, db: Session = Depends(get_db)):
    chk = db.query(Checklist).filter(Checklist.user_id == req.user_id, Checklist.life_event_id == req.life_event_id).first()
    if not chk:
        chk = Checklist(user_id=req.user_id, life_event_id=req.life_event_id, checked_items=req.checked_items)
        db.add(chk)
    else:
        chk.checked_items = req.checked_items
    db.commit()
    return chk

@router.get("/live-radar")
def get_live_radar(db: Session = Depends(get_db)):
    events = []
    
    # Query recent applications
    try:
        apps = db.query(Application).order_by(Application.id.desc()).limit(3).all()
        for a in apps:
            events.append({
                "icon": "⚡",
                "city": "Bengaluru",
                "text": f"{a.title} ({a.status.title()})",
                "time": "Just now"
            })
    except Exception:
        pass
        
    # Query recent complaints if any
    try:
        from ..models import Complaint
        cmps = db.query(Complaint).order_by(Complaint.id.desc()).limit(3).all()
        for c in cmps:
            events.append({
                "icon": "📍",
                "city": c.location or "Mumbai",
                "text": f"{c.title} ({c.status.replace('_', ' ').title()})",
                "time": "3 mins ago"
            })
    except Exception:
        pass

    # Standard rich dynamic live items to guarantee seamless ticker stream
    default_events = [
        {"icon": "⚡", "city": "Bengaluru", "text": "Passport Renewal Verified (Stage 3/4)", "time": "2 mins ago"},
        {"icon": "🛡️", "city": "Delhi", "text": "Aadhaar Record Synced via DigiLocker", "time": "Just now"},
        {"icon": "📍", "city": "Mumbai", "text": "Ward 14 Streetlight SLA Resolved", "time": "12 mins ago"},
        {"icon": "💰", "city": "Karnataka", "text": "PM-Kisan Grant Disbursed (₹6,000)", "time": "5 mins ago"},
        {"icon": "🏢", "city": "Hyderabad", "text": "Pvt Ltd Company Incorporated via SPICe+ MCA", "time": "18 mins ago"},
        {"icon": "🎓", "city": "Chennai", "text": "Post-Matric Scholarship Sanctioned (₹48,000)", "time": "8 mins ago"}
    ]

    for d in default_events:
        if len(events) < 8:
            events.append(d)

    return {"status": "online", "count": len(events), "events": events}
