from fastapi import APIRouter, HTTPException, Body, UploadFile, File, Form
from pydantic import BaseModel
from app.core.database import user_collection
import os
import shutil
import re

router = APIRouter()

# --- SECURITY POLICY ---
def validate_password_strength(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password) or not re.search(r"\d", password) or not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password does not meet security requirements.")

# --- SCHEMAS ---
class LoginSchema(BaseModel):
    email: str
    password: str

class PatientSignupSchema(BaseModel):
    fullName: str
    email: str
    phone: str
    password: str

# --- 1. PATIENT SIGNUP ---
@router.post("/signup/patient")
async def signup_patient(data: PatientSignupSchema):
    validate_password_strength(data.password)
    
    existing_user = await user_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    patient_dict = {
        "fullName": data.fullName, 
        "email": data.email, 
        "phone": data.phone,
        "password": data.password, 
        "role": "patient", 
        "status": "Active"
    }
    await user_collection.insert_one(patient_dict)
    return {"status": "success", "message": "Patient registered successfully"}

# --- 2. DOCTOR SIGNUP (With File Upload) ---
@router.post("/signup/doctor")
async def signup_doctor(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    specialization: str = Form(...),
    degree: UploadFile = File(...)
):
    validate_password_strength(password)
    
    existing_user = await user_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Handle File Storage
    upload_dir = "static/uploads/degrees"
    os.makedirs(upload_dir, exist_ok=True)
    file_name = f"{email.replace('@', '_')}_{degree.filename}"
    file_path = os.path.join(upload_dir, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(degree.file, buffer)
    
    doctor_dict = {
        "fullName": fullName, 
        "email": email, 
        "phone": phone, 
        "password": password,
        "specialization": specialization, 
        "degree_path": f"/{file_path}", # For the admin to view later
        "role": "doctor", 
        "status": "Pending" # Admin must approve
    }
    await user_collection.insert_one(doctor_dict)
    return {"status": "success", "message": "Doctor registered. Awaiting Admin approval."}

# --- 3. LOGIN ---
@router.post("/login")
async def login_user(credentials: LoginSchema):
    user = await user_collection.find_one({"email": credentials.email})
    
    if not user or user["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if user.get("role") == "doctor" and user.get("status") == "Pending":
        raise HTTPException(status_code=403, detail="Account pending admin verification.")
    
    return {
        "status": "success", 
        "role": user.get("role"),
        "fullName": user.get("fullName")
    }

# --- 4. MOCK FORGOT PASSWORD ---
@router.post("/forgot-password")
async def forgot_password(request: dict = Body(...)):
    email = request.get("email")
    user = await user_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered.")
    
    # NOTE: Add actual email sending logic here later
    return {"status": "success", "message": "Mock reset link generated."}

# --- 5. MOCK RESET PASSWORD ---
@router.post("/reset-password/{token}")
async def reset_password(token: str, data: dict = Body(...)):
    new_password = data.get("password")
    validate_password_strength(new_password)
    
    # NOTE: Add actual token decoding and DB updating logic here later
    return {"status": "success", "message": "Mock password updated."}