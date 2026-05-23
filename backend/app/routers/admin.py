from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Profile, Complaint, Application, Service

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/dashboard-stats")
def get_admin_dashboard_stats(db: Session = Depends(get_db)):
    user_count = db.query(User).count()
    complaint_count = db.query(Complaint).count()
    app_count = db.query(Application).count()
    service_count = db.query(Service).count()

    # Log events simulation
    logs = [
        {"timestamp": "2026-05-23 23:12:04", "level": "INFO", "message": "Supabase Storage connected successfully."},
        {"timestamp": "2026-05-23 22:45:11", "level": "INFO", "message": "Database seeds loaded for LLC templates."},
        {"timestamp": "2026-05-23 21:30:15", "level": "WARN", "message": "API latency checkpoint exceeded by 12ms."},
        {"timestamp": "2026-05-23 18:04:12", "level": "INFO", "message": "New citizen user registered (Aria Sterling)."}
    ]

    return {
        "metrics": {
            "activeUsers": user_count,
            "complaintsCount": complaint_count,
            "applicationsCount": app_count,
            "servicesCount": service_count
        },
        "logs": logs
    }

@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    return db.query(Profile).all()
