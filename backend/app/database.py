import motor.motor_asyncio
import os

# MongoDB Connection URL
MONGO_URL = "mongodb://localhost:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)

# Explicitly define 'db' so it can be imported elsewhere
db = client.hair_follicle_db 

# Keep your existing collections for backward compatibility
user_collection = db.users
analysis_collection = db.analysis

# Database and collection as defined in SDS [cite: 413, 451]
database = client.hair_follicle_db
user_collection = database.get_collection("users")