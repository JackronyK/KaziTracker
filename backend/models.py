## backend/models.py

from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

# =============================================================================
# USER & AUTH
# =============================================================================

class User(SQLModel, table=True):
    """User account."""
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    resumes: List["Resume"] = Relationship(back_populates="user")
    jobs: List["Job"] = Relationship(back_populates="user")
    applications: List["Application"] = Relationship(back_populates="user")

# =============================================================================
# RESUME MANAGEMENT
# =============================================================================

class Resume(SQLModel, table=True):
    """User's CV/resume versions."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    filename: str
    file_path: str  # Path in Supabase Storage or local
    file_type: str  # "pdf" or "docx"
    extracted_text: str | None = None
    tags: str | None = None  # Comma-separated tags, e.g., "senior, full-stack"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    user: User = Relationship(back_populates="resumes")

# =============================================================================
# JOB POSTINGS
# =============================================================================

class Job(SQLModel, table=True):
    """Job postings captured by user."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str
    company: str
    location: str | None = None
    salary_range: str | None = None
    description: str  # Full JD text
    apply_url: str | None = None
    parsed_skills: str | None = None  # Comma-separated extracted skills
    seniority_level: str | None = None  # "entry", "mid", "senior", etc.
    source: str | None = None  # "manual_paste", "url", etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    user: User = Relationship(back_populates="jobs")

# =============================================================================
# APPLICATIONS & LIFECYCLE
# =============================================================================

class ApplicationStatus(str):
    SAVED = "saved"
    APPLIED = "applied"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"

class Application(SQLModel, table=True):
    """User's application for a job."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    job_id: int | None = Field(foreign_key="job.id", nullable=True)
    resume_id: int | None = Field(foreign_key="resume.id", nullable=True)
    status: str = Field(default="saved")  # "saved", "applied", "interview", "offer", "rejected"
    notes: str | None = None
    applied_date: datetime | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="applications")

# =============================================================================
# ACTIVITY LOG (optional, for analytics)
# =============================================================================

class Activity(SQLModel, table=True):
    """Audit log of user actions."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    action: str  # "job_added", "application_status_changed", "resume_uploaded"
    details: str | None = None  # JSON string with details
    created_at: datetime = Field(default_factory=datetime.utcnow)