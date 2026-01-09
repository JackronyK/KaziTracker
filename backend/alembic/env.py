# alembic/env.py
import os
import sys
from pathlib import Path
from logging.config import fileConfig
from urllib.parse import quote_plus

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine.url import URL
from sqlmodel import SQLModel

# --- Project root & python path (so imports work) ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# --- Load env file explicitly (local dev uses backend.env) ---
from dotenv import load_dotenv
dotenv_path = PROJECT_ROOT / "backend.env"
if dotenv_path.exists():
    # override=True ensures CLI env vars (ALEMBIC) can be overridden by backend.env when running locally
    load_dotenv(dotenv_path=dotenv_path, override=True)
else:
    # Not fatal — production/CI may supply DATABASE_URL via secrets
    print(f"⚠️  backend.env not found at {dotenv_path}. Relying on environment variables (DATABASE_URL).")

# --- Import your models AFTER loading env --- 
try:
    # try common locations
    try:
        # preferred: package layout
        from backend.models import *  # noqa: F403,F401
    except Exception:
        # fallback to top-level models.py
        from models import *  # noqa: F403,F401
except Exception as e:
    print("🚨 Failed to import models. Make sure your models are importable and sys.path includes project root.")
    raise

# --- Alembic config & logging ---
config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata

# --- Build DB URL: prefer DATABASE_URL if present (production/CI) ---
# If DATABASE_URL exists, use it directly. Otherwise build from POSTGRES_* env vars.
database_url_env = os.getenv("DATABASE_URL")
if database_url_env:
    db_url_str = database_url_env
else:
    DB_USER = os.getenv("POSTGRES_USER")
    DB_PASS = os.getenv("POSTGRES_PASSWORD")
    DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
    DB_PORT = os.getenv("POSTGRES_PORT", "5432")
    DB_NAME = os.getenv("POSTGRES_DB")

    required = {"POSTGRES_USER": DB_USER, "POSTGRES_PASSWORD": DB_PASS, "POSTGRES_DB": DB_NAME}
    missing = [k for k, v in required.items() if not v]
    if missing:
        raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")

    # Handle special characters in password safely via URL.create + render_as_string
    ssl_required = os.getenv("ENVIRONMENT", "").lower() == "production" or os.getenv("PGSSLMODE") == "require"
    query = {"sslmode": "require"} if ssl_required else {}

    url_obj = URL.create(
        drivername="postgresql+psycopg2",
        username=DB_USER,
        password=DB_PASS,
        host=DB_HOST,
        port=int(DB_PORT) if DB_PORT else None,
        database=DB_NAME,
        query=query,
    )
    # render with password exposed for SQLAlchemy usage
    db_url_str = url_obj.render_as_string(hide_password=False)

# --- Safety: log a masked version only ---
masked = db_url_str.replace(os.getenv("POSTGRES_PASSWORD", ""), "***") if os.getenv("POSTGRES_PASSWORD") else db_url_str
print("=" * 60)
print("Alembic using DB URL:", masked)
print("=" * 60)

# --- Set SQLAlchemy URL for Alembic to use ---
config.set_main_option("sqlalchemy.url", db_url_str)

def run_migrations_offline():
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
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        # If you need to pass connect_args (timeouts, etc.) add them as needed
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
