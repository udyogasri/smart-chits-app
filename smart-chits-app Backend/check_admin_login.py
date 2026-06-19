from app.db.database import SessionLocal
from app.models.user_model import User

db = SessionLocal()
admins = db.query(User).filter(User.role == 'admin').all()
print(f'Found {len(admins)} admin users')
for admin in admins:
    print(f'  - Email: {admin.email}')
    print(f'    Role: {admin.role}')
    print(f'    Organization ID: {admin.organization_id}')
    print()

# Also list all users
print("\nAll users in database:")
all_users = db.query(User).all()
for user in all_users:
    print(f'  - {user.email} (role: {user.role})')
