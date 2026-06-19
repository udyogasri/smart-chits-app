from app.db.database import SessionLocal
from app.models.user_model import User
from app.utils.hashing import hash_password
from datetime import datetime

db = SessionLocal()

# Create a test superadmin account
test_superadmin = User(
    first_name="Test",
    last_name="SuperAdmin",
    email="test@smartchits.com",
    phone_number="0000000000",
    hashed_password=hash_password("test123456"),
    role="super_admin",
    is_active=True,
    created_at=datetime.utcnow()
)

db.add(test_superadmin)
db.commit()
print(f"Created test superadmin: test@smartchits.com with password: test123456")
db.close()
