from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import auth, admin, doctors, analysis
import os

app = FastAPI(title="Hair Follicle Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory Setup
for path in ["static/uploads/degrees", "static/uploads/scans"]:
    os.makedirs(path, exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Connect routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(doctors.router, prefix="/api/doctors", tags=["Doctors"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])

@app.get("/")
def home():
    return {"message": "Server is running!"}