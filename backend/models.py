"""
Database Models for KaziTracker
Production-ready with proper cascade delete handling
"""
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

# ======================================
# 1️⃣ USER
# ======================================
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=True)

    full_name: Optional[str] = Field(default=None, nullable=True)
    phone_number: Optional[str] = Field(default=None, nullable=True)
    location: Optional[str] = Field(default=None, nullable=True)
    headline: Optional[str] = Field(default=None, nullable=True)

    jobs: list["Job"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    resumes: list["Resume"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    applications: list["Application"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    activity_logs: list["Activity"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    interviews: list["Interview"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    offers: list["Offer"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    deadlines: list["Deadline"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


# ======================================
# 2️⃣ JOB
# ======================================
class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    title: str = Field(index=True)
    company: str = Field(index=True)
    location: Optional[str] = None
    salary_range: Optional[str] = None
    description: str
    apply_url: Optional[str] = None
    parsed_skills: Optional[str] = None
    seniority_level: Optional[str] = None
    source: Optional[str] = Field(default="manual_paste")
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="jobs")
    applications: list["Application"] = Relationship(back_populates="job", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


# ======================================
# 3️⃣ RESUME
# ======================================
class Resume(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    filename: str = Field(index=True)
    file_path: str
    file_type: str
    file_size: Optional[int] = None
    extracted_text: Optional[str] = None
    tags: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="resumes")
    applications: list["Application"] = Relationship(back_populates="resume", sa_relationship_kwargs={"cascade": "save-update, merge", "passive_deletes": True})


# ======================================
# 4️⃣ ACTIVITY
# ======================================
class Activity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    action: str = Field(index=True)
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    details: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    user: User = Relationship(back_populates="activity_logs")


# ======================================
# 5️⃣ APPLICATION
# ======================================
class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    job_id: int = Field(foreign_key="job.id", index=True, ondelete="CASCADE")
    resume_id: Optional[int] = Field(foreign_key="resume.id", nullable=True, ondelete="SET NULL")
    status: str = Field(default="Saved", index=True)
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    offer_date: Optional[datetime] = None
    rejected_date: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    offer_details: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="applications")
    job: Job = Relationship(back_populates="applications")
    resume: Optional[Resume] = Relationship(back_populates="applications")
    interviews: list["Interview"] = Relationship(back_populates="application", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    offers: list["Offer"] = Relationship(back_populates="application", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    deadlines: list["Deadline"] = Relationship(back_populates="application", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


# ======================================
# 6️⃣ INTERVIEW
# ======================================
class Interview(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    application_id: int = Field(foreign_key="application.id", index=True, ondelete="CASCADE")
    date: datetime
    time: str
    type: str = Field(default="phone")
    interviewer: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    prep_checklist: Optional[str] = None
    reminders: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="interviews")
    application: Application = Relationship(back_populates="interviews")


# ======================================
# 7️⃣ OFFER
# ======================================
class Offer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    application_id: int = Field(foreign_key="application.id", index=True, ondelete="CASCADE")
    company_name: str
    position: str
    salary: float
    benefits: Optional[str] = None
    start_date: datetime
    deadline: datetime
    status: str = Field(default="pending", index=True)
    negotiation_history: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="offers")
    application: Application = Relationship(back_populates="offers")


# ======================================
# 8️⃣ DEADLINE
# ======================================
class Deadline(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    application_id: int = Field(foreign_key="application.id", index=True, ondelete="CASCADE")
    title: str
    due_date: datetime = Field(index=True)
    type: str = Field(default="response")
    priority: str = Field(default="medium")
    completed: bool = Field(default=False, index=True)
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

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