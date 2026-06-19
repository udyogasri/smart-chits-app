from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.member_model import Member
from app.models.user_model import User
from app.models.chit_model import Chit
from typing import List, Dict, Any
from datetime import datetime


def get_all_members(db: Session, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """Get all members with their user details"""
    members = db.query(
        Member.id,
        Member.chit_id,
        Member.user_id,
        Member.joined_at,
        User.first_name,
        User.last_name,
        User.email,
        User.phone_number,
        User.branch_id,
        Chit.name.label('chit_name')
    ).join(
        User, Member.user_id == User.id
    ).join(
        Chit, Member.chit_id == Chit.id
    ).order_by(desc(Member.joined_at)).offset(skip).limit(limit).all()
    
    # Convert to dict format
    result = []
    for member in members:
        result.append({
            'id': member.id,
            'chit_id': member.chit_id,
            'chit_name': member.chit_name,
            'user_id': member.user_id,
            'first_name': member.first_name,
            'last_name': member.last_name,
            'email': member.email,
            'phone_number': member.phone_number,
            'branch_id': member.branch_id,
            'joined_at': member.joined_at
        })
    
    return result


def get_members_by_chit(db: Session, chit_id: int, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
    """Get all members of a specific chit"""
    members = db.query(
        Member.id,
        Member.chit_id,
        Member.user_id,
        Member.joined_at,
        User.first_name,
        User.last_name,
        User.email,
        User.phone_number,
        User.branch_id
    ).join(
        User, Member.user_id == User.id
    ).filter(
        Member.chit_id == chit_id
    ).order_by(desc(Member.joined_at)).offset(skip).limit(limit).all()
    
    result = []
    for member in members:
        result.append({
            'id': member.id,
            'chit_id': member.chit_id,
            'user_id': member.user_id,
            'first_name': member.first_name,
            'last_name': member.last_name,
            'email': member.email,
            'phone_number': member.phone_number,
            'branch_id': member.branch_id,
            'joined_at': member.joined_at
        })
    
    return result


def get_member_by_id(db: Session, member_id: int) -> Dict[str, Any]:
    """Get a specific member"""
    member = db.query(
        Member.id,
        Member.chit_id,
        Member.user_id,
        Member.joined_at,
        User.first_name,
        User.last_name,
        User.email,
        User.phone_number,
        User.branch_id,
        Chit.name.label('chit_name')
    ).join(
        User, Member.user_id == User.id
    ).join(
        Chit, Member.chit_id == Chit.id
    ).filter(
        Member.id == member_id
    ).first()
    
    if member:
        return {
            'id': member.id,
            'chit_id': member.chit_id,
            'chit_name': member.chit_name,
            'user_id': member.user_id,
            'first_name': member.first_name,
            'last_name': member.last_name,
            'email': member.email,
            'phone_number': member.phone_number,
            'branch_id': member.branch_id,
            'joined_at': member.joined_at
        }
    return None


def add_member_to_chit(db: Session, user_id: int, chit_id: int) -> Dict[str, Any]:
    """Add a user to a chit as a member"""
    # Check if already a member
    existing = db.query(Member).filter(
        Member.user_id == user_id,
        Member.chit_id == chit_id
    ).first()
    
    if existing:
        raise ValueError(f"User {user_id} is already a member of chit {chit_id}")
    
    new_member = Member(
        user_id=user_id,
        chit_id=chit_id
    )
    
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    # Get full member details
    return get_member_by_id(db, new_member.id)


def remove_member_from_chit(db: Session, member_id: int) -> bool:
    """Remove a member from a chit"""
    member = db.query(Member).filter(Member.id == member_id).first()
    
    if not member:
        raise ValueError(f"Member with ID {member_id} not found")
    
    db.delete(member)
    db.commit()
    return True


def get_member_count_by_chit(db: Session, chit_id: int) -> int:
    """Get number of members in a chit"""
    return db.query(Member).filter(Member.chit_id == chit_id).count()
