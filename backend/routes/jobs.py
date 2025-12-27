# ============================================================================
# 2. routes/jobs.py - Job routes 
# ============================================================================

"""
# File: routes/jobs.py
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from core.database import get_session
from core.security import get_current_user
from models import User, Job
from schemas import JobInput, JobResponse


router = APIRouter()

@router.post("/create", response_model=JobResponse, status_code=201)
def create_job(job: JobInput, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    db_job = Job(
        user_id=user.id,
        title=job.title,
        company=job.company,
        location=job.location,
        salary_range=job.salary_range,
        description=job.description,
        apply_url=job.apply_url,
        parsed_skills=job.parsed_skills,
        seniority_level=job.seniority_level,
        source=job.source or "manual_paste",
    )
    session.add(db_job)
    session.commit()
    session.refresh(db_job)
    return db_job

@router.get("/list", response_model=list[JobResponse])
def list_jobs(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    jobs = session.exec(select(Job).where(Job.user_id == user.id).order_by(Job.created_at.desc())).all()
    return jobs

@router.get("/get/{job_id}", response_model=JobResponse)
def get_job(job_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    job = session.exec(select(Job).where(Job.id == job_id, Job.user_id == user.id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.patch("/update/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_update: JobInput, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    job = session.exec(select(Job).where(Job.id == job_id, Job.user_id == user.id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job_data = job_update.model_dump(exclude_unset=True)
    for key, value in job_data.items():
        setattr(job, key, value)
    session.add(job)
    session.commit()
    session.refresh(job)
    return job

@router.delete("/delete/{job_id}", status_code=204)
def delete_job(job_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    job = session.exec(select(Job).where(Job.id == job_id, Job.user_id == user.id)).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    session.delete(job)
    session.commit()
    return {"detail": "Job deleted"}