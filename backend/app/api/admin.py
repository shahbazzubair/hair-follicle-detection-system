import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import APIRouter, HTTPException
from bson import ObjectId
from dotenv import load_dotenv

from app.core.database import user_collection

load_dotenv()

router = APIRouter()

# --- HELPER FUNCTION: SEND EMAILS ---
def send_status_email(to_email: str, doctor_name: str, status: str):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")
    smtp_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("MAIL_PORT", 587))

    if not sender_email or not sender_password:
        print("⚠️ Email credentials (MAIL_USERNAME/MAIL_PASSWORD) not configured in .env. Skipping email notification.")
        return False

    if not to_email:
        print("⚠️ No recipient email provided. Skipping email.")
        return False

    if status == "Approved":
        subject = "Doctor Account Approved"
        body = f"""Hello Dr. {doctor_name},

We are pleased to inform you that your registration request for the Hair Follicle Detection AI Portal has been successfully approved by the administration team.

Your account is now active, and you may log in to the platform using your registered credentials.

We appreciate your interest in joining our platform and look forward to your valuable contribution.

Best Regards,
Hair Follicle Detection AI Team"""
    else:
        subject = "Doctor Account Rejected"
        body = f"""Hello Dr. {doctor_name},

Thank you for your interest in registering with the Hair Follicle Detection AI Portal.

After careful review of your submitted application, we regret to inform you that your registration request could not be approved at this time.

If you believe this decision was made in error or you require further clarification, please feel free to contact the administration team.

We sincerely appreciate your time and interest.

Best Regards,
Hair Follicle Detection AI Team"""

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"✅ Status email successfully sent to {to_email}")
        return True
    except Exception as e:
        print(f"⚠️ Email sending failed: {e}. (Database status was updated successfully)")
        return False


# --- ROUTES ---

@router.get("/users")
async def get_all_users():
    users = await user_collection.find().to_list(1000)
    return [
        {
            "id": str(user["_id"]),
            "fullName": user.get("fullName"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "role": user.get("role"),
            "status": user.get("status", "Active"),
            "specialization": user.get("specialization"),
            "degree_path": user.get("degree_path")
        }
        for user in users
    ]

@router.put("/verify-doctor/{user_id}")
async def verify_doctor(user_id: str, data: dict):
    status = data.get("status")
    
    # Edge case handled: Check for invalid status before hitting the database
    if status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'Approved' or 'Rejected'.")

    doctor = await user_collection.find_one({"_id": ObjectId(user_id)})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # 1. Update status in database first
    if status == "Approved":
        await user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"status": "Approved"}}
        )
    elif status == "Rejected":
        await user_collection.delete_one({"_id": ObjectId(user_id)})

    # 2. Attempt to send email notification (fails gracefully without aborting)
    send_status_email(doctor.get("email"), doctor.get("fullName"), status)

    return {"status": "success", "message": f"Doctor {status.lower()} successfully"}

@router.delete("/delete-user/{user_id}")
async def delete_user(user_id: str):
    result = await user_collection.delete_one({"_id": ObjectId(user_id)})
    
    # Edge case handled: Let the user know if the ID didn't match anyone
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"status": "success", "message": "User deleted"}