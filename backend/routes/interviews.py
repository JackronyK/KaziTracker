# ============================================================================
# 5. routes/interviews.py - interviews routes
# ============================================================================

"""
# File: routes/interviews.py
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from core.database import get_session
from core.security import get_current_user
from models import Application, User, Interview
from typing import List
from schemas import InterviewCreate, InterviewUpdate
router = APIRouter()



@router.get("/list", response_model=List[Interview])
def list_interviews(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Interview).where(Interview.user_id == user.id)).all()

@router.post("/create", response_model=Interview, status_code=201)
def create_interview(interview_in: InterviewCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    # verify application belongs to user
    app_obj = session.exec(select(Application).where(Application.id == interview_in.application_id, Application.user_id == user.id)).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    db_interview = Interview(
        user_id=user.id,
        application_id=interview_in.application_id,
        date=interview_in.date,
        time=interview_in.time,
        type=interview_in.type,
        interviewer=interview_in.interviewer,
        location=interview_in.location,
        notes=interview_in.notes,
        prep_checklist=interview_in.prep_checklist,
        reminders=interview_in.reminders,
    )
    session.add(db_interview)
    session.commit()
    session.refresh(db_interview)
    return db_interview


@router.get("/interviews/{interview_id}", response_model=Interview)
def get_interview(interview_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    interview = session.exec(select(Interview).where(Interview.id == interview_id, Interview.user_id == user.id)).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview



@router.put("/update/{interview_id}", response_model=Interview)
def update_interview(interview_id: int, interview_in: InterviewUpdate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    db_interview = session.exec(select(Interview).where(Interview.id == interview_id, Interview.user_id == user.id)).first()
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    update_data = interview_in.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(db_interview, k, v)
    db_interview.updated_at = datetime.utcnow()
    session.add(db_interview)
    session.commit()
    session.refresh(db_interview)
    return db_interview


@router.delete("/delete/{interview_id}", status_code=204)
def delete_interview(interview_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    interview = session.exec(select(Interview).where(Interview.id == interview_id, Interview.user_id == user.id)).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    session.delete(interview)
    session.commit()
    return
