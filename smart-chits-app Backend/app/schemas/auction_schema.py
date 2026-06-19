from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class AuctionCreate(BaseModel):
    chit_group_id: int
    branch_id: Optional[int]
    auction_month: int = Field(default=1, ge=1)
    auction_date: Optional[datetime]
    total_pool_amount: float = Field(gt=0)
    foreman_commission_percent: float = Field(default=5.0, ge=0, le=100)
    max_bid_limit: float = Field(gt=0)
    duration_minutes: int = Field(default=10, ge=1)

class AuctionResponse(BaseModel):
    id: int
    auction_number: str
    chit_group_id: int
    branch_id: Optional[int]
    auction_month: int
    auction_date: Optional[datetime]
    total_pool_amount: float
    foreman_commission_percent: float
    foreman_commission_amount: float
    max_bid_limit: float
    status: str
    winner_member_id: Optional[int]
    winning_bid_amount: Optional[float]
    winner_prize_amount: Optional[float]
    dividend_per_member: Optional[float]
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    duration_minutes: int
    created_by: Optional[int]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class AuctionDetailResponse(AuctionResponse):
    eligible_member_count: int
    member_count: int
    highest_bid_member_name: Optional[str] = None
    highest_bid_amount: Optional[float] = None

class BidCreate(BaseModel):
    bid_amount: float = Field(gt=0)

class AuctionBidResponse(BaseModel):
    id: int
    auction_id: int
    member_id: int
    bid_amount: float
    is_winning_bid: bool
    created_at: datetime
    member_name: Optional[str] = None

    class Config:
        from_attributes = True


BidResponse = AuctionBidResponse

class EligibleMemberResponse(BaseModel):
    id: int
    user_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    already_won_auction: bool
    total_dividend_earned: float

    class Config:
        from_attributes = True
