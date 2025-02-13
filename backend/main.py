# backend/main.py
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from models import Guest, GuestCreate, GuestUpdate
from database import db
from bson import ObjectId

app = FastAPI()

# Allow CORS for requests from the React frontend (typically running on localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://frontend:3000","http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/guests", response_model=Guest, status_code=status.HTTP_201_CREATED)
async def create_guest(guest: GuestCreate):
    guest_dict = guest.dict()
    result = await db.guests.insert_one(guest_dict)
    guest_dict["id"] = str(result.inserted_id)
    return Guest(**guest_dict)

@app.get("/api/guests", response_model=list[Guest])
async def list_guests():
    guests = []
    async for guest in db.guests.find():
        guest["id"] = str(guest["_id"])
        guests.append(Guest(**guest))
    return guests

@app.get("/api/guests/{guest_id}", response_model=Guest)
async def get_guest(guest_id: str):
    guest = await db.guests.find_one({"_id": ObjectId(guest_id)})
    if guest is None:
        raise HTTPException(status_code=404, detail="Guest not found")
    guest["id"] = str(guest["_id"])
    return Guest(**guest)

@app.put("/api/guests/{guest_id}", response_model=Guest)
async def update_guest(guest_id: str, guest_update: GuestUpdate):
    update_data = {k: v for k, v in guest_update.dict().items() if v is not None}
    result = await db.guests.update_one({"_id": ObjectId(guest_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Guest not found")
    guest = await db.guests.find_one({"_id": ObjectId(guest_id)})
    guest["id"] = str(guest["_id"])
    return Guest(**guest)

@app.delete("/api/guests/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_guest(guest_id: str):
    result = await db.guests.delete_one({"_id": ObjectId(guest_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Guest not found")
    return
