import os
import random
import datetime
from fastapi import FastAPI, HTTPException, status, Depends, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, Base, get_db
from models import Guest, CheckIn, User, Alert
from auth import (
    create_access_token,
    get_password_hash,
    verify_password,
    get_current_user,
    User as AuthUser
)
from schemas import UserResponse, GuestResponse, CheckInResponse, AlertResponse

app = FastAPI()

# CORS middleware: allow requests from the frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Startup: Create Tables and Default Admin
# -------------------------------
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async for db in get_db():
        result = await db.execute(select(User).where(User.username == "admin"))
        admin = result.scalars().first()
        if not admin:
            new_admin = User(
                username="admin",
                password=get_password_hash("changeme"),
                role="admin"
            )
            db.add(new_admin)
            await db.commit()
            print("Default admin created (username: admin, password: changeme)")
        break

# -------------------------------
# Authentication Endpoints
# -------------------------------
@app.post("/api/login")
async def login(user_data: dict, db: AsyncSession = Depends(get_db)):
    username = user_data.get("username")
    password = user_data.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required")
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token_data = {"sub": user.username, "role": user.role}
    token = create_access_token(token_data)
    return {"token": token, "user": {"username": user.username, "role": user.role}}

@app.post("/api/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user: dict, current_user: AuthUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin accounts can create new users")
    user["password"] = get_password_hash(user["password"])
    new_user = User(**user)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@app.get("/api/users", response_model=list[UserResponse])
