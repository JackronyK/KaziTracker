# ============================================================================
# 1. core/config.py - Configuration Management
# ============================================================================

"""
# File: core/config.py
"""
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

ENV = os.getenv("ENV", "dev").lower()
if ENV != "prod":
    load_dotenv("backend.env")

# Database
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DB_USER = os.getenv("POSTGRES_USER")
    DB_PASS = os.getenv("POSTGRES_PASSWORD")
    DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
    DB_PORT = os.getenv("POSTGRES_PORT", "5432")
    DB_NAME = os.getenv("POSTGRES_DB")
    if not all([DB_USER, DB_PASS, DB_NAME]):
        raise RuntimeError("DATABASE_URL not set and POSTGRES_{USER,PASSWORD,DB} incomplete")
    DB_PASS_ENC = quote_plus(DB_PASS)
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASS_ENC}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# JWT
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))

# File uploads
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# LLM
USE_LLM = os.getenv("USE_LLM", "false").lower() == "true"

# CORS
CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",") if os.getenv("CORS_ALLOW_ORIGINS") else ["*"]

# App
APP_NAME = "JobAppTracker API"
APP_VERSION = "0.1.0"