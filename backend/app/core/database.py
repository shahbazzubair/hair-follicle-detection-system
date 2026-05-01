import motor.motor_asyncio

# 1. The URL where your local MongoDB Compass is running
MONGO_URL = "mongodb://localhost:27017"

# 2. Create the asynchronous client
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)

# 3. Create (or connect to) our specific project database
db = client.hair_follicle_db 

# 4. Define the exact collections we will use
user_collection = db.users
scan_collection = db.scans
report_collection = db.reports

print("✅ Database connection established: hair_follicle_db")