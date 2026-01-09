# ============================================================================
# 6. routes/offers.py - offers routes
# ============================================================================
"""
Offers Routes - Updated for new database structure
Offer is now the single source of truth
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from core.database import get_session
from core.security import get_current_user
from models import Application, User, Offer, Job
from schemas import OfferCreate, OfferUpdate, OfferResponse, OfferWithApplication
from typing import List

router = APIRouter()

@router.get("/list", response_model=List[OfferResponse])
def list_offers(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """List all offers for user"""
    
    return session.exec(
        select(Offer)
        .where(Offer.user_id == user.id)
        .order_by(Offer.created_at.desc())
    ).all()

@router.get("/application/{app_id}", response_model=List[OfferResponse])
def get_application_offers(
    app_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get offers for specific application"""
    
    # Verify application belongs to user
    app = session.exec(
        select(Application).where(
            Application.id == app_id,
            Application.user_id == user.id
        )
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return session.exec(
        select(Offer).where(Offer.application_id == app_id)
    ).all()

@router.get("list/{offer_id}", response_model=OfferResponse)
def get_offer(
    offer_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get single offer"""
    
    offer = session.exec(
        select(Offer).where(
            Offer.id == offer_id,
            Offer.user_id == user.id
        )
    ).first()
    
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    return offer

@router.post("/create", response_model=OfferResponse, status_code=201)
def create_offer(
    offer_in: OfferCreate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    ✅ CREATE OFFER DIRECTLY
    Can also be auto-created from Application status update
    """
    
    # Verify application exists and belongs to user
    app = session.exec(
        select(Application).where(
            Application.id == offer_in.application_id,
            Application.user_id == user.id
        )
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Create offer
    db_offer = Offer(
        user_id=user.id,
        application_id=offer_in.application_id,
        company_name=offer_in.company_name,
        position=offer_in.position,
        salary=offer_in.salary,
        currency=offer_in.currency or "KES",
        salary_frequency=offer_in.salary_frequency or "monthly",
        position_type=offer_in.position_type,
        location=offer_in.location,
        start_date=offer_in.start_date,
        offer_date=offer_in.offer_date,
        deadline=offer_in.deadline,
        benefits=offer_in.benefits,
        notes=offer_in.notes,
        status=offer_in.status or "pending",
    )
    
    session.add(db_offer)
    session.commit()
    session.refresh(db_offer)
    
    return db_offer


@router.put("/update/{offer_id}", response_model=OfferResponse)
def update_offer(
    offer_id: int,
    offer_in: OfferUpdate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update offer"""
    
    db_offer = session.exec(
        select(Offer).where(
            Offer.id == offer_id,
            Offer.user_id == user.id
        )
    ).first()
    
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    # Update fields
    data = offer_in.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(db_offer, k, v)
    
    db_offer.updated_at = datetime.utcnow()
    session.add(db_offer)
    session.commit()
    session.refresh(db_offer)
    
    return db_offer


@router.delete("/delete/{offer_id}", status_code=204)
def delete_offer(
    offer_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete offer"""
    
    db_offer = session.exec(
        select(Offer).where(
            Offer.id == offer_id,
            Offer.user_id == user.id
        )
    ).first()
    
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    session.delete(db_offer)
    session.commit()
    
    return None