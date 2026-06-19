# app/auth.py

from jose import jwt
from passlib.context import CryptContext
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()  # ✅ Load .env directly here so SECRET_KEY is never None

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# ✅ Startup validation — crashes early with clear message instead of silent None
if not SECRET_KEY:
    raise RuntimeError("❌ SECRET_KEY is not set in .env file!")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed: str):
    return pwd_context.verify(password, hashed)

def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)