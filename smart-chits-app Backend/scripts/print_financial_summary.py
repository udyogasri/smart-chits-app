import json
import sys
import os

# Ensure backend package root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.db.database import SessionLocal
from app.crud.platform_admin_crud import get_platform_financial_summary

if __name__ == '__main__':
    db = SessionLocal()
    try:
        summary = get_platform_financial_summary(db)
        print(json.dumps(summary, default=str, indent=2))
    finally:
        db.close()
