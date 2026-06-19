from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    user_name: Optional[str]
    action: str
    resource: str
    detail: Optional[str]
    success: bool
    timestamp: datetime

    class Config:
        from_attributes = True
