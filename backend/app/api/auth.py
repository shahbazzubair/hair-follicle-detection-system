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
        raise HTTPException(
            status_code=500, 
            detail="Email service not configured. Please set MAIL_USERNAME and MAIL_PASSWORD in backend/.env"
        )

    reset_link = f"http://localhost:5173/reset-password/{reset_token}"
    msg = MIMEMultipart("alternative")
    msg['From'] = f"Hair Follicle Detection Portal <{sender_email}>"
    msg['To'] = to_email
    msg['Subject'] = "Password Reset Request - Hair Follicle Detection Portal"
    
    text_body = f"""Hello,

You requested a password reset for your account on the Hair Follicle Detection AI Portal.

Click the link below to set a new password:
{reset_link}

If you did not request a password reset, you can safely ignore this email.

Best Regards,
Hair Follicle Detection AI Team"""

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 20px; }}
        .card {{ background-color: #ffffff; max-width: 520px; margin: 0 auto; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0; }}
        .btn {{ display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
        .footer {{ font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your account on the <strong>Hair Follicle Detection AI Portal</strong>.</p>
        <p>Click the button below to securely create a new password:</p>
        <p style="text-align: center;">
          <a href="{reset_link}" class="btn">Reset Password</a>
        </p>
        <p style="font-size: 13px; color: #64748b;">Or copy and paste this link into your browser:<br><a href="{reset_link}">{reset_link}</a></p>
        <div class="footer">
          If you did not make this request, please ignore this email. Your account remains secure.
        </div>
      </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(text_body, 'plain'))
    msg.attach(MIMEText(html_body, 'html'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=15)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"✅ Reset email successfully sent to {to_email}")
        return True
    except smtplib.SMTPAuthenticationError:
        raise HTTPException(
            status_code=500,
            detail="SMTP Authentication Failed. Please check your MAIL_USERNAME and MAIL_PASSWORD (use an App Password)."
        )
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

    clean_email = email.strip().lower()
    user = await user_collection.find_one({"email": clean_email})
    if not user:
        raise HTTPException(status_code=404, detail="This email is not registered in our system.")
    
    reset_token = secrets.token_urlsafe(32)
    await user_collection.update_one(
        {"email": clean_email}, 
        {"$set": {"reset_token": reset_token}}
    )
    
    send_reset_email(clean_email, reset_token)
    
    return {
        "status": "success", 
        "message": "A password reset link has been sent to your email address. Please check your inbox."
    }

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