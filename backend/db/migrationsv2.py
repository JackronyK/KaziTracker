import os
import json
import re
import sys
from datetime import datetime,  timedelta
from sqlalchemy import create_engine, MetaData, Table, select
from pathlib import Path
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
dotenv_path = PROJECT_ROOT / "backend.env"

# load the env file
if dotenv_path.exists():
    load_dotenv(dotenv_path=dotenv_path, override=True)
else:
    print(f"⚠️  backend.env not found at {dotenv_path}. Relying on environment variables (DATABASE_URL).")

# Connection  strings 
backup_branch_url = os.getenv("DATABASE_URL_backup")
prod_branch_url = os.getenv("DATABASE_URL_prod")

# 1. Connect to BACKUP BRANCH (old schema) - READ ONLY
backup_engine = create_engine(backup_branch_url)
backup_metadata = MetaData()
backup_metadata.reflect(bind=backup_engine)

# Load relevant tables from backup branch
application_table = Table("application", backup_metadata, autoload_with=backup_engine)
job_table = Table("job", backup_metadata, autoload_with=backup_engine)  # For company/position/salary

# 2. Connect to PRODUCTION BRANCH (new schema) - WRITE ONLY
prod_engine = create_engine(prod_branch_url)
prod_metadata = MetaData()
prod_metadata.reflect(bind=prod_engine)
offer_table = Table("offer", prod_metadata, autoload_with=prod_engine)

# 3. Build JOB MAPPING for fast lookups (company, position, salary)
job_map = {}
with backup_engine.connect() as backup_conn:
    job_query = select(
        job_table.c.id,
        job_table.c.company,
        job_table.c.title,
        job_table.c.salary_range
    )
    for job in backup_conn.execute(job_query).mappings():
        # Parse salary range (handles formats like "50000-70000", "Ksh 100,000", etc.)
        salary_avg = 0.0
        if job["salary_range"]:
            try:
                # Extract numbers from salary range string
                numbers = re.findall(r'[\d,]+', job["salary_range"].replace(',', ''))
                if len(numbers) >= 2:
                    low = float(numbers[0])
                    high = float(numbers[1])
                    salary_avg = (low + high) / 2
                elif len(numbers) == 1:
                    salary_avg = float(numbers[0])
            except (ValueError, IndexError) as e:
                print(f"⚠️ Salary parse error for job_id={job['id']}: {job['salary_range']} → {str(e)}")
        
        job_map[job["id"]] = {
            "company_name": job["company"] or "Unknown Company",
            "position": job["title"] or "Unknown Position",
            "salary_avg": salary_avg
        }

print(f"✅ Loaded {len(job_map)} job records for reference")

# 4. Query applications WITH JOB DATA from backup branch
with backup_engine.connect() as backup_conn:
    query = select(
        application_table.c.id.label("application_id"),
        application_table.c.user_id,
        application_table.c.job_id,  # Critical for job mapping
        application_table.c.offer_date,
        application_table.c.offer_details
    ).where(
        (application_table.c.offer_date.is_not(None)) |
        (application_table.c.offer_details.is_not(None))
    )
    
    results = backup_conn.execute(query).mappings().all()
    print(f"✅ Found {len(results)} applications with offer data to migrate")

# 5. Transform and insert into PRODUCTION branch
migrated_count = 0
failed_count = 0

with prod_engine.begin() as prod_conn:  # AUTOMATIC ROLLBACK ON FAILURE
    for row in results:
        try:
            # Get job details (fallback to defaults if missing)
            job_data = job_map.get(row["job_id"], {
                "company_name": "Unknown Company",
                "position": "Unknown Position",
                "salary_avg": 0.0
            })
            
            # Parse offer_details JSON safely
            currency = "KES"
            benefits = None
            notes = None
            
            if row["offer_details"]:
                try:
                    details = json.loads(row["offer_details"])
                    currency = details.get("currency", "KES").replace("Kshs", "KES")  # Normalize currency
                    benefits = details.get("benefits")
                    notes = details.get("notes")
                except (json.JSONDecodeError, TypeError) as e:
                    print(f"⚠️ JSON parse error for app_id={row['application_id']}: {str(e)}")
                    notes = f"Raw data: {row['offer_details']}"

            # Calculate deadline (7 days after offer_date)
            base_date = row["offer_date"] or datetime.utcnow()
            deadline = base_date + timedelta(days=7)

            # Prepare new offer with REAL data
            new_offer = {
                "user_id": row["user_id"],
                "application_id": row["application_id"],
                
                # Migrated fields
                "offer_date": row["offer_date"] or datetime.utcnow(),
                "currency": currency,
                "benefits": json.dumps(benefits) if benefits else None,
                "notes": notes,
                
                # Fetched from JOBS table
                "company_name": job_data["company_name"],
                "position": job_data["position"],
                "salary": job_data["salary_avg"],
                "start_date": base_date,  # Same as offer_date
                "salary_frequency": "annual",
                "deadline": deadline,
                "status": "pending",
                
                # Audit fields
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }

            # Insert into new Offer table
            prod_conn.execute(offer_table.insert().values(**new_offer))
            migrated_count += 1
            print(f"✅ Migrated offer for application #{row['application_id']} | {job_data['position']} @ {job_data['company_name']}")
            
        except Exception as e:
            failed_count += 1
            print(f"❌ FAILED application_id={row['application_id']}: {str(e)}")

print(f"\n🎉 MIGRATION COMPLETE!")
print(f"✅ Successfully migrated: {migrated_count} offers")
print(f"❌ Failed migrations: {failed_count}")

# 6. Verification query (optional but recommended)
with prod_engine.connect() as prod_conn:
    result = prod_conn.execute(
        select(offer_table.c.id, offer_table.c.application_id, offer_table.c.company_name)
        .order_by(offer_table.c.created_at.desc())
        .limit(5)
    ).mappings().all()
    
    print("\n🔍 Sample of migrated offers:")
    for row in result:
        print(f"  → Offer ID {row['id']} for Application #{row['application_id']} ({row['company_name']})")