# backend/app/routes/analysis.py

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.database import db 
import os, shutil
import numpy as np
import tensorflow as tf
from tensorflow.keras import preprocessing, models
from bson import ObjectId

router = APIRouter()
MODEL_PATH = "models/hair_follicle_model.h5"
model = models.load_model(MODEL_PATH) if os.path.exists(MODEL_PATH) else None
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

def predict_stage(img_path):
    if not model: raise Exception("Model not loaded")
    img = preprocessing.image.load_img(img_path, target_size=(224, 224))
    img_array = preprocessing.image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return int(np.argmax(model.predict(img_array)[0]) + 1)

@router.post("/upload")
async def upload_analysis(patientName: str = Form(...), doctorId: str = Form(...), image_file: UploadFile = File(...)):
    ext = os.path.splitext(image_file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only image files allowed")

    upload_dir = "static/uploads/scans"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{patientName}_{image_file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image_file.file, buffer)

    await db.scans.insert_one({
        "patientName": patientName, 
        "doctorId": doctorId, 
        "imagePath": f"/static/uploads/scans/{patientName}_{image_file.filename}",
        "status": "Waiting", 
        "uploadDate": tf.timestamp().numpy()
    })
    return {"status": "success"}

@router.put("/process-patient/{scan_id}")
async def process_patient_scan(scan_id: str):
    scan = await db.scans.find_one({"_id": ObjectId(scan_id)})
    if not scan: raise HTTPException(status_code=404, detail="Scan not found")
    
    try:
        stage = predict_stage(scan["imagePath"].lstrip("/"))
        
        # CREATE SEPARATE REPORT
        await db.reports.insert_one({
            "scanId": scan_id,
            "patientName": scan["patientName"], 
            "doctorId": scan["doctorId"],
            "imagePath": scan["imagePath"],
            "baldnessStage": f"Stage {stage}", 
            "status": "Processed",
            "processedDate": tf.timestamp().numpy()
        })
        
        # UPDATE ORIGINAL SCAN
        await db.scans.update_one(
            {"_id": ObjectId(scan_id)},
            {"$set": {"status": "Processed"}}
        )
        
        return {"status": "success", "stage": f"Stage {stage}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/doctor-data/{doctor_name}")
async def get_doctor_data(doctor_name: str):
    query = {"doctorId": {"$regex": f"^{doctor_name}$", "$options": "i"}}
    waiting_scans = await db.scans.find({"doctorId": query["doctorId"], "status": "Waiting"}).to_list(100)
    final_reports = await db.reports.find(query).to_list(100)
    return {
        "scans": [{"id": str(s["_id"]), **{k:v for k,v in s.items() if k != "_id"}} for s in waiting_scans],
        "reports": [{"id": str(r["_id"]), **{k:v for k,v in r.items() if k != "_id"}} for r in final_reports]
    }

# NEW: PATIENT SPECIFIC DATA ENDPOINT
@router.get("/patient-data/{patient_name}")
async def get_patient_data(patient_name: str):
    query = {"patientName": patient_name}
    my_scans = await db.scans.find(query).to_list(100)
    my_reports = await db.reports.find(query).to_list(100)
    return {
        "scans": [{"id": str(s["_id"]), **{k:v for k,v in s.items() if k != "_id"}} for s in my_scans],
        "reports": [{"id": str(r["_id"]), **{k:v for k,v in r.items() if k != "_id"}} for r in my_reports]
    }