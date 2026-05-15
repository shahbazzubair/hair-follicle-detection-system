from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.core.database import db
from bson import ObjectId
import os
import shutil
import uuid
from datetime import datetime
import numpy as np
from PIL import Image

# --- AI MODEL SETUP ---
# We use a try-except block so your server doesn't crash if TensorFlow is missing
try:
    import tensorflow as tf
    MODEL_PATH = "ai_model/hair_model.h5"
    # Load model globally if it exists, otherwise it will be checked in the routes
    if os.path.exists(MODEL_PATH):
        hair_model = tf.keras.models.load_model(MODEL_PATH)
        print("✅ AI Model Loaded Successfully!")
    else:
        hair_model = None
except Exception as e:
    print(f"⚠️ AI Model Loading Error: {e}")
    hair_model = None

router = APIRouter()
scan_collection = db["scans"]

# --- HELPER: PROCESS IMAGE & PREDICT ---
def analyze_image_with_ai(image_path: str):
    if hair_model is None:
        raise HTTPException(status_code=503, detail="Pretrained AI model (.h5) is not integrated or failed to load.")
    
    try:
        # 1. Open the image and resize it to match your model's expected input (usually 224x224)
        # Note: Change (224, 224) if your specific model was trained on a different size!
        img = Image.open(image_path).convert('RGB')
        img = img.resize((224, 224)) 
        
        # 2. Convert to numpy array and normalize (scale pixels between 0 and 1)
        img_array = np.array(img) / 255.0
        
        # 3. Expand dimensions so it represents a "batch" of 1 image: shape (1, 224, 224, 3)
        img_array = np.expand_dims(img_array, axis=0)
        
        # 4. Run the prediction
        predictions = hair_model.predict(img_array)
        
        # 5. Map the prediction to a stage (Assuming a classification model)
        # Note: You may need to tweak this array based on how you trained your model!
        class_names = ["Norwood Stage 1", "Norwood Stage 2", "Norwood Stage 3", "Norwood Stage 4", "Norwood Stage 5", "Norwood Stage 6", "Norwood Stage 7"]
        predicted_index = np.argmax(predictions[0])
        
        if predicted_index < len(class_names):
            return class_names[predicted_index]
        else:
            return "Analysis Complete (Unknown Stage)"
            
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail="Error occurred during AI processing.")

# --- ROUTES ---

@router.get("/data/{doctor_name}")
async def get_doctor_data(doctor_name: str):
    scans_cursor = scan_collection.find({"doctorName": doctor_name})
    all_scans = await scans_cursor.to_list(length=500)
    
    pending_scans = []
    completed_reports = []
    
    for scan in all_scans:
        scan_data = {
                     "id": str(scan["_id"]),
                     "patientName": scan.get("patientName"),
                     "imagePath": scan.get("imagePath"),
                     "status": scan.get("status"),
                     "date": scan.get("date"),
                     "baldnessStage": scan.get("baldnessStage", ""),
                     "doctorId": scan.get("doctorId"),
                     "isDirectAnalysis": scan.get("isDirectAnalysis", False)
                  }
        if scan.get("status") == "Pending":
            pending_scans.append(scan_data)
        elif scan.get("status") == "Processed":
            completed_reports.append(scan_data)
            
    return {"scans": pending_scans, "reports": completed_reports}

@router.put("/process-scan/{scan_id}")
async def process_scan(scan_id: str):
    # 1. Find the scan in the database
    scan = await scan_collection.find_one({"_id": ObjectId(scan_id)})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")
    
    # 2. Get the local file path (remove the leading '/' from the URL path)
    local_image_path = scan["imagePath"].lstrip("/")
    
    # 3. Run the REAL AI Analysis
    ai_result = analyze_image_with_ai(local_image_path)
    
    # 4. Update the database
    await scan_collection.update_one(
        {"_id": ObjectId(scan_id)},
        {"$set": {
            "status": "Processed", 
            "baldnessStage": ai_result 
        }}
    )
    return {"status": "success", "message": "Scan processed."}

@router.post("/direct-analysis")
async def direct_analysis(
    doctorName: str = Form(...),
    patientName: str = Form(...),
    image: UploadFile = File(...)
):
    upload_dir = "static/uploads/scans"
    os.makedirs(upload_dir, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}_{image.filename}"
    local_path = os.path.join(upload_dir, unique_filename)
    
    with open(local_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    # Run the REAL AI Analysis on the newly uploaded file
    ai_result = analyze_image_with_ai(local_path)
        
    scan_doc = {
                "patientName": patientName,
                "doctorId": "Direct",
                "doctorName": doctorName,
                 "imagePath": f"/{upload_dir}/{unique_filename}",
                "status": "Processed",
                "baldnessStage": ai_result,
                "isDirectAnalysis": True,
                 "date": datetime.utcnow().isoformat()
      }
    await scan_collection.insert_one(scan_doc)
    return {"status": "success"}