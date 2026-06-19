from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Chit(Base):
    __tablename__ = "chits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    total_members = Column(Integer, nullable=False, default=0)
    duration = Column(Integer, nullable=False)
    monthly_amount = Column(Float, nullable=False)
    current_month = Column(Integer, default=1)
    bidding_open = Column(Boolean, default=False)
    total_chit_amount = Column(Float, nullable=False, default=0)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    chit_fund = Column(Float, nullable=True)
    description = Column(String, nullable=True)
    installment_amount = Column(Float, nullable=True)
    installment_frequency = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    total_months = Column(Integer, nullable=False, default=12)
    
    # Relationships
    organization = relationship("Organization")
    creator = relationship("User")
    members = relationship("Member", back_populates="chit", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="chit", cascade="all, delete-orphan")
    auctions = relationship("Auction", back_populates="chit", cascade="all, delete-orphan")
