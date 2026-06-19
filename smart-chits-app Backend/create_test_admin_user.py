from app.db.database import SessionLocal
from app.models.user_model import User
from app.utils.hashing import hash_password

db = SessionLocal()

# Check if test admin exists
existing = db.query(User).filter(User.email == 'testadmin@smartchits.com').first()
if existing:
    print(f'Test admin already exists: {existing.email}')
    # Delete and recreate with fresh password
    db.delete(existing)
    db.commit()

# Create test admin user
test_admin = User(
    email='testadmin@smartchits.com',
    first_name='Test',
    last_name='Admin',
    phone_number='9999999999',
    hashed_password=hash_password('Test@123456'),
    role='admin',
    organization_id=1,  # Assign to first organization
    is_active=True
)

db.add(test_admin)
db.commit()
db.refresh(test_admin)

print(f'✅ Created test admin user:')
print(f'   Email: testadmin@smartchits.com')
print(f'   Password: Test@123456')
print(f'   Role: admin')
print(f'   Organization ID: {test_admin.organization_id}')
