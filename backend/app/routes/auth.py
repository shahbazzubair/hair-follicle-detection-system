from dotenv import load_dotenv
load_dotenv() 

from fastapi import APIRouter, HTTPException, Body, UploadFile, File, Form
from app.database import user_collection
from pydantic import BaseModel, EmailStr
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from itsdangerous import URLSafeTimedSerializer
import os
import shutil

router = APIRouter()

# --- EMAIL & TOKEN CONFIGURATION ---
# SECRET_KEY matches your App Password for consistency
SECRET_KEY = os.getenv("MAIL_PASSWORD", "mtthemzpuvqjbtbc") 
serializer = URLSafeTimedSerializer(SECRET_KEY)

# SMTP CONFIG: Port 587 with STARTTLS for Gmail compatibility
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True, 
    MAIL_SSL_TLS=False,   
    USE_CREDENTIALS=True
)

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

# --- 1. PATIENT SIGNUP ---
@router.post("/signup/patient")
async def signup_patient(
    fullName: str = Body(...),
    email: str = Body(...),
    phone: str = Body(...),
    password: str = Body(...)
):
    existing_user = await user_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    patient_dict = {
        "fullName": fullName, 
        "email": email, 
        "phone": phone,
        "password": password, 
        "role": "patient", 
        "status": "Active"
    }
    await user_collection.insert_one(patient_dict)
    return {"status": "success", "message": "Patient registered successfully"}

# --- 2. DOCTOR SIGNUP (With Degree Upload) ---
@router.post("/signup/doctor")
async def signup_doctor(
    fullName: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    specialization: str = Form(...),
    degree: UploadFile = File(...)
):
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
        "degree_path": f"/static/uploads/degrees/{file_name}",
        "role": "doctor", 
        "status": "Pending"
    }
    await user_collection.insert_one(doctor_dict)
    return {"status": "success", "message": "Doctor registered. Awaiting Admin approval."}

# --- 3. LOGIN (With Role & Status Check) ---
@router.post("/login")
async def login_user(credentials: LoginSchema = Body(...)):
    user = await user_collection.find_one({"email": credentials.email})
    
    if not user or user["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if Doctor is verified
    if user["role"] == "doctor" and user.get("status") == "Pending":
        raise HTTPException(status_code=403, detail="Account pending admin verification.")
    
    return {
        "status": "success", 
        "role": user["role"],
        "fullName": user.get("fullName"), 
        "user_id": str(user["_id"])
    }

# --- 4. FORGOT PASSWORD (With Real Database Validation) ---
@router.post("/forgot-password")
async def forgot_password(request: dict = Body(...)):
    email = request.get("email")
    print(f"DEBUG: Processing forgot-password for: {email}")
    
    # VALIDATION: Check if user exists in the database
    user = await user_collection.find_one({"email": email})
    
    if not user:
        print(f"DEBUG: {email} not found.")
        # We throw a 404 so the frontend can show the "Not Registered" popup
        raise HTTPException(
            status_code=404, 
            detail="This email address is not registered in our system."
        )

    # Generate Token
    token = serializer.dumps(email, salt="password-reset-salt")
    reset_link = f"http://localhost:5173/reset-password/{token}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">HairCare AI Password Reset</h2>
        <p>Hello {user.get('fullName', 'User')},</p>
        <p>Click the button below to reset your password:</p>
        <a href="{reset_link}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">This link expires in 30 minutes.</p>
    </div>
    """
    
    message = MessageSchema(
        subject="Password Reset Request - HairCare AI",
        recipients=[email],
        body=html_content,
        subtype="html"
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"✅ SUCCESS: Reset email sent to {email}")
        return {"status": "success", "message": "Reset link sent to your email."}
    except Exception as e:
        print(f"❌ SMTP ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email. Please try again later.")

# --- 5. RESET PASSWORD (Final Database Update) ---
@router.post("/reset-password/{token}")
async def reset_password(token: str, data: dict = Body(...)):
    try:
        # Verify token (expires in 30 mins)
        email = serializer.loads(token, salt="password-reset-salt", max_age=1800)
        new_password = data.get("password")

        if not new_password or len(new_password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

        # Update the user record
        result = await user_collection.update_one(
            {"email": email},
            {"$set": {"password": new_password}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found.")

        print(f"✅ SUCCESS: Password updated for {email}")
        return {"status": "success", "message": "Password updated successfully"}

    except Exception as e:
        print(f"❌ RESET ERROR: {str(e)}")
        raise HTTPException(status_code=400, detail="The reset link is invalid or has expired.")