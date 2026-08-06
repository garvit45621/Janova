from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from ..database import get_db
from ..models import Document, Notification

router = APIRouter(prefix="/vault", tags=["vault"])

class ShareRequest(BaseModel):
    document_id: int
    duration_hours: int = 24

@router.get("/{user_id}")
def get_user_documents(user_id: int, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.user_id == user_id).all()
    
    # Calculate missing documents alerts
    # If student, check if has high school diploma, if has tax, etc.
    categories = [d.category for d in docs]
    missing = []
    if "Identity" not in categories:
        missing.append("Identity Card")
    if "Tax" not in categories:
        missing.append("Tax Statement W2")
        
    return {
        "documents": docs,
        "missing": missing,
        "expiring": [d for d in docs if d.expiry_date and (d.expiry_date - date.today()).days <= 30]
    }

import os
import shutil
from fastapi import File

@router.post("/upload")
async def upload_document(
    user_id: int = Form(...),
    name: str = Form(...),
    category: str = Form(...),
    size: str = Form("1.0 MB"),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    upload_dir = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_url = f"http://localhost:8000/mock/Vault_{name}.pdf"
    
    if file and file.filename:
        # Generate safe filename
        safe_filename = f"{user_id}_{int(datetime.utcnow().timestamp())}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join(upload_dir, safe_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        file_url = f"http://localhost:8000/uploads/{safe_filename}"

    doc = Document(
        user_id=user_id,
        name=name,
        category=category,
        size=size,
        url=file_url,
        expiry_date=date(2027, 5, 23),
        verified=False
    )
    db.add(doc)
    
    notif = Notification(
        user_id=user_id,
        text=f"Document '{name}' uploaded & saved to secure Document Vault.",
        type="success"
    )
    db.add(notif)
    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/delete/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    db.delete(doc)
    db.commit()
    return {"status": "success"}

@router.post("/share")
def generate_share_link(req: ShareRequest, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == req.document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    # Simulates secure share URL with expiration tokens
    share_url = f"https://janova.gov/secure-share/token-doc-{doc.id}?expires={req.duration_hours}h"
    return {"share_url": share_url, "expires_in": f"{req.duration_hours} hours"}
