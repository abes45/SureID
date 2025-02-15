import datetime
import random
from fastapi import FastAPI, HTTPException, status, UploadFile, File, Header, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from models import Guest, GuestCreate, GuestUpdate, CheckIn, DocumentType, User, UserCreate, UserBase
from database import db
from bson import ObjectId
from pydantic import BaseModel

from auth import get_current_user, create_access_token, verify_password, get_password_hash, User as AuthUser

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Startup: Create Default Admin
# -------------------------------
@app.on_event("startup")
async def startup_event():
    admin = await db.users.find_one({"username": "admin"})
    if not admin:
        admin_data = {"username": "admin", "password": get_password_hash("changeme"), "role": "admin"}
        await db.users.insert_one(admin_data)
        print("Default admin created (username: admin, password: changeme)")

# -------------------------------
# Helper Functions
# -------------------------------
def generate_friendly_id(name: str) -> str:
    initials = ''.join(word[0] for word in name.split()).upper()
    random_number = random.randint(1000, 9999)
    return f"{initials}-{random_number}"

# -------------------------------
# Authentication Endpoints
# -------------------------------
@app.post("/api/login")
async def login(user_data: dict):
    username = user_data.get("username")
    password = user_data.get("password")
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password required.")
    user = await db.users.find_one({"username": username})
    if not user or not verify_password(password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid username or password.")
    token_data = {"sub": user["username"], "role": user["role"]}
    token = create_access_token(token_data)
    return {"token": token, "user": {"username": user["username"], "role": user["role"]}}

# Note: Logout is handled on the client by removing the token.

@app.post("/api/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can register new users.")
    user_dict = user.dict()
    user_dict["password"] = get_password_hash(user_dict["password"])
    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    return User(**user_dict)

# -------------------------------
# User Management Endpoints (Admin Only)
# -------------------------------
@app.get("/api/users", response_model=list[User])
async def list_users(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin accounts can view users.")
    users = []
    async for user in db.users.find():
        user["id"] = str(user["_id"])
        users.append(User(**user))
    return users

@app.post("/api/users", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin accounts can create new users.")
    user_dict = user.dict()
    # Hash the plain-text password before saving:
    user_dict["password"] = get_password_hash(user_dict["password"])
    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    return User(**user_dict)


# -------------------------------
# Guest Endpoints
# -------------------------------
@app.post("/api/guests", response_model=Guest, status_code=status.HTTP_201_CREATED)
async def create_guest(guest: GuestCreate, current_user: User = Depends(get_current_user)):
    if not current_user.role: # != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin accounts can create new guests."
        )
    guest_dict = guest.dict()
    guest_dict["flagged"] = False
    guest_dict["friendly_id"] = generate_friendly_id(guest_dict["name"])
    result = await db.guests.insert_one(guest_dict)
    guest_dict["id"] = str(result.inserted_id)
    await db.audit_logs.insert_one({
        "timestamp": datetime.datetime.utcnow(),
        "action": "Guest Created",
        "guest_id": guest_dict["id"],
        "details": guest_dict
    })
    return Guest(**guest_dict)

@app.get("/api/guests", response_model=list[Guest])
async def list_guests(current_user: User = Depends(get_current_user)):
    guests = []
    async for guest in db.guests.find():
        guest["id"] = str(guest["_id"])
        guests.append(Guest(**guest))
    return guests

class GuestFlag(BaseModel):
    flagged: bool

@app.put("/api/guests/{guest_id}/flag", response_model=Guest)
async def flag_guest(
    guest_id: str,
    flag: GuestFlag,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["security", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only security or admin accounts can flag guests."
        )
    update_result = await db.guests.update_one(
        {"_id": ObjectId(guest_id)},
        {"$set": {"flagged": flag.flagged}}
    )
    if update_result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Guest not found or flag status unchanged")
    guest = await db.guests.find_one({"_id": ObjectId(guest_id)})
    guest["id"] = str(guest["_id"])
    await db.audit_logs.insert_one({
        "timestamp": datetime.datetime.utcnow(),
        "action": "Guest Flag Updated",
        "guest_id": guest["id"],
        "new_flag_status": flag.flagged
    })
    return Guest(**guest)

@app.get("/api/guests/search", response_model=list[Guest])
async def search_guests(q: str = Query(..., description="Search term: Guest ID or name"), current_user: User = Depends(get_current_user)):
    guests = []
    try:
        guest_by_id = await db.guests.find_one({"_id": ObjectId(q)})
        if guest_by_id:
            guest_by_id["id"] = str(guest_by_id["_id"])
            guests.append(Guest(**guest_by_id))
    except Exception:
        pass
    async for guest in db.guests.find({"name": {"$regex": q, "$options": "i"}}):
        guest["id"] = str(guest["_id"])
        if guest["id"] not in [g.id for g in guests]:
            guests.append(Guest(**guest))
    return guests

# -------------------------------
# OCR & Government Verification Simulation
# -------------------------------
def simulate_ocr(file_content: bytes) -> dict:
    possible_doc_types = [
        DocumentType.driver_licence.value,
        DocumentType.nin.value,
        DocumentType.voters_card.value,
        DocumentType.international_passport.value
    ]
    return {
        "name": f"User{random.randint(100,999)}",
        "id_number": f"{random.randint(100000,999999)}",
        "document_type": random.choice(possible_doc_types)
    }

def simulate_government_verification(extracted_data: dict) -> dict:
    doc_type = extracted_data.get("document_type")
    if doc_type == DocumentType.nin.value:
        verified = random.choice([True, True, True, False])
    elif doc_type == DocumentType.driver_licence.value:
        verified = random.choice([True, True, False])
    elif doc_type == DocumentType.voters_card.value:
        verified = random.choice([True, False])
    elif doc_type == DocumentType.international_passport.value:
        verified = random.choice([True, True, False])
    else:
        verified = False
    return {
        "verified": verified,
        "verification_details": f"Simulated verification for {doc_type} " + ("successful" if verified else "failed")
    }

# -------------------------------
# Two-Step ID Extraction & Verification Endpoints
# -------------------------------
@app.post("/api/extract-id", status_code=status.HTTP_200_OK)
async def extract_id(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    try:
        file_content = await file.read()
        extracted_data = simulate_ocr(file_content)
        return JSONResponse(content={"extracted_data": extracted_data})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/verify-id", status_code=status.HTTP_200_OK)
async def verify_id(data: dict, current_user: User = Depends(get_current_user)):
    if not all(k in data for k in ("name", "id_number", "document_type")):
        raise HTTPException(status_code=400, detail="Missing required fields for verification.")
    verification_result = simulate_government_verification(data)
    return JSONResponse(content={"verification": verification_result})

# -------------------------------
# Check-In Endpoint (with Security Alert and Friendly ID Support)
# -------------------------------
@app.post("/api/checkin", response_model=CheckIn, status_code=status.HTTP_201_CREATED)
async def check_in_guest(checkin: CheckIn, current_user: User = Depends(get_current_user)):
    checkin_data = checkin.dict()
    current_time = datetime.datetime.utcnow()
    checkin_data["check_in_time"] = checkin_data.get("check_in_time") or current_time

    one_minute_ago = current_time - datetime.timedelta(minutes=1)
    recent_checkin = await db.checkins.find_one({
        "guest_id": checkin_data["guest_id"],
        "check_in_time": {"$gte": one_minute_ago}
    })
    if recent_checkin:
        checkin_data["flagged"] = True
    else:
        checkin_data["flagged"] = False

    try:
        guest_oid = ObjectId(checkin_data["guest_id"])
    except Exception:
        guest_record = await db.guests.find_one({"friendly_id": checkin_data["guest_id"]})
        if not guest_record:
            raise HTTPException(status_code=404, detail="Guest not found with provided friendly ID.")
        guest_oid = guest_record["_id"]
        checkin_data["guest_id"] = str(guest_oid)

    guest_record = await db.guests.find_one({"_id": guest_oid})
    if guest_record and guest_record.get("flagged", False):
        checkin_data["flagged"] = True
        checkin_data["alert"] = "Security Alert: This guest is flagged as suspicious."
    else:
        checkin_data["alert"] = ""

    result = await db.checkins.insert_one(checkin_data)
    checkin_data["id"] = str(result.inserted_id)
    await db.audit_logs.insert_one({
        "timestamp": datetime.datetime.utcnow(),
        "action": "Guest Check-In",
        "guest_id": checkin_data["guest_id"],
        "flagged": checkin_data["flagged"],
        "alert": checkin_data.get("alert", "")
    })
    return CheckIn(**checkin_data)

# -------------------------------
# Check-In History Endpoint
# -------------------------------
@app.get("/api/checkins", response_model=list[CheckIn])
async def list_checkins(current_user: User = Depends(get_current_user)):
    checkins = []
    async for checkin in db.checkins.find():
        checkin["id"] = str(checkin["_id"])
        checkins.append(CheckIn(**checkin))
    return checkins

# -------------------------------
# Audit Logs Endpoint
# -------------------------------
@app.get("/api/audit-logs", response_model=list)
async def audit_logs(current_user: User = Depends(get_current_user)):
    logs = []
    async for log in db.audit_logs.find().sort("timestamp", -1):
        log["id"] = str(log["_id"])
        logs.append(log)
    return logs
