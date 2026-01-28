import motor.motor_asyncio
import os

MONGO_URL = "mongodb://localhost:27017"
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.hair_follicle_db 

# Define explicit collection handlers
user_collection = db.users
scans = db.scans
reports = db.reports