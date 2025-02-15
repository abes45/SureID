from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from enum import Enum

# Document Type for guests
class DocumentType(str, Enum):
    driver_licence = "Driver Licence"
    nin = "NIN"
    voters_card = "Voters Card"
    international_passport = "International Passport"

# Guest models
class GuestBase(BaseModel):
    name: str
    id_number: str
    document_type: str  # Will be validated

class GuestCreate(GuestBase):
    pass

class GuestUpdate(BaseModel):
    name: Optional[str] = None
    id_number: Optional[str] = None
    document_type: Optional[str] = None

class Guest(GuestBase):
    id: str
    friendly_id: Optional[str] = None
    flagged: Optional[bool] = False

    @validator('document_type', pre=True, always=True)
    def validate_document_type(cls, v):
        mapping = {
            "DL": "Driver Licence",
            "NIN": "NIN",
            "VL": "Voters Card",
            "IP": "International Passport"
        }
        if isinstance(v, str):
            if v in mapping:
                return mapping[v]
            allowed = [item.value for item in DocumentType]
            if v in allowed:
                return v
        raise ValueError(f"Input should be one of {', '.join([item.value for item in DocumentType])}")

    class Config:
        from_attributes = True  # For Pydantic V2

# Check-In model
class CheckIn(BaseModel):
    guest_id: str
    check_in_time: Optional[datetime] = None
    flagged: Optional[bool] = False
    alert: Optional[str] = None

# -------------------------------
# User Management Models
# -------------------------------
class UserBase(BaseModel):
    username: str
    role: str  # "provider", "security", or "admin"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str

    class Config:
        from_attributes = True
