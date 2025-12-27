# ============================================================================
# 6. routes/offers.py - offers routes
# ============================================================================

"""
# File: routes/offers.py
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from core.database import get_session
from core.security import get_current_user
from models import Application, User, Offer
from schemas import OfferCreate, OfferUpdate
from typing import List

router = APIRouter()

@router.get("/list", response_model=List[Offer])
def list_offers(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Offer).where(Offer.user_id == user.id).order_by(Offer.created_at.desc())).all()


@router.post("/create", response_model=Offer, status_code=201)
def create_offer(offer_in: OfferCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    app_obj = session.exec(select(Application).where(Application.id == offer_in.application_id, Application.user_id == user.id)).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    db_offer = Offer(
        user_id=user.id,
        application_id=offer_in.application_id,
        company_name=offer_in.company_name,
        position=offer_in.position,
        salary=offer_in.salary,
        benefits=offer_in.benefits,
        start_date=offer_in.start_date,
        deadline=offer_in.deadline,
        status=offer_in.status or "pending",
    )
    session.add(db_offer)
    session.commit()
    session.refresh(db_offer)
    return db_offer


@router.put("/update/{offer_id}", response_model=Offer)
def update_offer(offer_id: int, offer_in: OfferUpdate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    db_offer = session.exec(select(Offer).where(Offer.id == offer_id, Offer.user_id == user.id)).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    data = offer_in.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(db_offer, k, v)
    db_offer.updated_at = datetime.utcnow()
    session.add(db_offer)
    session.commit()
    session.refresh(db_offer)
    return db_offer


@router.delete("/delete/{offer_id}", status_code=204)
def delete_offer(offer_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    db_offer = session.exec(select(Offer).where(Offer.id == offer_id, Offer.user_id == user.id)).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    session.delete(db_offer)
    session.commit()
    return