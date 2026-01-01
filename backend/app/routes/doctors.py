from fastapi import APIRouter, HTTPException
from app.database import user_collection

router = APIRouter()

@router.get("/list")
async def get_verified_doctors():
    # Only fetch users with role 'doctor' and status 'Verified'
    doctors = await user_collection.find({
        "role": "doctor",
        "status": "Verified"
    }).to_list(1000)
    
    return [
        {
            "fullName": doc.get("fullName"),
            "email": doc.get("email"),
            "specialization": doc.get("specialization"),
            "phone": doc.get("phone")
        } for doc in doctors
    ]