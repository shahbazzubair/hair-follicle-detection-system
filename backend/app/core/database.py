import os
import motor.motor_asyncio
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.hair_follicle_db 

user_collection = db.users
scan_collection = db.scans
report_collection = db.reports

print(f"✅ Database client configured for: {MONGO_URL.split('@')[-1] if '@' in MONGO_URL else MONGO_URL}")