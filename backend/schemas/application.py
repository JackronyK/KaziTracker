# ============================================================================
# 3. schemas/application.py
# ============================================================================
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class ApplicationInput(BaseModel):
    job_id: int
    status: str = "Saved"
    resume_id: Optional[int] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    offer_date: Optional[datetime] = None
    rejected_date: Optional[datetime] = None
    resume_id: Optional[int] = None
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    offer_details: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str
    resume_id: Optional[int] = None
    notes: Optional[str] = None
    applied_date: Optional[datetime] = None
    interview_date: Optional[datetime] = None
    offer_date: Optional[datetime] = None
    rejected_date: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    offer_details: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    company_name: Optional[str] = None
    job_title: Optional[str] = None
