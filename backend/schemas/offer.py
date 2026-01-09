# ============================================================================
# 6. schemas/offer.py
# ============================================================================
"""
Offer Schemas - Updated with all new fields
Offer is now the single source of truth for offer details
"""
from datetime import datetime, date
from pydantic import BaseModel
from typing import Optional

# ============================================================================
# OFFER CREATE - For creating new offer
# ============================================================================
class OfferCreate(BaseModel):
    """
    ✅ CREATE NEW OFFER with all details
    Can be called directly or auto-created from Application status update
    """
    application_id: int
    company_name: str
    position: str
    
    # Salary details
    salary: float
    currency: str = "KES"  # KES, USD, EUR, GBP, ZAR, NGN, UGX, TZS
    salary_frequency: str = "monthly"  # monthly, annual
    
    # Position & Location
    position_type: Optional[str] = None  # Full-time, Part-time, Contract, etc.
    location: Optional[str] = None  # On-site, Remote, Hybrid
    
    # Dates
    start_date: date
    offer_date: date  # When offer was received
    deadline: datetime  # When to respond
    
    # Details
    benefits: Optional[str] = None  # JSON array
    notes: Optional[str] = None
    status: Optional[str] = "pending"  # pending, accepted, rejected, negotiating
    
    class Config:
        from_attributes = True


# ============================================================================
# OFFER UPDATE - For updating existing offer
# ============================================================================
class OfferUpdate(BaseModel):
    """Update offer fields"""
    
    company_name: Optional[str] = None
    position: Optional[str] = None
    salary: Optional[float] = None
    currency: Optional[str] = None
    salary_frequency: Optional[str] = None
    position_type: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    offer_date: Optional[date] = None
    deadline: Optional[datetime] = None
    benefits: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None  # pending, accepted, rejected, negotiating
    negotiation_history: Optional[str] = None
    
    class Config:
        from_attributes = True

    

# ============================================================================
# OFFER RESPONSE - For API responses
# ============================================================================
class OfferResponse(BaseModel):
    """
    ✅ COMPLETE OFFER DETAILS
    Single source of truth for all offer information
    """
    id: int
    user_id: int
    application_id: int
    
    company_name: str
    position: str
    salary: float
    currency: str
    salary_frequency: str
    
    position_type: Optional[str] = None
    location: Optional[str] = None
    
    start_date: date
    offer_date: date
    deadline: datetime
    
    benefits: Optional[str] = None
    notes: Optional[str] = None
    status: str
    negotiation_history: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# OFFER WITH APPLICATION - For combined view
# ============================================================================
class OfferWithApplication(OfferResponse):
    """Offer + Application details combined"""
    
    # Application info
    app_status: Optional[str] = None
    job_title: Optional[str] = None
    
    class Config:
        from_attributes = True