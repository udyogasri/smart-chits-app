import logging
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_
from typing import List
from app.models.user_model import User
from app.models.member_model import Member
from app.models.chit_model import Chit
from app.api.deps import get_db, get_current_user
from app.utils.authorization import require_admin
from app.schemas.user_schema import UserResponse
from app.utils.token import get_email_from_token
import json
import asyncio
import time

router = APIRouter()
logger = logging.getLogger(__name__)

# Store active WebSocket connections for real-time updates
active_member_ws: dict = {}

# Simple query result cache (5-second TTL)
_members_cache = {}
_cache_ttl = 5  # seconds


class MemberWithChits(UserResponse):
    """Extended user response with chit membership info"""
    total_chits: int = 0
    active_chits: int = 0
    total_members_in_chits: int = 0
    joined_at_earliest: str = None


def _clear_cache(org_id: int = None):
    """Clear members cache for an organization or all organizations"""
    global _members_cache
    if org_id:
        # Clear only for specific organization
        keys_to_delete = [k for k in _members_cache.keys() if f"members_{org_id}" in k]
        for k in keys_to_delete:
            del _members_cache[k]
        logger.debug(f"Cleared cache for org {org_id} ({len(keys_to_delete)} entries)")
    else:
        # Clear all cache
        _members_cache.clear()
        logger.debug("Cleared all members cache")


@router.get("/members")
def get_organization_members(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Get all members in organization with chit information."""
    logger.info(f"Fetching members for org_id: {current_user.organization_id}, user: {current_user.email}")
    
    try:
        # Check cache first
        cache_key = f"members_{current_user.organization_id}_{skip}_{limit}"
        if cache_key in _members_cache:
            cache_data = _members_cache[cache_key]
            if time.time() - cache_data['timestamp'] < _cache_ttl:
                logger.info("Returning cached members")
                return cache_data['data']
        
        # Validate org_id
        if not current_user.organization_id and current_user.role not in ["super_admin", "system_admin"]:
            logger.warning(f"Admin {current_user.email} has no organization_id assigned")
            return []
        
        org_id = current_user.organization_id if current_user.role not in ["super_admin", "system_admin"] else None
        
        # SIMPLE RELIABLE APPROACH
        # Step 1: Get unique user IDs who are members in organization's chits
        logger.debug("Step 1: Getting unique member user IDs")
        
        # Use distinct differently to avoid SQLAlchemy compatibility issues
        user_ids_query = db.query(Member.user_id).join(
            Chit, Member.chit_id == Chit.id
        ).distinct()
        
        if org_id:
            user_ids_query = user_ids_query.filter(Chit.organization_id == org_id)
        
        user_ids = [row[0] for row in user_ids_query.all()]
        logger.debug(f"Found {len(user_ids)} unique member user IDs")
        
        if not user_ids:
            logger.info("No members found")
            return []
        
        # Step 2: Fetch user details
        logger.debug("Step 2: Fetching user details")
        users = db.query(User).filter(User.id.in_(user_ids)).offset(skip).limit(limit).all()
        logger.debug(f"Fetched {len(users)} users")
        
        # Step 3: Build response with member stats
        logger.debug("Step 3: Building response with member stats")
        result = []
        
        for user in users:
            try:
                # Get total chits for this user
                total_chits = db.query(func.count(Member.id)).filter(
                    Member.user_id == user.id
                ).scalar() or 0
                
                # Get active chits (bidding_open = true)
                active_chits = db.query(func.count(Member.id)).join(
                    Chit, Member.chit_id == Chit.id
                ).filter(
                    and_(Member.user_id == user.id, Chit.bidding_open == True)
                ).scalar() or 0
                
                # Get earliest join date
                joined_at = db.query(func.min(Member.joined_at)).filter(
                    Member.user_id == user.id
                ).scalar()
                
                # Build member data
                member_data = {
                    "id": int(user.id),
                    "email": str(user.email),
                    "first_name": str(user.first_name or ""),
                    "last_name": str(user.last_name or ""),
                    "phone_number": str(user.phone_number or ""),
                    "is_active": bool(user.is_active),
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                    "total_chits": int(total_chits),
                    "active_chits": int(active_chits),
                    "total_members_in_chits": 0,
                    "joined_at_earliest": joined_at.isoformat() if joined_at else None
                }
                result.append(member_data)
                
            except Exception as e:
                logger.error(f"Error processing member {user.id}: {str(e)}")
                continue
        
        logger.info(f"Built response with {len(result)} members")
        
        # Cache the result
        _members_cache[cache_key] = {
            'data': result,
            'timestamp': time.time()
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching members: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch members: {str(e)}"
        )


@router.post("/members", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def add_member_to_organization(
    user_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Add a new member to the organization."""
    logger.info(f"Adding new member to org {current_user.organization_id}")
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.get("email")).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        # Create new user
        new_user = User(
            email=user_data.get("email"),
            first_name=user_data.get("first_name", ""),
            last_name=user_data.get("last_name", ""),
            name=f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
            phone_number=user_data.get("phone_number", ""),
            hashed_password="",  # Will be set on first login or by user
            role="user",
            organization_id=current_user.organization_id,
            is_active=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"New member created: {new_user.email}")
        
        # Clear cache so fresh data is fetched
        _clear_cache(current_user.organization_id)
        
        # Notify WebSocket clients
        await_notify_members_update("member_added", new_user)
        
        return new_user
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating member: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create member: {str(e)}"
        )


