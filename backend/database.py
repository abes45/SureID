# backend/database.py
import os
import motor.motor_asyncio

# Get the MongoDB URI from an environment variable.
# The default uses user 'root', password 'example', host 'mongodb' (Docker service), port 27017,
# and specifies 'admin' as the authSource so that the credentials are verified against the admin database.
MONGO_URI = os.getenv("MONGO_URI", "mongodb://root:example@mongodb:27017/?authSource=admin")

# Create an asynchronous MongoDB client.
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)

# Connect to the 'sureid' database.
database = client.sureid

# Expose the database object as 'db'
db = database
