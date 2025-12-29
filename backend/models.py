"""
Database Models for KaziTracker
Production-ready with proper cascade delete handling
"""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

# ============================================================================
# USER & AUTHENTICATION - Define first (no dependencies)
# ============================================================================

class User(SQLModel, table=True):
    """User account model with cascade delete protection"""
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=True)

    # Profile fields
    full_name: Optional[str] = Field(default=None, nullable=True)
    phone_number: Optional[str] = Field(default=None, nullable=True)
    location: Optional[str] = Field(default=None, nullable=True)
    headline: Optional[str] = Field(default=None, nullable=True)
    
    # Relationships with CASCADE DELETE
    # When user is deleted, all related data is deleted
    jobs: list["Job"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    resumes: list["Resume"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    applications: list["Application"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    activity_logs: list["Activity"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    interviews: list["Interview"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    offers: list["Offer"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    deadlines: list["Deadline"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


# ============================================================================
# JOB POSTINGS - Define second
# ============================================================================

class Job(SQLModel, table=True):
    """Job posting model with cascade delete"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    
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
    # When job is deleted, all applications are deleted
    applications: list["Application"] = Relationship(
        back_populates="job",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


# ============================================================================
# RESUME MANAGEMENT - Define third
# ============================================================================

class Resume(SQLModel, table=True):
    """Resume/CV model with proper cascade handling"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    
    # File Information
    filename: str = Field(index=True)
    file_path: str
    file_type: str
    file_size: Optional[int] = None
    
    # Content
    extracted_text: Optional[str] = None
    tags: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="resumes")
    # When resume is deleted, SET NULL on applications (don't delete them)
    applications: list["Application"] = Relationship(
        back_populates="resume",
        sa_relationship_kwargs={
            "cascade": "save-update, merge",
            "passive_deletes": True
        }
    )


# ============================================================================
# ACTIVITY LOG - Define before Application
# ============================================================================

class Activity(SQLModel, table=True):
    """User activity log for analytics"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    
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
# APPLICATION MODEL - Define AFTER all models it references
# ============================================================================

class Application(SQLModel, table=True):
    """
    Application tracking model with proper cascade handling
    - Deleting application deletes all interviews, offers, deadlines
    - Deleting resume sets resume_id to NULL (doesn't delete application)
    """
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    job_id: int = Field(foreign_key="job.id", index=True, ondelete="CASCADE")
    
    # Status Tracking
    status: str = Field(default="Saved", index=True)
    
    # Lifecycle Dates
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    offer_date: Optional[datetime] = None
    rejected_date: Optional[datetime] = None
    
    # Links to other entities
    # SET NULL on delete - if resume is deleted, application remains
    resume_id: Optional[int] = Field(
        default=None,
        foreign_key="resume.id",
        nullable=True,
        ondelete="SET NULL"
    )
    
    # Rejection & Offer Details
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
    
    # CASCADE DELETE - When application is deleted, delete all related records
    interviews: list["Interview"] = Relationship(
        back_populates="application",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    offers: list["Offer"] = Relationship(
        back_populates="application",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    deadlines: list["Deadline"] = Relationship(
        back_populates="application",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


# ============================================================================
# INTERVIEW MODEL - Define AFTER Application
# ============================================================================

class Interview(SQLModel, table=True):
    """Interview scheduling and tracking model"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    application_id: int = Field(
        foreign_key="application.id",
        index=True,
        ondelete="CASCADE"  # Delete interview when application is deleted
    )
    
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
# OFFER MODEL - Define AFTER Application
# ============================================================================

class Offer(SQLModel, table=True):
    """Job offer tracking and negotiation model"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    application_id: int = Field(
        foreign_key="application.id",
        index=True,
        ondelete="CASCADE"  # Delete offer when application is deleted
    )
    
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
    status: str = Field(default="pending", index=True)
    
    # Negotiation
    negotiation_history: Optional[str] = None  # JSON array
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="offers")
    application: Application = Relationship(back_populates="offers")


# ============================================================================
# DEADLINE MODEL - Define AFTER Application
# ============================================================================

class Deadline(SQLModel, table=True):
    """Application deadline tracking model"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    application_id: int = Field(
        foreign_key="application.id",
        index=True,
        ondelete="CASCADE"  # Delete deadline when application is deleted
    )
    
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


# ============================================================================
# MIGRATION HELPER
# ============================================================================

def get_cascade_rules_summary():
    """
    Summary of cascade delete behavior:
    
    1. Delete User → Deletes ALL related data (jobs, resumes, applications, etc.)
    2. Delete Job → Deletes all applications for that job
    3. Delete Resume → Applications keep resume_id as NULL (preserved)
    4. Delete Application → Deletes interviews, offers, deadlines
    
    This prevents orphaned records and maintains referential integrity.
    """
    return {
        "user_deletion": "Cascades to all user data",
        "job_deletion": "Cascades to applications only",
        "resume_deletion": "Sets NULL in applications (safe)",
        "application_deletion": "Cascades to interviews, offers, deadlines"
    }