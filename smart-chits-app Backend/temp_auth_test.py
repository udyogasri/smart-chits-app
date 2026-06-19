from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user_model import User

load_dotenv()
engine = create_engine(os.getenv('DATABASE_URL'))
Session = sessionmaker(bind=engine)
s = Session()
users = s.query(User).filter(User.role == 'admin').all()
print('Admin users count:', len(users))
for u in users:
    print('USER', u.id, u.email, repr(u.hashed_password), 'len', len(u.hashed_password) if u.hashed_password else 0)
