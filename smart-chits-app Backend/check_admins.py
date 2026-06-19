from app.db.database import SessionLocal
from app.models.user_model import User

db = SessionLocal()
admins = db.query(User).filter(User.role.in_(['admin', 'super_admin', 'platform_admin', 'system_admin'])).all()
for admin in admins:
    print(f'ID: {admin.id}, Name: {admin.first_name} {admin.last_name}, Email: {admin.email}, Role: {admin.role}, Active: {admin.is_active}')
db.close()
