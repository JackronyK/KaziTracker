# ============================================================================
# 3. routes/applications.py - Applications routes
# ============================================================================

"""
# File: routes/applications.py
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from core.database import get_session
from core.security import get_current_user
from models import Application, User, Job
from schemas import ApplicationInput, ApplicationUpdate, ApplicationResponse

router = APIRouter()


@router.post("/create", response_model=ApplicationResponse)
def create_application(app_input: ApplicationInput, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    job = session.exec(select(Job).where(Job.id == app_input.job_id, Job.user_id == user.id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    application = Application(user_id=user.id, job_id=app_input.job_id, status=app_input.status, resume_id=app_input.resume_id, notes=app_input.notes)
    session.add(application)
    session.commit()
    session.refresh(application)
    response = ApplicationResponse(**application.__dict__)
    response.company_name = job.company
    response.job_title = job.title
    return response


@router.get("/list")
def list_applications(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    apps = session.exec(select(Application).where(Application.user_id == user.id).order_by(Application.created_at.desc())).all()
    result = []
    for a in apps:
        job = session.exec(select(Job).where(Job.id == a.job_id)).first()
        response = ApplicationResponse(**a.__dict__)
        response.company_name = job.company if job else None
        response.job_title = job.title if job else None
        result.append(response)
    return result


@router.get("/get/{app_id}", response_model=ApplicationResponse)
def get_application(app_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    a = session.exec(select(Application).where(Application.id == app_id, Application.user_id == user.id)).first()
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")
    job = session.exec(select(Job).where(Job.id == a.job_id)).first()
    response = ApplicationResponse(**a.__dict__)
    response.company_name = job.company if job else None
    response.job_title = job.title if job else None
    return response


@router.patch("/update/{app_id}", response_model=ApplicationResponse)
def update_application(app_id: int, app_update: ApplicationUpdate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    a = session.exec(select(Application).where(Application.id == app_id, Application.user_id == user.id)).first()
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")
    data = app_update.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(a, k, v)
    # auto set timestamps on status changes
    if app_update.status:
        if app_update.status == "Applied" and not a.applied_date:
            a.applied_date = datetime.utcnow()
        elif app_update.status == "Interview" and not a.interview_date:
            a.interview_date = datetime.utcnow()
        elif app_update.status == "Offer" and not a.offer_date:
            a.offer_date = datetime.utcnow()
        elif app_update.status == "Rejected" and not a.rejected_date:
            a.rejected_date = datetime.utcnow()
    a.updated_at = datetime.utcnow()
    session.add(a)
    session.commit()
    session.refresh(a)
    job = session.exec(select(Job).where(Job.id == a.job_id)).first()
    response = ApplicationResponse(**a.__dict__)
    response.company_name = job.company if job else None
    response.job_title = job.title if job else None
    return response


@router.delete("/delete/{app_id}")
def delete_application(app_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    a = session.exec(select(Application).where(Application.id == app_id, Application.user_id == user.id)).first()
    if not a:
        raise HTTPException(status_code=404, detail="Application not found")
    session.delete(a)
    session.commit()
    return {"detail": "Application deleted"}
