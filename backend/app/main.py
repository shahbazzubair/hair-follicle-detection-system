from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # <-- NEW IMPORT
import os
from app.core.database import db

# Import your route files
from app.api.auth import router as auth_router
from app.api.admin import router as admin_router # <-- Added this

app = FastAPI(title="HFD AI Backend")

# --- CORS SECURITY GUARD ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- CONNECT THE ROUTES ---
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"]) # <-- Connected it here

@app.on_event("startup")
async def startup_db_client():
    print("🚀 FastAPI Server Started!")
    print("🔌 Database connected successfully.")

@app.get("/")
async def root():
    return {"status": "online", "message": "Welcome to the HFD AI API!"}