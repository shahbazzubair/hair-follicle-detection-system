from fastapi import APIRouter, HTTPException, Body, UploadFile, File, Form
from app.database import user_collection
from pydantic import BaseModel, EmailStr
from fastapi.encoders import jsonable_encoder
import os
import shutil

router = APIRouter()

# Schema for Login validation
class LoginSchema(BaseModel):
    email: EmailStr
    password: str

# --- PATIENT SIGNUP ---
@router.post("/signup/patient")
async def signup_patient(
    fullName: str = Body(...),
    email: str = Body(...),
    phone: str = Body(...),
    password: str = Body(...)
):
    # Check for existing user
    existing_user = await user_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Store all provided patient data
    patient_dict = {
        "fullName": fullName,
        "email": email,
        "phone": phone,
        "password": password,
        "role": "patient",
        "status": "Active" # Patients don't need verification
    }
    
    await user_collection.insert_one(patient_dict)
    return {"status": "success", "message": "Patient registered successfully"}

# --- DOCTOR SIGNUP ---
@router.post("/signup/doctor")
async def signup_doctor(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    specialization: str = Form(...),
    degree: UploadFile = File(...)
):
    # Check for existing user
    existing_user = await user_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Save degree image to static folder for Admin viewing
    upload_dir = "static/uploads/degrees"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Create unique filename using email to prevent overwriting
    file_name = f"{email.replace('@', '_')}_{degree.filename}"
    file_path = os.path.join(upload_dir, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(degree.file, buffer)

    # Store comprehensive doctor data for Admin Dashboard
    doctor_dict = {
        "fullName": fullName,
        "email": email,
        "phone": phone,
        "password": password,
        "specialization": specialization,
        "degree_path": f"/static/uploads/degrees/{file_name}", # URL for frontend
        "role": "doctor",
        "status": "Pending" # UC-9: Verification required
    }
    
    await user_collection.insert_one(doctor_dict)
    return {"status": "success", "message": "Doctor registered. Awaiting Admin approval (24h)."}

# --- LOGIN ---
@router.post("/login")
async def login_user(credentials: LoginSchema = Body(...)):
    user = await user_collection.find_one({"email": credentials.email})
    
    # Validate credentials
    if not user or user["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Block unverified doctors and show the 24h message
    if user["role"] == "doctor" and user.get("status") == "Pending":
        raise HTTPException(
            status_code=403, 
            detail="Account pending. Please wait 24 hours for admin verification."
        )

    # Success response including full user context
    return {
        "status": "success",
        "message": f"Welcome back, {user.get('fullName')}",
        "role": user["role"],
        "fullName": user.get("fullName"),
        "user_id": str(user["_id"])
    }