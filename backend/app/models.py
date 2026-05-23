from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="citizen")
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("Profile", uselist=False, back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete")
    complaints = relationship("Complaint", back_populates="user", cascade="all, delete")
    applications = relationship("Application", back_populates="user", cascade="all, delete")
    deadlines = relationship("Deadline", back_populates="user", cascade="all, delete")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")
    checklists = relationship("Checklist", back_populates="user", cascade="all, delete")

class Profile(Base):
    __tablename__ = "profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    full_name = Column(String(255), nullable=False)
    citizen_id = Column(String(50), unique=True, nullable=False)
    phone = Column(String(50))
    address = Column(Text)
    photo = Column(String(500))
    notification_preferences = Column(JSON, default=lambda: {"email": True, "sms": True, "push": False})
    two_factor_enabled = Column(Boolean, default=True)

    user = relationship("User", back_populates="profile")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Identity, Education, Property, Tax, Healthcare
    size = Column(String(50), nullable=False)
    url = Column(String(500), nullable=False)
    expiry_date = Column(Date)
    verified = Column(Boolean, default=False)
    upload_date = Column(Date, default=datetime.utcnow)

    user = relationship("User", back_populates="documents")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False) # Certificates, Education, Business, Healthcare, Agriculture, Taxation, Identity Documents
    eligibility = Column(Text)
    required_documents = Column(JSON, default=list)
    estimated_time = Column(String(100))
    application_steps = Column(JSON, default=list)

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False) # Scholarships, Grants, Subsidies, Welfare
    amount = Column(String(100), nullable=False)
    eligibility_rules = Column(JSON, default=dict)
    deadline = Column(Date)
    requirements = Column(JSON, default=list)

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Potholes, Garbage, Water Leakage, Streetlight Failure, Road Damage, Illegal Dumping
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    x_coord = Column(Integer, nullable=False)
    y_coord = Column(Integer, nullable=False)
    photo_url = Column(String(500))
    status = Column(String(50), default="new") # new, investigating, resolved
    upvotes = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="complaints")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    status = Column(String(50), default="pending") # pending, reviewing, approved
    progress = Column(Integer, default=25)
    created_at = Column(DateTime, default=datetime.utcnow)
    history = Column(JSON, default=list)

    user = relationship("User", back_populates="applications")

class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    type = Column(String(50), nullable=False) # license, certificate, tax, application, election
    urgency = Column(String(50), default="medium") # low, medium, high

    user = relationship("User", back_populates="deadlines")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    text = Column(Text, nullable=False)
    type = Column(String(50), default="info") # success, warning, info, danger
    read_status = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class BusinessTemplate(Base):
    __tablename__ = "business_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False) # Pharmacy, Restaurant, Retail Shop, Startup, Consultancy, Manufacturing
    licenses = Column(JSON, default=list)
    approvals = Column(JSON, default=list)
    estimated_cost = Column(String(100))
    documents = Column(JSON, default=list)
    timeline = Column(String(100))
    compliance_checklist = Column(JSON, default=list)

class LifeEvent(Base):
    __tablename__ = "life_events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False) # Birth of Child, Marriage, etc.
    description = Column(Text, nullable=False)
    required_registrations = Column(JSON, default=list)
    services_needed = Column(JSON, default=list)
    documents_required = Column(JSON, default=list)
    timeline_est = Column(String(100))

class Checklist(Base):
    __tablename__ = "checklists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    life_event_id = Column(Integer, ForeignKey("life_events.id", ondelete="CASCADE"))
    checked_items = Column(JSON, default=dict)

    user = relationship("User", back_populates="checklists")
