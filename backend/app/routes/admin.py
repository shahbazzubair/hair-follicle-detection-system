from fastapi import APIRouter, HTTPException
from app.database import user_collection
from bson import ObjectId

router = APIRouter()

@router.get("/users")
async def get_all_users():
    # Fetch all users from the database
    users = await user_collection.find().to_list(1000)
    return [
        {
            "id": str(user["_id"]),
            "fullName": user.get("fullName"),
            "email": user.get("email"),
            "phone": user.get("phone"), # FIXED: Added phone mapping
            "role": user.get("role"),
            "status": user.get("status", "Active"),
            "specialization": user.get("specialization"),
            "degree_path": user.get("degree_path") # Ensure path is passed to frontend
        } for user in users
    ]

@router.put("/verify-doctor/{user_id}")
async def verify_doctor(user_id: str, data: dict):
    result = await user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": data.get("status")}}
    )
    return {"message": "Status updated"}

@router.delete("/delete-user/{user_id}")
async def delete_user(user_id: str):
    await user_collection.delete_one({"_id": ObjectId(user_id)})
    return {"message": "User deleted"}