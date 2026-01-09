import csv
import os
from pathlib import Path
from datetime import datetime
from sqlalchemy import create_engine, MetaData, Table, select
from dotenv import load_dotenv  # If using .env for credentials

# --- Load env file explicitly (local dev uses backend.env) ---
PROJECT_ROOT = Path(__file__).resolve().parent.parent
from dotenv import load_dotenv
dotenv_path = PROJECT_ROOT / "backend.env"
if dotenv_path.exists():
    # override=True ensures CLI env vars (ALEMBIC) can be overridden by backend.env when running locally
    load_dotenv(dotenv_path=dotenv_path, override=True)
else:
    # Not fatal — production/CI may supply DATABASE_URL via secrets
    print(f"⚠️  backend.env not found at {dotenv_path}. Relying on environment variables (DATABASE_URL).")

DATABASE_URL = os.getenv("DATABASE_URL")  # Format: postgres://user:pass@host/db

# Create backup directory with timestamp
backup_dir = f"backup_offers_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
os.makedirs(backup_dir, exist_ok=True)
print(f"✅ Created backup directory: {backup_dir}")

engine = create_engine(DATABASE_URL)
metadata = MetaData()
metadata.reflect(bind=engine)

# Tables to backup (critical for your migration)
TABLES = ["application", "offer"]

for table_name in TABLES:
    try:
        table = Table(table_name, metadata, autoload_with=engine)
        with engine.connect() as conn:
            # Get column names and data
            result = conn.execute(select(table))
            rows = result.fetchall()
            columns = result.keys()
            
            # Save as CSV
            csv_path = os.path.join(backup_dir, f"{table_name}.csv")
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(columns)  # Header row
                writer.writerows(rows)    # Data rows
            
            print(f"✅ Backed up {len(rows)} rows from {table_name} → {csv_path}")
    
    except Exception as e:
        print(f"❌ Failed to backup {table_name}: {str(e)}")
        # Optional: Continue or abort
        raise

print("\n🎉 BACKUP COMPLETE!")
print(f"📁 Backup location: {os.path.abspath(backup_dir)}")
print("💡 Remember to commit this backup to cloud storage (Google Drive/Dropbox)!")