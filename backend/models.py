"""
Database Models for KaziTracker
Complete data models for all phases - WORKING VERSION
"""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

# ============================================================================
# USER & AUTHENTICATION (Phase 1-2) - Define first (no dependencies)
# ============================================================================

class User(SQLModel, table=True):
    """User account model"""
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=True)

    # ✅ NEW: Profile fields
    full_name: Optional[str] = Field(
        default=None,
        nullable=True,
        description="User's full name"
    )
    phone_number: Optional[str] = Field(
        default=None,
        nullable=True,
        description="User's phone number"
    )
    location: Optional[str] = Field(
        default=None,
        nullable=True,
        description="User's location (City, Country)"
    )
    headline: Optional[str] = Field(
        default=None,
        nullable=True,
        description="Professional headline"
    )
    
    # ✅ FUTURE: Profile expansion fields (commented out for now)
    # education: Optional[str] = Field(default=None)  # JSON array
    # skills: Optional[str] = Field(default=None)  # JSON array
    # work_experience: Optional[str] = Field(default=None)  # JSON array
    # profile_picture_url: Optional[str] = Field(default=None)
    
    # Relationships defined with back_populates
    jobs: list["Job"] = Relationship(back_populates="user")
    resumes: list["Resume"] = Relationship(back_populates="user")
    applications: list["Application"] = Relationship(back_populates="user")
    activity_logs: list["Activity"] = Relationship(back_populates="user")
    interviews: list["Interview"] = Relationship(back_populates="user")
    offers: list["Offer"] = Relationship(back_populates="user")
    deadlines: list["Deadline"] = Relationship(back_populates="user")

# ============================================================================
# JOB POSTINGS (Phase 3) - Define second
# ============================================================================
    

class Job(SQLModel, table=True):
    """Job posting model"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    
    # Job Details
    title: str = Field(index=True)
    company: str = Field(index=True)
    location: Optional[str] = None
    salary_range: Optional[str] = None
    description: str
    apply_url: Optional[str] = None
    
    # Extracted Data
    parsed_skills: Optional[str] = None
    seniority_level: Optional[str] = None
    source: Optional[str] = Field(default="manual_paste")
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="jobs")
    applications: list["Application"] = Relationship(
        back_populates="job",
        sa_relationship_kwargs={"cascade": "all, delete"}
    )


# ============================================================================
# RESUME MANAGEMENT (Phase 5) - Define third
# ============================================================================

class Resume(SQLModel, table=True):
    """Resume/CV model"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    
    # File Information
    filename: str = Field(index=True)
    file_path: str
    file_type: str
    file_size: Optional[int] = None
    
    # Content
    extracted_text: Optional[str] = None
    tags: Optional[str] = None
    
    # Timestamps
    uploaded_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="resumes")
    applications: list["Application"] = Relationship(back_populates="resume")


# ============================================================================
# ACTIVITY LOG (Phase 6) - Define before Application
# ============================================================================

class Activity(SQLModel, table=True):
    """User activity log for analytics"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    
    # Action Information
    action: str = Field(index=True)
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    details: Optional[str] = None
    
    # Timestamp
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationship
    user: User = Relationship(back_populates="activity_logs")


# ============================================================================
# APPLICATION MODEL (Phase 4) - Define AFTER all models it references
# ============================================================================

class Application(SQLModel, table=True):
    """Application tracking model - tracks job application lifecycle"""
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    job_id: int = Field(foreign_key="job.id", index=True)
    
    # Status Tracking
    status: str = Field(default="Saved", index=True)
    
    # Lifecycle Dates
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    offer_date: Optional[datetime] = None
    rejected_date: Optional[datetime] = None
    
    # Links to other entities
    resume_id: Optional[int] = Field(default=None, foreign_key="resume.id", nullable=True)
    
    # Phase 7: Rejection & Offer Details
    rejection_reason: Optional[str] = None
    offer_details: Optional[str] = None
    notes: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="applications")
    job: Job = Relationship(back_populates="applications")
    resume: Optional[Resume] = Relationship(back_populates="applications")
    interviews: list["Interview"] = Relationship(back_populates="application")
    offers: list["Offer"] = Relationship(back_populates="application")
    deadlines: list["Deadline"] = Relationship(back_populates="application")


# ============================================================================
# INTERVIEW MODEL (Phase 7) - Define AFTER Application
# ============================================================================

class Interview(SQLModel, table=True):
    """Interview scheduling and tracking model"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    application_id: int = Field(foreign_key="application.id", index=True)
    
    # Interview Details
    date: datetime
    time: str
    type: str = Field(default="phone")  # phone, video, in-person
    
    # Metadata
    interviewer: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    
    # Preparation
    prep_checklist: Optional[str] = None  # JSON array
    reminders: bool = Field(default=True)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="interviews")
    application: Application = Relationship(back_populates="interviews")


# ============================================================================
# OFFER MODEL (Phase 7) - Define AFTER Application
# ============================================================================

class Offer(SQLModel, table=True):
    """Job offer tracking and negotiation model"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    application_id: int = Field(foreign_key="application.id", index=True)
    
    # Company & Position
    company_name: str
    position: str
    
    # Compensation
    salary: float
    benefits: Optional[str] = None  # JSON array
    
    # Timeline
    start_date: datetime
    deadline: datetime
    
    # Status Management
    status: str = Field(default="pending", index=True)  # pending, accepted, rejected, negotiating
    
    # Negotiation
    negotiation_history: Optional[str] = None  # JSON array
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="offers")
    application: Application = Relationship(back_populates="offers")


# ============================================================================
# DEADLINE MODEL (Phase 7) - Define AFTER Application
# ============================================================================

class Deadline(SQLModel, table=True):
    """Application deadline tracking model"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    application_id: int = Field(foreign_key="application.id", index=True)
    
    # Deadline Details
    title: str
    due_date: datetime = Field(index=True)
    
    # Classification
    type: str = Field(default="response")  # response, decision, negotiation, other
    priority: str = Field(default="medium")  # high, medium, low
    
    # Status
    completed: bool = Field(default=False, index=True)
    notes: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="deadlines")
    application: Application = Relationship(back_populates="deadlines")