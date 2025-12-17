"""
Database Models for KaziTracker
Complete data models for all phases
"""

from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

# =============================================================================
# USER & AUTHENTICATION (Phase 1-2)
# =============================================================================

class User(SQLModel, table=True):
    """
    User account model
    
    Stores user authentication and acts as a root for all user data.
    Relationships connect to all other entities.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationships (back_populates enables bi-directional access)
    jobs: List["Job"] = Relationship(back_populates="user")
    resumes: List["Resume"] = Relationship(back_populates="user")
    applications: List["Application"] = Relationship(back_populates="user")
    activity_logs: List["Activity"] = Relationship(back_populates="user")

# =============================================================================
# JOB POSTINGS (Phase 3)
# =============================================================================

class Job(SQLModel, table=True):
    """
    Job posting model
    
    Stores job listings that users save for reference.
    Users can create multiple applications from a single job.
    
    Phase 3 Features:
    - CRUD operations
    - Smart parser extracts details
    - Search by title/company
    - Filter by seniority level
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    
    # Job Details
    title: str = Field(index=True)  # Indexed for search
    company: str = Field(index=True)  # Indexed for search
    location: Optional[str] = Field(default=None)
    salary_range: Optional[str] = Field(default=None)
    
    # Job Content
    description: str  # Full job description text
    apply_url: Optional[str] = Field(default=None)
    
    # Extracted Data (from parser)
    parsed_skills: Optional[str] = Field(
        default=None,
        description="Comma-separated skills extracted from JD"
    )
    seniority_level: Optional[str] = Field(
        default=None,
        description="entry, junior, mid, senior, lead"
    )
    source: Optional[str] = Field(
        default="manual_paste",
        description="manual_paste, url_import, linkedin, etc."
    )
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="jobs")
    applications: List["Application"] = Relationship(back_populates="job")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "title": "Senior Python Engineer",
                "company": "Google",
                "location": "Mountain View, CA",
                "salary_range": "$200K - $250K",
                "seniority_level": "Senior",
                "parsed_skills": "Python, Golang, Kubernetes",
                "source": "manual_paste",
            }
        }

# =============================================================================
# RESUME MANAGEMENT (Phase 5)
# =============================================================================

