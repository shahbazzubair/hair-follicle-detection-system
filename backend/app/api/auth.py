import os
import re
import shutil
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, HTTPException, Body, UploadFile, File, Form
from pydantic import BaseModel
from dotenv import load_dotenv

from app.core.database import user_collection

load_dotenv()
router = APIRouter()

# --- SECURITY & VALIDATION POLICIES ---
def validate_password_strength(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password) or not re.search(r"\d", password) or not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password does not meet security requirements.")

def validate_pakistan_phone(phone: str):
    cleaned = re.sub(r"[\s\-]", "", phone)
    pattern = r"^(?:\+92|0092|92|0)?3[0-9]{9}$"
    if not re.match(pattern, cleaned):
        raise HTTPException(
            status_code=400, 
            detail="Invalid Pakistani phone number. Please enter a valid mobile number (e.g., 03001234567 or +923001234567)."
        )

def validate_full_name(name: str):
    if len(name.strip()) < 3:
        raise HTTPException(status_code=400, detail="Full Name must be at least 3 characters long.")
    if not re.match(r"^[a-zA-Z\s.]+$", name.strip()):
        raise HTTPException(status_code=400, detail="Full Name can only contain letters, spaces, and periods.")

def validate_email_format(email: str):
    if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email.strip()):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

# --- SCHEMAS ---
class LoginSchema(BaseModel):
    email: str
    password: str

class PatientSignupSchema(BaseModel):
    fullName: str
    email: str
    phone: str
    password: str

# --- HELPER FUNCTION: SEND RESET EMAIL ---
def send_reset_email(to_email: str, reset_token: str):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")
    smtp_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("MAIL_PORT", 587))

    if not sender_email or not sender_password:
        raise HTTPException(status_code=500, detail="Server email configuration is missing or invalid.")

    reset_link = f"http://localhost:5173/reset-password/{reset_token}"
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = "HFD AI Portal - Password Reset"
    
    body = f"Hello,\n\nYou requested a password reset. Click the link below to securely set a new password:\n\n{reset_link}\n\nIf you did not request this, please ignore this email."
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print(f"Email Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# --- ROUTES ---

@router.post("/signup/patient")
async def signup_patient(data: PatientSignupSchema):
    validate_full_name(data.fullName)
    validate_email_format(data.email)
    validate_pakistan_phone(data.phone)
    validate_password_strength(data.password)
    
    existing_user = await user_collection.find_one({"email": data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    patient_dict = {
        "fullName": data.fullName.strip(), 
        "email": data.email.strip().lower(), 
        "phone": data.phone.strip(),
        "password": data.password, 
        "role": "patient", 
        "status": "Active"
    }
    await user_collection.insert_one(patient_dict)
    return {"status": "success", "message": "Patient registered successfully"}

@router.post("/signup/doctor")
async def signup_doctor(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    specialization: str = Form(...),
    degree: UploadFile = File(...)
):
    validate_full_name(fullName)
    validate_email_format(email)
    validate_pakistan_phone(phone)
    validate_password_strength(password)
    
    if len(specialization.strip()) < 3:
        raise HTTPException(status_code=400, detail="Specialization must be at least 3 characters long.")
    
    allowed_extensions = {".jpg", ".jpeg", ".png", ".pdf"}
    ext = os.path.splitext(degree.filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid degree file. Only JPG, PNG, and PDF formats are supported.")
    
    existing_user = await user_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    upload_dir = "static/uploads/degrees"
    os.makedirs(upload_dir, exist_ok=True)
    file_name = f"{email.replace('@', '_')}_{degree.filename}"
    file_path = os.path.join(upload_dir, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(degree.file, buffer)
    
    doctor_dict = {
        "fullName": fullName.strip(), 
        "email": email.strip().lower(), 
        "phone": phone.strip(), 
        "password": password, 
        "specialization": specialization.strip(), 
        "degree_path": f"/{file_path}", 
        "role": "doctor", 
        "status": "Pending" 
    }
    await user_collection.insert_one(doctor_dict)
    return {"status": "success", "message": "Doctor registered. Awaiting Admin approval."}

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

@router.post("/forgot-password")
async def forgot_password(request: dict = Body(...)):
    email = request.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email field is required.")

    user = await user_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered.")
    
    reset_token = secrets.token_urlsafe(32)
    await user_collection.update_one(
        {"email": email}, 
        {"$set": {"reset_token": reset_token}}
    )
    
    send_reset_email(email, reset_token)
    return {"status": "success", "message": "Reset link sent successfully."}

@router.post("/reset-password/{token}")
async def reset_password(token: str, data: dict = Body(...)):
    new_password = data.get("password")
    if not new_password:
        raise HTTPException(status_code=400, detail="Password field is required.")

    validate_password_strength(new_password)
    
    user = await user_collection.find_one({"reset_token": token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")
    
    await user_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password": new_password},
            "$unset": {"reset_token": ""} 
        }
    )
    return {"status": "success", "message": "Password updated securely."}