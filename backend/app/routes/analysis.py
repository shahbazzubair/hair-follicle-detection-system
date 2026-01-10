from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.database import db 
import os
import shutil

router = APIRouter()

# --- EXISTING: SAVES TO DATABASE ---
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

# --- NEW: DIRECT ANALYSIS (NO DATABASE) ---
@router.post("/process-direct")
async def process_direct(file: UploadFile = File(...)):
    """
    Processes a walk-in patient's image.
    This does NOT save any records to MongoDB.
    """
    try:
        # Optional: You can save the file to a 'temp' folder if your AI model 
        # needs a physical path, or process it directly from memory.
        
        # --- PLACE YOUR AI DETECTION LOGIC HERE ---
        # For now, we return calculated mock data.
        # Once your follicle detection script is ready, call it here.
        
        analysis_results = {
            "status": "success",
            "count": 142, # Mock Follicle Count
            "density": 85.4, # Mock Density
            "message": "Direct analysis complete. No data was stored in history."
        }
        
        return analysis_results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis Failed: {str(e)}")

# --- EXISTING: FETCH ASSIGNED PATIENTS ---
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