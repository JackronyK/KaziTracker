# ============================================================================
# 3. schemas/application.py
# ============================================================================
from datetime import datetime, date
from pydantic import BaseModel
from typing import Optional

# ============================================================================
# APPLICATION INPUT - For creating new application
# ============================================================================
class ApplicationInput(BaseModel):
    """Create new application"""
    job_id: int
    status: str = "Saved" # saved, applied, interview, offer, rejected
    resume_id: Optional[int] = None
    notes: Optional[str] = None

# ============================================================================
# APPLICATION UPDATE - For updating application status
# ============================================================================
class ApplicationUpdate(BaseModel):
    """
    ✅ UPDATE APPLICATION STATUS
    
    When status changes to "offer", include offer fields
    Backend will auto-create Offer record
    """
    status: Optional[str] = None
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    offer_date: Optional[datetime] = None
    rejected_date: Optional[datetime] = None
    resume_id: Optional[int] = None
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None

    # ✅ OFFER DETAILS (sent when status changes to "offer")
    # These are used to create/update the Offer record
    offer_salary: Optional[float] = None
    offer_currency: Optional[str] = None  # KES, USD, EUR, etc.
    offer_salary_frequency: Optional[str] = None  # monthly, annual
    offer_position_type: Optional[str] = None  # Full-time, Part-time, etc.
    offer_location: Optional[str] = None  # On-site, Remote, Hybrid
    offer_start_date: Optional[date] = None
    offer_deadline: Optional[datetime] = None  # When to respond
    offer_benefits: Optional[str] = None  # JSON array: ["benefit1", "benefit2"]
    offer_notes: Optional[str] = None
    
    class Config:
        from_attributes = True
# ============================================================================
# APPLICATION RESPONSE - For API responses
# ============================================================================
class ApplicationResponse(BaseModel):
    """
    ✅ CLEAN: Only returns application status workflow
    Offer details are in separate Offer table
    """
    id: int
    user_id: int
    job_id: int
    status: str
    resume_id: Optional[int] = None
    notes: Optional[str] = None
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    rejected_date: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    company_name: Optional[str] = None
    job_title: Optional[str] = None
    class Config:
        from_attributes = True