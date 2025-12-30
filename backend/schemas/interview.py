# ============================================================================
# 5. schemas/interview.py
# ============================================================================
from datetime import datetime
from pydantic import BaseModel
from typing import Optional



# Pydantic / input DTOs (use for request bodies)
class InterviewCreate(BaseModel):
    application_id: int
    date: datetime
    time: str
    type: Optional[str] = "phone"
    interviewer: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    prep_checklist: Optional[str] = None
    reminders: Optional[bool] = True


class InterviewUpdate(BaseModel):
    date: Optional[datetime] = None
    time: Optional[str] = None
    type: Optional[str] = None
    interviewer: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    prep_checklist: Optional[str] = None
    reminders: Optional[bool] = None