@router.patch("/members/{member_id}")
def update_member(
    member_id: int,
    update_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Update member information."""
    logger.info(f"Updating member {member_id}")
    
    try:
        member = db.query(User).filter(User.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # Check organization permission
        if current_user.role == "admin" and member.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Update allowed fields
        for field in ["first_name", "last_name", "phone_number", "is_active"]:
            if field in update_data:
                setattr(member, field, update_data[field])
        
        # Update name if first/last name changed
        if "first_name" in update_data or "last_name" in update_data:
            member.name = f"{member.first_name or ''} {member.last_name or ''}".strip()
        
        db.commit()
        db.refresh(member)
        
        logger.info(f"Member {member_id} updated")
        
        # Clear cache so fresh data is fetched
        _clear_cache(member.organization_id)
        
        # Notify WebSocket clients
        await_notify_members_update("member_updated", member)
        
        return member
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating member: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update member: {str(e)}"
        )


@router.delete("/members/{member_id}")
def delete_member(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Delete a member from organization."""
    logger.info(f"Deleting member {member_id}")
    
    try:
        member = db.query(User).filter(User.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # Check organization permission
        if current_user.role == "admin" and member.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Check if member has active memberships
        active_memberships = db.query(Member).filter(Member.user_id == member_id).count()
        if active_memberships > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot delete member with {active_memberships} active chit memberships"
            )
        
        db.delete(member)
        db.commit()
        
        logger.info(f"Member {member_id} deleted")
        
        # Clear cache so fresh data is fetched
        _clear_cache(member.organization_id)
        
        # Notify WebSocket clients
        await_notify_members_update("member_deleted", {"id": member_id})
        
        return {"message": "Member deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting member: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete member: {str(e)}"
        )


@router.get("/members/{member_id}/chits")
def get_member_chits(
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin())
):
    """Get all chits a member belongs to."""
    logger.info(f"Fetching chits for member {member_id}")
    
    try:
        member = db.query(User).filter(User.id == member_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # Get chits for this member
        member_records = db.query(Member).filter(Member.user_id == member_id).all()
        
        chits_info = []
        for member_record in member_records:
            chit = db.query(Chit).filter(Chit.id == member_record.chit_id).first()
            if chit:
                chits_info.append({
                    "id": chit.id,
                    "name": chit.name,
                    "monthly_amount": chit.monthly_amount,
                    "duration": chit.duration,
                    "current_month": chit.current_month,
                    "bidding_open": chit.bidding_open,
                    "joined_at": member_record.joined_at.isoformat() if member_record.joined_at else None,
                    "already_won_auction": member_record.already_won_auction
                })
        
        return chits_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching member chits: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch member chits: {str(e)}"
        )


