# ============================================================================
# 6. schemas/offer.py
# ============================================================================
from datetime import datetime
from pydantic import BaseModel
from typing import Optional



class OfferCreate(BaseModel):
    application_id: int
    company_name: str
    position: str
    salary: float
    benefits: Optional[str] = None
    start_date: datetime
    deadline: datetime
    status: Optional[str] = "pending"


class OfferUpdate(BaseModel):
    salary: Optional[float] = None
    status: Optional[str] = None
    negotiation_history: Optional[str] = None