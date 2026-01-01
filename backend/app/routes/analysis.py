from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.database import db # This import will now work
import os
import shutil

router = APIRouter()

@router.post("/upload")
async def upload_analysis(
    patientName: str = Form(...),
    doctorId: str = Form(...),
    image: UploadFile = File(...)
):
    # Ensure physical directory exists
    upload_dir = "static/uploads/scans"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Create unique filename
    file_name = f"{patientName.replace(' ', '_')}_{image.filename}"
    file_path = os.path.join(upload_dir, file_name)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Use 'db' to insert the analysis record
    analysis_entry = {
        "patientName": patientName,
        "doctorId": doctorId,
        "imagePath": f"/static/uploads/scans/{file_name}",
        "status": "Pending Review"
    }
    
    await db.analysis.insert_one(analysis_entry)
    return {"status": "success", "message": "Scan uploaded successfully"}

@router.get("/doctor/{doctor_name}")
async def get_doctor_patients(doctor_name: str):
    # Fetch scans assigned to a specific doctor
    scans = await db.analysis.find({"doctorId": doctor_name}).to_list(1000)
    return [
        {
            "patientName": s["patientName"],
            "imagePath": s["imagePath"],
            "status": s["status"]
        } for s in scans
    ]