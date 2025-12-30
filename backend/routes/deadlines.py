# ============================================================================
# 7. routes/deadlines.py - deadlines routes
# ============================================================================

"""
# File: routes/deadlines.py
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from core.database import get_session
from core.security import get_current_user
from models import Application, User, Deadline
from schemas import DeadlineCreate, DeadlineUpdate
from typing import List

router = APIRouter()


@router.get("/list", response_model=List[Deadline])
def list_deadlines(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return session.exec(select(Deadline).where(Deadline.user_id == user.id).order_by(Deadline.due_date)).all()


@router.post("/create", response_model=Deadline, status_code=201)
def create_deadline(deadline_in: DeadlineCreate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    app_obj = session.exec(select(Application).where(Application.id == deadline_in.application_id, Application.user_id == user.id)).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    db_deadline = Deadline(
        user_id=user.id,
        application_id=deadline_in.application_id,
        title=deadline_in.title,
        due_date=deadline_in.due_date,
        type=deadline_in.type,
        priority=deadline_in.priority,
        notes=deadline_in.notes,
    )
    session.add(db_deadline)
    session.commit()
    session.refresh(db_deadline)
    return db_deadline


@router.put("/update/{deadline_id}", response_model=Deadline)
def update_deadline(deadline_id: int, deadline_in: DeadlineUpdate, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    db_deadline = session.exec(select(Deadline).where(Deadline.id == deadline_id, Deadline.user_id == user.id)).first()
    if not db_deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")
    data = deadline_in.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(db_deadline, k, v)
    db_deadline.updated_at = datetime.utcnow()
    session.add(db_deadline)
    session.commit()
    session.refresh(db_deadline)
    return db_deadline


@router.delete("/delete/{deadline_id}", status_code=204)
def delete_deadline(deadline_id: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    db_deadline = session.exec(select(Deadline).where(Deadline.id == deadline_id, Deadline.user_id == user.id)).first()
    if not db_deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")
    session.delete(db_deadline)
    session.commit()
    return

