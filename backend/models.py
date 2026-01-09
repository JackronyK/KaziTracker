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
    """
    ✅ CLEAN: Only stores application status workflow
    Offer details are stored in the Offer table (single source of truth)
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    job_id: int = Field(foreign_key="job.id", index=True, ondelete="CASCADE")
    resume_id: Optional[int] = Field(foreign_key="resume.id", nullable=True, ondelete="SET NULL")
    
    # ✅ Application workflow status
    status: str = Field(default="Saved", index=True) # saved, applied, interview, offer, rejected
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None    
    rejected_date: Optional[datetime] = None
    rejection_reason: Optional[str] = None    
    notes: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
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
    """
    ✅ ENHANCED: Now contains ALL offer details
    Single source of truth - no duplication in Application table
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    application_id: int = Field(foreign_key="application.id", index=True, ondelete="CASCADE")
    
    # ✅ Company & Position Info
    company_name: str
    position: str

    # ✅ ENHANCED: Comprehensive salary details
    salary: float
    currency: str = Field(default="KES") # KES, USD, EUR, GBP, ZAR, NGN, UGX, TZS
    salary_frequency: str = Field(default="monthly") # Hourly, monthly, annual

    # ✅ ENHANCED: Position & Location details
    position_type: Optional[str] = None  # Full-time, Part-time, Contract, Freelance, Internship
    location: Optional[str] = None  # On-site, Remote, Hybrid

    # ✅ ENHANCED: Dates & Benefits
    start_date: datetime
    offer_date: datetime  # When the offer was received
    deadline: datetime  # When to respond

    # ✅ ENHANCED: Benefits (stored as JSON array string)
    benefits: Optional[str] = None  # JSON: ["Health insurance", "401k", "Remote work", ...]
    notes: Optional[str] = None  # Additional offer details

    # ✅ Status tracking
    status: str = Field(default="pending", index=True)  # pending, accepted, rejected, negotiating
    negotiation_history: Optional[str] = None  # JSON array of negotiation entries
    
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
# MIGRATION NOTES
# ============================================================================
"""
🔄 MIGRATION FROM OLD SCHEMA:

1. Create new Offer columns (if adding to existing):
   ALTER TABLE offer ADD COLUMN currency VARCHAR(10) DEFAULT 'KES';
   ALTER TABLE offer ADD COLUMN salary_frequency VARCHAR(20) DEFAULT 'monthly';
   ALTER TABLE offer ADD COLUMN position_type VARCHAR(50);
   ALTER TABLE offer ADD COLUMN location VARCHAR(50);
   ALTER TABLE offer ADD COLUMN offer_date TIMESTAMP;
   ALTER TABLE offer ADD COLUMN benefits TEXT;
   ALTER TABLE offer ADD COLUMN notes TEXT;

2. Remove offer fields from Application (they never belonged there):
   - offer_details
   - offer_salary
   - offer_currency
   - offer_salary_frequency
   - offer_position_type
   - offer_location
   - offer_start_date
   - offer_benefits
   - offer_notes

3. If you had offer data in Application, migrate it to Offer table first

4. Update API endpoints to:
   - Create Offer when Application status changes to "offer"
   - Update Application to only track status workflow
   - Query Offer for all offer-related information

✅ BENEFITS OF THIS DESIGN:
   - Single source of truth (no duplication)
   - Better separation of concerns
   - Easier to query offers (all in one table)
   - Cleaner Application table (only stores status workflow)
   - Can have multiple offers per application in future
   - Better for comparisons (OfferTracker works with Offer table directly)
"""

def get_data_model_summary():
    """
    Summary of the enhanced data model:
    
    Application → Status workflow only (saved → applied → interview → offer → rejected)
    Offer       → Complete offer details (single source of truth)
    
    When status changes to "offer":
    1. Update Application.status = "offer"
    2. Create Offer record with all details
    3. OfferTracker displays from Offer table
    4. No data duplication
    """
    return {
        "application_role": "Tracks job application status workflow",
        "offer_role": "Stores complete offer details (single source of truth)",
        "relationship": "One-to-Many (Application can have multiple Offers in future)",
        "sync": "Auto-create Offer when Application status → 'offer'",
        "benefits": [
            "✅ No duplication",
            "✅ Single source of truth",
            "✅ Cleaner schema",
            "✅ Better for analytics",
            "✅ Future-proof (multiple offers per app)"
        ]
    }