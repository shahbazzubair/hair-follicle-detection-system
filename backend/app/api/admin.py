from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.core.database import user_collection

router = APIRouter()

# 1. Fetch all users for the dashboard table
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
        } for user in users
    ]

# 2. Verify a pending doctor
@router.put("/verify-doctor/{user_id}")
async def verify_doctor(user_id: str, data: dict):
    await user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": data.get("status")}}
    )
    return {"status": "success", "message": "Doctor verified"}

# 3. Delete a user
@router.delete("/delete-user/{user_id}")
async def delete_user(user_id: str):
    await user_collection.delete_one({"_id": ObjectId(user_id)})
    return {"status": "success", "message": "User deleted"}