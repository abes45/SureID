from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserResponse(BaseModel):
    id: int
    username: str
    role: str

    class Config:
        orm_mode = True

class GuestResponse(BaseModel):
    id: int
    name: str
    id_number: str
    document_type: str
    friendly_id: str
    flagged: bool
    flagged_by: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

class CheckInResponse(BaseModel):
    id: int
    guest_id: str
    provider_username: str
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    flagged: bool
    alert: str

    class Config:
        orm_mode = True

class AlertResponse(BaseModel):
    id: int
    guest_id: str
    guest_name: str
    provider_username: str
    flagged_by: str
    alert_time: datetime

    class Config:
        orm_mode = True
