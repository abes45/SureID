from sqlalchemy import Column, String, Boolean, DateTime, Integer, func
from database import Base

class Guest(Base):
    __tablename__ = "guests"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    id_number = Column(String, nullable=False)
    document_type = Column(String, nullable=False)
    friendly_id = Column(String, unique=True, index=True)
    flagged = Column(Boolean, default=False)
    flagged_by = Column(String, nullable=True)  # Security user who flagged the guest, if applicable
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CheckIn(Base):
    __tablename__ = "checkins"
    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(String, nullable=False)
    provider_username = Column(String, nullable=False)
    check_in_time = Column(DateTime(timezone=True), server_default=func.now())
    check_out_time = Column(DateTime(timezone=True), nullable=True)
    flagged = Column(Boolean, default=False)
    alert = Column(String, default="")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "provider", "security", or "admin"

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(String, nullable=False)       # Friendly ID of the guest
    guest_name = Column(String, nullable=False)
    provider_username = Column(String, nullable=False)
    flagged_by = Column(String, nullable=False)       # Security user who flagged the guest
    alert_time = Column(DateTime(timezone=True), server_default=func.now())
