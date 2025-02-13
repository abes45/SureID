# backend/models.py
from pydantic import BaseModel
from typing import Optional

class GuestBase(BaseModel):
    name: str
    id_number: str
    document_type: str  # e.g., "passport", "driver_license", etc.

class GuestCreate(GuestBase):
    pass

class GuestUpdate(BaseModel):
    name: Optional[str] = None
    id_number: Optional[str] = None
    document_type: Optional[str] = None

class Guest(GuestBase):
    id: str

    class Config:
        orm_mode = True
