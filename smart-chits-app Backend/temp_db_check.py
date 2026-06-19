from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user_model import User
from app.models.organization_model import Organization

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')
print('DB URL:', DATABASE_URL)
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
s = Session()
users = s.query(User).filter(User.role.in_(['admin', 'platform_admin', 'super_admin'])).all()
print('Admin users:', len(users))
for u in users:
    print('USER', u.id, u.email, u.role, 'hashed?', bool(u.hashed_password), u.hashed_password[:10] if u.hashed_password else None)
orgs = s.query(Organization).all()
print('Orgs:', len(orgs))
for o in orgs:
    print('ORG', o.id, o.email, o.organization_name, bool(o.password), o.password[:10] if o.password else None)
