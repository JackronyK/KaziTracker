# alembic/env.py
import os
import sys
from pathlib import Path
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine.url import URL
from alembic import context
from sqlmodel import SQLModel
from urllib.parse import quote_plus

# 🔑 STEP 1: SET PROJECT ROOT FIRST (needed for both path and env file)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# 🔑 STEP 2: EXPLICITLY LOAD backend.env
from dotenv import load_dotenv
dotenv_path = PROJECT_ROOT / "backend.env"
if not dotenv_path.exists():
    print(f"🚨 CRITICAL: Env file NOT FOUND at {dotenv_path}")
    print(f"📂 Project root: {PROJECT_ROOT}")
    print(f"🔍 Check your file is named EXACTLY 'backend.env' (not .evn or backend-env)")
    raise SystemExit(1)  # Fail immediately

# ⚠️ override=True is ESSENTIAL when running CLI commands like `alembic upgrade`
load_dotenv(dotenv_path=dotenv_path, override=True)

# Now safely import models (after env vars are loaded!)
try:
    from models import *  # noqa: F403
except ImportError as e:
    print(f"🚨 MODEL IMPORT FAILED: {e}")
    print(f"🔍 PYTHONPATH: {sys.path}")
    raise

# Get Alembic config object
config = context.config  # ✅ CORRECT ASSIGNMENT

# Setup logging
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata

# Get DB credentials with defaults
DB_USER = os.getenv("POSTGRES_USER")
DB_PASS = os.getenv("POSTGRES_PASSWORD")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")  # Default port
DB_NAME = os.getenv("POSTGRES_DB")


# Validate required vars
required_vars = {
    "POSTGRES_USER": DB_USER,
    "POSTGRES_PASSWORD": DB_PASS,
    "POSTGRES_DB": DB_NAME
}
missing = [k for k, v in required_vars.items() if not v]
if missing:
    raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")

SAFE_PASSWORD = quote_plus(DB_PASS)  # Handles ALL special characters


db_url = URL.create(
    drivername="postgresql+psycopg2",
    username=DB_USER,
    password=SAFE_PASSWORD,  # Use encoded version
    host=DB_HOST,
    port=int(DB_PORT),
    database=DB_NAME
).render_as_string(hide_password=False)  # Get string representation

print("="*60)
print("🔐 DEBUG: Password Handling")
print(f"Raw password length: {len(DB_PASS)}")
print(f"Full DB URL: {db_url.replace("Admin_123", "***")}")
print("="*60)


# Add SSL for production
if os.getenv("ENVIRONMENT") == "production":
    db_url = db_url.update_query_dict({"sslmode": "require"})

# Set in Alembic config
config.set_main_option("sqlalchemy.url", str(db_url))


def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args={
            "connect_timeout": 10,
            "keepalives": 1,          # CORRECT parameter name
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5
        }
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()