from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auction_schema import (
    AuctionCreate,
    AuctionResponse,
    AuctionDetailResponse,
    AuctionBidResponse,
    EligibleMemberResponse,
    BidCreate,
)
from app.services.auction_service import (
    create_auction,
    list_auctions,
    get_auction,
    start_auction,
    place_bid,
    complete_auction,
    list_auction_bids,
    get_eligible_members,
)
from app.api.deps import get_current_user, get_current_admin
from app.models.user_model import User
from app.services.socket_service import manager as socket_manager

router = APIRouter()


@router.post("/", response_model=AuctionResponse)
def create_auction_endpoint(
    data: AuctionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    try:
        return create_auction(db, current_user, data.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[AuctionResponse])
def auctions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return list_auctions(db, current_user)


@router.get("/{auction_id}", response_model=AuctionDetailResponse)
def auction_detail(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    auction = get_auction(db, auction_id)
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")

    eligible_members = get_eligible_members(db, auction_id)
    auction.eligible_member_count = len(eligible_members)
    auction.member_count = len(auction.chit.members) if auction.chit else 0

    highest_bid = max(auction.bids, key=lambda bid: bid.bid_amount, default=None)
    if highest_bid and highest_bid.member:
        auction.highest_bid_member_name = f"{highest_bid.member.user.first_name} {highest_bid.member.user.last_name}".strip() if highest_bid.member.user else None
        auction.highest_bid_amount = highest_bid.bid_amount

    return auction


@router.post("/{auction_id}/start", response_model=AuctionResponse)
def start_auction_endpoint(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    try:
        return start_auction(db, current_user, auction_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{auction_id}/complete", response_model=AuctionResponse)
def complete_auction_endpoint(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    try:
        return complete_auction(db, current_user, auction_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{auction_id}/bid", response_model=AuctionBidResponse)
def bid(
    auction_id: int,
    data: BidCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        bid_record = place_bid(db, current_user, auction_id, data.bid_amount)
        if bid_record.member and bid_record.member.user:
            bid_record.member_name = f"{bid_record.member.user.first_name} {bid_record.member.user.last_name}".strip()
        return bid_record
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{auction_id}/bids", response_model=list[AuctionBidResponse])
def auction_bids(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bids = list_auction_bids(db, auction_id)
    for bid in bids:
        if bid.member and bid.member.user:
            bid.member_name = f"{bid.member.user.first_name} {bid.member.user.last_name}".strip()
    return bids


@router.get("/{auction_id}/eligible-members", response_model=list[EligibleMemberResponse])
def eligible_members(
    auction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    members = get_eligible_members(db, auction_id)
    for member in members:
        if member.user:
            member.first_name = member.user.first_name
            member.last_name = member.user.last_name
            member.email = member.user.email
            member.phone_number = member.user.phone_number
    return members


@router.websocket("/ws/{auction_id}")
async def auction_socket(auction_id: int, websocket: WebSocket):
    await socket_manager.connect(websocket, auction_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        socket_manager.disconnect(websocket, auction_id)