async def list_users(current_user: AuthUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin accounts can view users")
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users

# -------------------------------
# Guest Endpoints
# -------------------------------
def generate_friendly_id(name: str) -> str:
    initials = "".join(word[0] for word in name.split()).upper()
    num = random.randint(1000, 9999)
    return f"{initials}-{num}"

@app.post("/api/guests", response_model=GuestResponse, status_code=status.HTTP_201_CREATED)
async def create_guest_endpoint(guest: dict, current_user: AuthUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # All authenticated users can create a guest.
    guest["flagged"] = False
    guest["friendly_id"] = generate_friendly_id(guest["name"])
    new_guest = Guest(**guest)
    db.add(new_guest)
    await db.commit()
    await db.refresh(new_guest)
    return new_guest

@app.get("/api/guests", response_model=list[GuestResponse])
async def list_guests(current_user: AuthUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Guest))
    guests = result.scalars().all()
    return guests

@app.get("/api/guests/search", response_model=list[GuestResponse])
async def search_guests(q: str = Query(..., description="Search term: Guest ID or name"), current_user: AuthUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(Guest).where(Guest.name.ilike(f"%{q}%"))
    result = await db.execute(stmt)
    guests = result.scalars().all()
    return guests

@app.put("/api/guests/{guest_id}/flag", response_model=GuestResponse)
async def flag_guest(guest_id: int, flag: dict, current_user: AuthUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role not in ["security", "admin"]:
        raise HTTPException(status_code=403, detail="Only security or admin accounts can flag guests")
    result = await db.execute(select(Guest).where(Guest.id == guest_id))
    guest = result.scalars().first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    guest.flagged = flag.get("flagged", False)
    if guest.flagged and current_user.role == "security":
        guest.flagged_by = current_user.username
    db.add(guest)
    await db.commit()
    await db.refresh(guest)
    return guest

# -------------------------------
# Check-In Endpoints
# -------------------------------
@app.post("/api/checkin", response_model=CheckInResponse, status_code=status.HTTP_201_CREATED)
async def check_in(checkin: dict, current_user: AuthUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    checkin["provider_username"] = current_user.username
    new_checkin = CheckIn(**checkin)
    db.add(new_checkin)
    await db.commit()
    await db.refresh(new_checkin)
    return new_checkin

@app.get("/api/checkins", response_model=list[CheckInResponse])
async def list_checkins(current_user: AuthUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CheckIn))
    checkins = result.scalars().all()
    return checkins

@app.get("/api/provider/checkins", response_model=list[CheckInResponse])
async def list_provider_checkins(current_user: AuthUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    stmt = select(CheckIn).where(
        CheckIn.provider_username == current_user.username,
        CheckIn.check_out_time == None
    )
    result = await db.execute(stmt)
    checkins = result.scalars().all()
    return checkins

@app.put("/api/checkin/{checkin_id}/checkout", response_model=CheckInResponse)
async def checkout_checkin(checkin_id: int, current_user: AuthUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CheckIn).where(CheckIn.id == checkin_id))
    checkin = result.scalars().first()
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in record not found")
    if checkin.provider_username != current_user.username and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to check out this guest")
    if checkin.check_out_time is not None:
        raise HTTPException(status_code=400, detail="Guest is already checked out")
    checkin.check_out_time = datetime.datetime.utcnow()
    db.add(checkin)
    await db.commit()
    await db.refresh(checkin)
    return checkin

# -------------------------------
# Alert Mechanism: GET Alerts Endpoint
# -------------------------------
@app.get("/api/alerts", response_model=list[AlertResponse])
async def list_alerts(current_user: AuthUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role == "security":
        stmt = select(Alert).where(Alert.flagged_by == current_user.username)
    else:
        stmt = select(Alert)
    result = await db.execute(stmt)
    alerts = result.scalars().all()
    return alerts

# -------------------------------
# OCR & Government Verification Simulation Endpoints
# -------------------------------
def simulate_ocr(file_content: bytes) -> dict:
    possible_doc_types = [
        "Driver Licence",
        "NIN",
        "Voters Card",
        "International Passport"
    ]
    return {
        "name": f"User{random.randint(100,999)}",
        "id_number": f"{random.randint(100000,999999)}",
        "document_type": random.choice(possible_doc_types)
    }

def simulate_government_verification(extracted_data: dict) -> dict:
    doc_type = extracted_data.get("document_type")
    if doc_type == "NIN":
        verified = random.choice([True, True, True, False])
    elif doc_type == "Driver Licence":
        verified = random.choice([True, True, False])
    elif doc_type == "Voters Card":
        verified = random.choice([True, False])
    elif doc_type == "International Passport":
        verified = random.choice([True, True, False])
    else:
        verified = False
    return {
        "verified": verified,
        "verification_details": f"Simulated verification for {doc_type} " + ("successful" if verified else "failed")
    }

@app.post("/api/extract-id", status_code=status.HTTP_200_OK)
async def extract_id(file: UploadFile = File(...), current_user: AuthUser = Depends(get_current_user)):
    try:
        file_content = await file.read()
        extracted_data = simulate_ocr(file_content)
        return JSONResponse(content={"extracted_data": extracted_data})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/verify-id", status_code=status.HTTP_200_OK)
async def verify_id(data: dict, current_user: AuthUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not all(k in data for k in ("name", "id_number", "document_type")):
        raise HTTPException(status_code=400, detail="Missing required fields for verification.")
    verification_result = simulate_government_verification(data)
    alert_data = None
    # Look up guest by id_number
    stmt = select(Guest).where(Guest.id_number == data["id_number"])
    result = await db.execute(stmt)
    guest = result.scalars().first()
    if guest and guest.flagged:
        # Create an alert record for this verification event.
        new_alert = Alert(
            guest_id=guest.friendly_id,
            guest_name=guest.name,
            provider_username=current_user.username,
            flagged_by=guest.flagged_by or "unknown"
        )
        db.add(new_alert)
        await db.commit()
        await db.refresh(new_alert)
        alert_data = {
            "guest_id": new_alert.guest_id,
            "guest_name": new_alert.guest_name,
            "provider_username": new_alert.provider_username,
            "alert_time": new_alert.alert_time.isoformat(),
            "flagged_by": new_alert.flagged_by
        }
    return JSONResponse(content={"verification": verification_result, "alert": alert_data})
