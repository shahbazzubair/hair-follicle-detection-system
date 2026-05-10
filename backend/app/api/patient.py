from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.core.database import user_collection, db
from bson import ObjectId
import os
import shutil
import uuid
from datetime import datetime

router = APIRouter()
scan_collection = db["scans"] # This creates our new table for scans!

# 1. Fetch VERIFIED doctors for the dropdown
@router.get("/doctors")
async def get_verified_doctors():
    doctors_cursor = user_collection.find({"role": "doctor", "status": "Verified"})
    doctors = await doctors_cursor.to_list(length=100)
    return [
        {
            "id": str(doc["_id"]),
            "fullName": doc.get("fullName"),
            "specialization": doc.get("specialization")
        } for doc in doctors
    ]

# 2. Fetch the patient's personal scan history
@router.get("/data/{username}")
async def get_patient_data(username: str):
    scans_cursor = scan_collection.find({"patientName": username})
    scans = await scans_cursor.to_list(length=100)
    
    formatted_scans = []
    formatted_reports = []
    
    for scan in scans:
        scan_data = {
            "id": str(scan["_id"]),
            "patientName": scan.get("patientName"),
            "doctorName": scan.get("doctorName"),
            "imagePath": scan.get("imagePath"),
            "status": scan.get("status"),
            "date": scan.get("date")
        }
        formatted_scans.append(scan_data)
        
        # If the doctor has analyzed it, it becomes a report!
        if scan.get("status") == "Processed":
            formatted_reports.append({
                "scanId": str(scan["_id"]),
                "patientName": scan.get("patientName"),
                "doctorName": scan.get("doctorName"),
                "baldnessStage": scan.get("baldnessStage", "Results Pending"),
                "date": scan.get("date")
            })
            
    return {"scans": formatted_scans, "reports": formatted_reports}

# 3. Handle the Image Upload
@router.post("/upload-scan")
async def upload_scan(
    patientName: str = Form(...),
    doctorId: str = Form(...),
    image: UploadFile = File(...)
):
    # Get the doctor's name from their ID
    doctor = await user_collection.find_one({"_id": ObjectId(doctorId)})
    doctor_name = doctor.get("fullName") if doctor else "Unknown"

    upload_dir = "static/uploads/scans"
    os.makedirs(upload_dir, exist_ok=True)
    
    unique_filename = f"{uuid.uuid4()}_{image.filename}"
    file_path = f"/{upload_dir}/{unique_filename}"
    local_path = os.path.join(upload_dir, unique_filename)
    
    with open(local_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    # Save the record to MongoDB!
    scan_doc = {
        "patientName": patientName,
        "doctorId": doctorId,
        "doctorName": doctor_name,
        "imagePath": file_path,
        "status": "Pending",
        "date": datetime.utcnow().isoformat()
    }
    await scan_collection.insert_one(scan_doc)
    
    return {"status": "success", "message": "Scan uploaded and saved to database."}