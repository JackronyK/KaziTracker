# ============================================================================
# 7. schemas/deadline.py
# ============================================================================
from datetime import datetime
from pydantic import BaseModel
from typing import Optional



class DeadlineCreate(BaseModel):
    application_id: int
    title: str
    due_date: datetime
    type: Optional[str] = "response"
    priority: Optional[str] = "medium"
    notes: Optional[str] = None


class DeadlineUpdate(BaseModel):
    title: Optional[str] = None
    due_date: Optional[datetime] = None
    type: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None
    notes: Optional[str] = None