class Resume(SQLModel, table=True):
    """
    Resume/CV model
    
    Stores user's resume files and metadata.
    Users can upload multiple versions and tag them by role/context.
    
    Phase 5 Features:
    - Upload PDF/DOCX files
    - Tag system for organization
    - Search by filename
    - Filter by tags
    - Link to applications
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    
    # File Information
    filename: str = Field(index=True)  # Original filename for search
    file_path: str  # Path to stored file (local or cloud storage)
    file_type: str = Field(
        description="pdf or docx"
    )
    file_size: Optional[int] = Field(default=None)  # Size in bytes
    
    # Content
    extracted_text: Optional[str] = Field(
        default=None,
        description="First 1000 chars of extracted resume text"
    )
    
    # Tagging & Organization
    tags: Optional[str] = Field(
        default=None,
        description="Comma-separated tags (e.g., 'Senior,Backend,2024')"
    )
    
    # Timestamps
    uploaded_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="resumes")
    applications: List["Application"] = Relationship(back_populates="resume")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "filename": "my-resume-2024.pdf",
                "file_type": "pdf",
                "file_size": 245000,
                "tags": "Senior,Backend,Python",
                "uploaded_at": "2024-01-15T10:30:00",
            }
        }

# =============================================================================
# APPLICATIONS & LIFECYCLE (Phase 4)
# =============================================================================

class Application(SQLModel, table=True):
    """
    Application tracking model
    
    Tracks each job application through its complete lifecycle.
    Manages status changes with automatic date tracking.
    
    Phase 4 Features:
    - Full lifecycle tracking: Saved → Applied → Interview → Offer/Rejected
    - Status management with automatic dates
    - Resume association
    - Notes for follow-ups
    - Real-time dashboard integration
    
    Status Flow:
    Saved (initial state)
      ↓
    Applied (resume submitted)
      ↓
    Interview (got call/scheduled)
      ↓
    ├─ Offer (job offer received) ✓
    └─ Rejected (not selected)
    """
    
    # Primary Keys
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    job_id: int = Field(foreign_key="job.id", index=True)
    
    # Status Tracking
    status: str = Field(
        default="Saved",
        index=True,
        description="Saved, Applied, Interview, Offer, Rejected"
    )
    
    # Lifecycle Dates (auto-set by backend, can be manually adjusted)
    applied_date: Optional[datetime] = Field(
        default=None,
        nullable=True,
        index=True,
        description="When resume was submitted"
    )
    interview_date: Optional[datetime] = Field(
        default=None,
        nullable=True,
        description="When interview is/was scheduled"
    )
    offer_date: Optional[datetime] = Field(
        default=None,
        nullable=True,
        description="When offer was received"
    )
    rejected_date: Optional[datetime] = Field(
        default=None,
        nullable=True,
        description="When rejection notification received"
    )
    
    # Links to other entities
    resume_id: Optional[int] = Field(
        default=None,
        foreign_key="resume.id",
        nullable=True,
        description="Which resume was used for this application"
    )
    
    # Additional Context
    notes: Optional[str] = Field(
        default=None,
        nullable=True,
        description="User notes (e.g., 'Referral from John', 'Follow up Friday')"
    )
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="applications")
    job: "Job" = Relationship(back_populates="applications")
    resume: Optional["Resume"] = Relationship(back_populates="applications")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "job_id": 1,
                "status": "Applied",
                "applied_date": "2024-01-15T10:30:00",
                "interview_date": None,
                "offer_date": None,
                "rejected_date": None,
                "resume_id": 1,
                "notes": "Applied through LinkedIn referral",
                "created_at": "2024-01-15T10:30:00",
                "updated_at": "2024-01-15T10:30:00",
            }
        }

# =============================================================================
# ACTIVITY LOG (Phase 6 Analytics & Phase 7 Premium)
# =============================================================================

class Activity(SQLModel, table=True):
    """
    User activity log
    
    Audit trail of all user actions for analytics and insights.
    
    Phase 6 Uses:
    - Calculate statistics
    - Track application flow
    - Measure engagement
    
    Phase 7 Uses:
    - Rejection analysis
    - Success patterns
    - Recommendations
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    
    # Action Information
    action: str = Field(
        index=True,
        description="job_added, job_updated, job_deleted, application_created, "
                    "application_status_changed, resume_uploaded, resume_deleted"
    )
    
    # Context
    entity_type: Optional[str] = Field(
        default=None,
        description="job, application, resume, etc."
    )
    entity_id: Optional[int] = Field(
        default=None,
        description="ID of the affected entity"
    )
    
    # Details
    details: Optional[str] = Field(
        default=None,
        description="JSON string with additional context"
    )
    
    # Timestamp
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    
    # Relationship
    user: User = Relationship(back_populates="activity_logs")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "action": "application_status_changed",
                "entity_type": "application",
                "entity_id": 1,
                "details": '{"old_status": "Applied", "new_status": "Interview"}',
                "created_at": "2024-01-15T10:30:00",
            }
        }

# =============================================================================
# MODEL SUMMARY & RELATIONSHIPS
# =============================================================================

"""
DATA MODEL RELATIONSHIPS:

User (1) ──────── (N) Job
  ├─ Create jobs
  ├─ Search/filter jobs
  └─ Track job sources

User (1) ──────── (N) Resume
  ├─ Upload multiple versions
  ├─ Tag resumes
  └─ Search by filename/tag

User (1) ──────── (N) Application
  ├─ Create applications
  ├─ Update status lifecycle
  └─ Track all data per user

Job (1) ──────── (N) Application
  └─ Multiple applications per job

Resume (1) ──────── (N) Application
  └─ One resume per application (optional)

User (1) ──────── (N) Activity
  └─ All user actions logged

INDEXES FOR PERFORMANCE:
- User.email (unique, fast login)
- Job.title, Job.company (search)
- Resume.filename (search)
- Application.status (filter dashboard)
- Application.created_at (sorting)
- All user_id fields (data isolation)
- All created_at fields (timeline sorting)

PHASES COVERAGE:
Phase 1-2: User auth & relationships
Phase 3: Job CRUD with search/filter
Phase 4: Application lifecycle tracking
Phase 5: Resume upload & management
Phase 6: Activity log for analytics
Phase 7: Activity analysis for insights
Phase 8: Data export from complete models
"""