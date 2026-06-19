from app.db.database import SessionLocal
from app.crud.member_crud import get_all_members

db = SessionLocal()

try:
    members = get_all_members(db)
    print(f"Found {len(members)} members")
    if members:
        print(f"First member: {members[0]}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

db.close()
