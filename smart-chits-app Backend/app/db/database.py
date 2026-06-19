import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from dotenv import load_dotenv

# Load .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("DATABASE_URL:", DATABASE_URL)

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

# ✅ CREATE ENGINE with optimized connection pool
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=30,  # Increased from 20: more ready connections
    max_overflow=50,  # Increased from 40: more spare capacity
    pool_pre_ping=True,  # Test connections before using them (prevents stale connections)
    pool_recycle=3600,  # Recycle connections after 1 hour
    pool_timeout=30,  # Wait up to 30 seconds for a connection
    echo=False,  # Set to True for debugging SQL queries
    # PostgreSQL-specific optimizations
    connect_args={
        "connect_timeout": 10,  # Connection timeout
        "application_name": "smart_chits",
        "options": "-c statement_timeout=30000",  # 30 second statement timeout
    }
)

# ✅ SESSION
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ✅ DEPENDENCY FOR ROUTES
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
