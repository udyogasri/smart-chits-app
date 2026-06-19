from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Auction(Base):
    __tablename__ = "auctions"

    id = Column(Integer, primary_key=True, index=True)
    auction_number = Column(String, unique=True, nullable=False, index=True)
    chit_group_id = Column(Integer, ForeignKey("chits.id"), nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    auction_month = Column(Integer, default=1, nullable=False)
    auction_date = Column(DateTime(timezone=True), nullable=True)
    total_pool_amount = Column(Float, nullable=False, default=0.0)
    foreman_commission_percent = Column(Float, nullable=False, default=0.0)
    foreman_commission_amount = Column(Float, nullable=False, default=0.0)
    max_bid_limit = Column(Float, nullable=False, default=0.0)
    status = Column(String, default="PENDING", nullable=False)
    winner_member_id = Column(Integer, ForeignKey("members.id"), nullable=True)
    winning_bid_amount = Column(Float, nullable=True)
    winner_prize_amount = Column(Float, nullable=True)
    dividend_per_member = Column(Float, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, nullable=False, default=10)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    chit = relationship("Chit", back_populates="auctions")
    branch = relationship("Branch")
    created_by_user = relationship("User")
    winner_member = relationship("Member", foreign_keys=[winner_member_id])
    bids = relationship("AuctionBid", back_populates="auction", cascade="all, delete-orphan")
