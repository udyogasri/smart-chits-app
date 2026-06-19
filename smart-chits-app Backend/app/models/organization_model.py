from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
from app.models.user_model import User

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    # Admin User Details
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    phone_number = Column(String, nullable=False)
    password = Column(String, nullable=False)  # Will store hashed password
    confirm_password = Column(String, nullable=False)  # For validation only
    
    # Organization Details
    organization_name = Column(String, nullable=False)
    organization_type = Column(String, nullable=False)
    registration_number = Column(String, nullable=False, unique=True)
    company_email = Column(String, nullable=False)
    company_phone_number = Column(String, nullable=False)
    
    # Additional fields
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Settings fields
    avatar = Column(Text, nullable=True)  # Base64 encoded image
    preferences = Column(JSON, nullable=True)  # {language, timezone, currency}
    notifications = Column(JSON, nullable=True)  # {payment_reminders, chit_announcements, monthly_statements, security_alerts, marketing_emails}
    
    # Relationships
    users = relationship("User", back_populates="organization")
    chits = relationship("Chit", back_populates="organization")