@router.get("/my-chits")
def get_user_chits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all chits joined by the current user."""
    logger.info(f"Fetching joined chits for user {current_user.id}")
    
    try:
        # Get all chits where user is a member
        member_records = db.query(Member).filter(Member.user_id == current_user.id).all()
        
        chits_info = []
        for member_record in member_records:
            chit = db.query(Chit).filter(Chit.id == member_record.chit_id).first()
            if chit:
                # Get member count for this chit
                member_count = db.query(func.count(Member.id)).filter(
                    Member.chit_id == chit.id
                ).scalar() or 0
                
                chits_info.append({
                    "id": chit.id,
                    "name": chit.name,
                    "description": chit.description,
                    "chit_fund": chit.chit_fund,
                    "installment_amount": chit.installment_amount,
                    "total_members": chit.total_members,
                    "current_members": member_count,
                    "duration": chit.total_months,
                    "current_month": chit.current_month,
                    "bidding_open": chit.bidding_open,
                    "joined_at": member_record.joined_at.isoformat() if member_record.joined_at else None,
                    "already_won_auction": member_record.already_won_auction,
                    "total_dividend_earned": member_record.total_dividend_earned
                })
        
        logger.info(f"Found {len(chits_info)} joined chits for user {current_user.id}")
        return chits_info
        
    except Exception as e:
        logger.error(f"Error fetching user chits: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch your chits: {str(e)}"
        )


@router.websocket("/ws/members")
async def websocket_members_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time member updates."""
    await websocket.accept()
    
    # Get token for authentication
    auth_header = websocket.headers.get('authorization') or websocket.headers.get('Authorization')
    token = None
    if auth_header and auth_header.lower().startswith('bearer '):
        token = auth_header.split(' ', 1)[1].strip()
    else:
        token = websocket.query_params.get('token')
    
    if not token:
        logger.warning('Members WS rejected: missing token')
        try:
            await websocket.close(code=1008, reason='missing token')
        except Exception:
            pass
        return
    
    # Validate token
    try:
        email = get_email_from_token(token)
    except Exception as exc:
        logger.warning(f'Members WS token validation failed: {str(exc)}')
        try:
            await websocket.close(code=1008, reason='invalid token')
        except Exception:
            pass
        return
    
    # Store connection
    client_id = f"{email}_{id(websocket)}"
    active_member_ws[client_id] = websocket
    logger.info(f"Members WS connected: {client_id}")
    
    try:
        # Keep connection alive and handle incoming messages
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                # Handle any incoming commands (e.g., refresh request)
                message = json.loads(data)
                if message.get("action") == "refresh":
                    logger.info(f"Refresh requested by {client_id}")
                    # Send updated data
                    await websocket.send_json({"type": "refresh_ack"})
            except asyncio.TimeoutError:
                # Periodic keepalive
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break
            except Exception as e:
                logger.error(f"WS receive error: {str(e)}")
                break
                
    except Exception as e:
        logger.error(f"Members WS error: {str(e)}")
    finally:
        # Remove connection
        active_member_ws.pop(client_id, None)
        logger.info(f"Members WS disconnected: {client_id}")
        try:
            await websocket.close()
        except Exception:
            pass


def await_notify_members_update(event_type: str, data: any):
    """
    Notify all connected WebSocket clients about member updates.
    This sends notifications to all active WebSocket connections.
    """
    try:
        # Build message
        if isinstance(data, dict):
            message_data = data
        else:
            # Convert SQLAlchemy object to dict
            message_data = {
                "id": data.id,
                "email": data.email,
                "first_name": data.first_name or "",
                "last_name": data.last_name or "",
                "is_active": data.is_active
            }
        
        message = {
            "type": "member_update",
            "event": event_type,
            "data": message_data
        }
        
        logger.debug(f"Broadcasting {event_type} to {len(active_member_ws)} clients: {message}")
        
        # Send to all connected clients (non-blocking)
        disconnected_clients = []
        for client_id, ws in list(active_member_ws.items()):
            try:
                # Try to send using the websocket's send_json (async)
                # This is safe because we're storing the connection object
                import asyncio
                try:
                    # Get event loop and schedule task
                    loop = asyncio.get_event_loop()
                    if loop.is_running():
                        asyncio.create_task(ws.send_json(message))
                    else:
                        # Fallback if no loop is running
                        logger.debug(f"No event loop for {client_id}, queuing message")
                except:
                    # If create_task fails, just skip
                    logger.debug(f"Could not send to {client_id}")
                    disconnected_clients.append(client_id)
                    
            except Exception as e:
                logger.warning(f"Error sending to {client_id}: {str(e)}")
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            active_member_ws.pop(client_id, None)
            
    except Exception as e:
        logger.error(f"Error notifying members update: {str(e)}")
