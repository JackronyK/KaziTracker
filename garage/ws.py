# ============================================================================
# routes/applications.py - UPDATED
# ============================================================================
"""
Applications Routes - Updated for new database structure
Now auto-creates Offer when status changes to "offer"
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from core.database import get_session
from core.security import get_current_user
from models import Application, User, Job, Offer
from schemas import ApplicationInput, ApplicationUpdate, ApplicationResponse
import json

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("/create", response_model=ApplicationResponse)
def create_application(
    app_input: ApplicationInput,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create new application"""
    
    # Verify job exists and belongs to user
    job = session.exec(
        select(Job).where(
            Job.id == app_input.job_id,
            Job.user_id == user.id
        )
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Create application
    application = Application(
        user_id=user.id,
        job_id=app_input.job_id,
        status=app_input.status.lower(),  # Normalize to lowercase
        resume_id=app_input.resume_id,
        notes=app_input.notes
    )
    
    session.add(application)
    session.commit()
    session.refresh(application)
    
    # Build response
    response = ApplicationResponse(**application.__dict__)
    response.company_name = job.company
    response.job_title = job.title
    
    return response


@router.get("/list")
def list_applications(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """List all applications for user"""
    
    apps = session.exec(
        select(Application)
        .where(Application.user_id == user.id)
        .order_by(Application.created_at.desc())
    ).all()
    
    result = []
    for a in apps:
        job = session.exec(select(Job).where(Job.id == a.job_id)).first()
        response = ApplicationResponse(**a.__dict__)
        response.company_name = job.company if job else None
        response.job_title = job.title if job else None
        result.append(response)
    
    return result


@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get single application"""
    
    a = session.exec(
        select(Application).where(
            Application.id == app_id,
            Application.user_id == user.id
        )
    ).first()
    
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")
    
    job = session.exec(select(Job).where(Job.id == a.job_id)).first()
    response = ApplicationResponse(**a.__dict__)
    response.company_name = job.company if job else None
    response.job_title = job.title if job else None
    
    return response


@router.patch("/{app_id}", response_model=ApplicationResponse)
def update_application(
    app_id: int,
    app_update: ApplicationUpdate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    ✅ UPDATE APPLICATION STATUS
    
    Features:
    - Updates application status and dates
    - Auto-creates Offer when status changes to "offer"
    - No duplication: offer details only stored in Offer table
    """
    
    # Get application
    a = session.exec(
        select(Application).where(
            Application.id == app_id,
            Application.user_id == user.id
        )
    ).first()
    
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Track old status
    old_status = a.status.lower() if a.status else None
    new_status = app_update.status.lower() if app_update.status else old_status
    
    # ✅ UPDATE APPLICATION FIELDS (status workflow only)
    if app_update.status is not None:
        a.status = new_status
    if app_update.applied_date is not None:
        a.applied_date = app_update.applied_date
    if app_update.interview_date is not None:
        a.interview_date = app_update.interview_date
    if app_update.rejected_date is not None:
        a.rejected_date = app_update.rejected_date
    if app_update.rejection_reason is not None:
        a.rejection_reason = app_update.rejection_reason
    if app_update.resume_id is not None:
        a.resume_id = app_update.resume_id
    if app_update.notes is not None:
        a.notes = app_update.notes
    
    # Auto-set timestamps on status changes
    if app_update.status:
        if app_update.status.lower() == "applied" and not a.applied_date:
            a.applied_date = datetime.utcnow()
        elif app_update.status.lower() == "interview" and not a.interview_date:
            a.interview_date = datetime.utcnow()
        elif app_update.status.lower() == "rejected" and not a.rejected_date:
            a.rejected_date = datetime.utcnow()
    
    a.updated_at = datetime.utcnow()
    
    # ============================================================================
    # ✅ AUTO-CREATE OFFER WHEN STATUS CHANGES TO "OFFER"
    # ============================================================================
    if new_status == "offer" and old_status != "offer":
        """
        When transitioning to offer status:
        1. Check if offer already exists
        2. If not, create new Offer with all details
        3. Link to Application
        """
        
        # Get linked job for company/position info
        job = session.exec(select(Job).where(Job.id == a.job_id)).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Check if offer already exists
        existing_offer = session.exec(
            select(Offer).where(Offer.application_id == app_id)
        ).first()
        
        if not existing_offer:
            # Parse benefits if provided
            benefits_json = None
            if app_update.offer_benefits:
                try:
                    if isinstance(app_update.offer_benefits, str):
                        benefits_json = app_update.offer_benefits  # Already JSON
                    else:
                        benefits_json = json.dumps(app_update.offer_benefits)
                except json.JSONDecodeError:
                    benefits_json = None
            
            # Create new Offer record
            new_offer = Offer(
                user_id=user.id,
                application_id=app_id,
                company_name=job.company,
                position=job.title,
                salary=app_update.offer_salary or 0,
                currency=app_update.offer_currency or "KES",
                salary_frequency=app_update.offer_salary_frequency or "monthly",
                position_type=app_update.offer_position_type,
                location=app_update.offer_location,
                start_date=app_update.offer_start_date or datetime.utcnow().date(),
                offer_date=datetime.utcnow().date(),
                deadline=app_update.offer_deadline or datetime.utcnow(),
                benefits=benefits_json,
                notes=app_update.offer_notes,
                status="pending",
            )
            
            session.add(new_offer)
        else:
            # ✅ Update existing offer with new details
            if app_update.offer_salary:
                existing_offer.salary = app_update.offer_salary
            if app_update.offer_currency:
                existing_offer.currency = app_update.offer_currency
            if app_update.offer_salary_frequency:
                existing_offer.salary_frequency = app_update.offer_salary_frequency
            if app_update.offer_position_type:
                existing_offer.position_type = app_update.offer_position_type
            if app_update.offer_location:
                existing_offer.location = app_update.offer_location
            if app_update.offer_start_date:
                existing_offer.start_date = app_update.offer_start_date
            if app_update.offer_deadline:
                existing_offer.deadline = app_update.offer_deadline
            if app_update.offer_notes:
                existing_offer.notes = app_update.offer_notes
            if app_update.offer_benefits:
                try:
                    if isinstance(app_update.offer_benefits, str):
                        existing_offer.benefits = app_update.offer_benefits
                    else:
                        existing_offer.benefits = json.dumps(app_update.offer_benefits)
                except:
                    pass
            
            existing_offer.updated_at = datetime.utcnow()
    
    # Save all changes
    session.add(a)
    session.commit()
    session.refresh(a)
    
    # Build response
    job = session.exec(select(Job).where(Job.id == a.job_id)).first()
    response = ApplicationResponse(**a.__dict__)
    response.company_name = job.company if job else None
    response.job_title = job.title if job else None
    
    return response


@router.delete("/{app_id}")
def delete_application(
    app_id: int,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete application (and cascades to offers, interviews, deadlines)"""
    
    a = session.exec(
        select(Application).where(
            Application.id == app_id,
            Application.user_id == user.id
        )
    ).first()
    
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")
    
    session.delete(a)
    session.commit()
    
    return {"detail": "Application deleted"}


# ============================================================================
# routes/offers.py - UPDATED
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

router = APIRouter(prefix="/offers", tags=["offers"])


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


@router.get("/{offer_id}", response_model=OfferResponse)
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


@router.put("/{offer_id}", response_model=OfferResponse)
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


@router.delete("/{offer_id}", status_code=204)
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