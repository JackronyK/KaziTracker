
# ============================================================================
# 2. core/database.py - Database Setup
# ============================================================================

"""
# File: core/database.py
"""
from sqlmodel import Session, create_engine, SQLModel
from core.config import DATABASE_URL, ENV

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

def init_db():
    """Initialize database (create tables if needed - dev only)"""
    if ENV != "prod":
        SQLModel.metadata.create_all(engine)
        print("✓ Database tables ensured (dev mode)")

def get_session():
    """Get SQLModel session"""
    with Session(engine) as session:
        yield session

# Backwards compatibility
def get_db():
    """Alias for get_session"""
    with Session(engine) as session:
        yield session
