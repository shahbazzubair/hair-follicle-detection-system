from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.core.database import db
from bson import ObjectId
import os
import shutil
import uuid
from datetime import datetime
import numpy as np
from PIL import Image

# ==============================
# AI MODEL CONFIGURATION
# ==============================
# Choose your active model:
# "VIT" -> Vision Transformer (google/vit-base-patch16-224 - 92.99% Accuracy) [RECOMMENDED]
# "CNN" -> Legacy CNN / VGG19 (hair_model.h5)
ACTIVE_MODEL = "VIT"

# 1. Vision Transformer Setup
VIT_MODEL_PATH = "ai_model/hair_vit_model"
vit_model = None
vit_processor = None
device = None

try:
    import torch
    from transformers import AutoImageProcessor, AutoModelForImageClassification

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    if os.path.exists(VIT_MODEL_PATH):
        vit_processor = AutoImageProcessor.from_pretrained(VIT_MODEL_PATH)
        vit_model = AutoModelForImageClassification.from_pretrained(VIT_MODEL_PATH)
        vit_model.to(device)
        vit_model.eval()
        print(f"✅ Vision Transformer (ViT) Model Loaded on {device}!")
    else:
        print(f"⚠️ ViT Model directory '{VIT_MODEL_PATH}' not found.")

except Exception as e:
    print(f"⚠️ Vision Transformer Loading Error: {e}")
    vit_model = None
    vit_processor = None

# 2. Legacy CNN (VGG19) Setup
CNN_MODEL_PATH = "ai_model/hair_model.h5"
cnn_model = None

try:
    import tensorflow as tf

    if os.path.exists(CNN_MODEL_PATH):
        cnn_model = tf.keras.models.load_model(CNN_MODEL_PATH)
        print("✅ Legacy CNN (VGG19) Model Loaded Successfully!")
    else:
        print(f"⚠️ CNN Model '{CNN_MODEL_PATH}' not found.")

except Exception as e:
    print(f"⚠️ CNN Model Loading Error: {e}")
    cnn_model = None

router = APIRouter()

scan_collection = db["scans"]

# ==============================
# AI ANALYSIS FUNCTION
# ==============================

def analyze_image_with_ai(image_path: str):
    """
    Analyzes a scalp image using either the Vision Transformer (ViT) or the Legacy CNN model
    based on the ACTIVE_MODEL setting.
    """
    stage_mapping = {
        0: "Norwood Stage 1",
        1: "Norwood Stage 2",
        2: "Norwood Stage 3",
        3: "Norwood Stage 4",
        4: "Norwood Stage 5",
        5: "Norwood Stage 6",
        6: "Norwood Stage 7"
    }

    # ------------------------------------
    # MODE 1: Vision Transformer (ViT)
    # ------------------------------------
    if ACTIVE_MODEL.upper() == "VIT":
        if vit_model is None or vit_processor is None:
            raise HTTPException(
                status_code=503,
                detail="Vision Transformer AI model is not loaded. Ensure ai_model/hair_vit_model exists."
            )

        try:
            import torch
            img = Image.open(image_path).convert("RGB")
            inputs = vit_processor(images=img, return_tensors="pt")
            inputs = {k: v.to(device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = vit_model(**inputs)
                probabilities = torch.softmax(outputs.logits, dim=-1)
                predicted_index = probabilities.argmax(dim=-1).item()
                confidence = probabilities[0, predicted_index].item()

            stage_name = stage_mapping.get(predicted_index, f"Norwood Stage {predicted_index + 1}")
            print(f"🔬 [ViT Analysis] {stage_name} (Confidence: {confidence * 100:.1f}%)")
            return stage_name

        except Exception as e:
            print(f"ViT Prediction Error: {e}")
            raise HTTPException(
                status_code=500,
                detail="Error during Vision Transformer AI processing."
            )

    # ------------------------------------
    # MODE 2: Legacy CNN (VGG19)
    # ------------------------------------
    elif ACTIVE_MODEL.upper() == "CNN":
        if cnn_model is None:
            raise HTTPException(
                status_code=503,
                detail="Legacy CNN AI model is not loaded. Ensure ai_model/hair_model.h5 exists."
            )

        try:
            img = Image.open(image_path).convert("RGB")
            img = img.resize((224, 224))
            img_array = np.array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            predictions = cnn_model.predict(img_array)
            predicted_index = int(np.argmax(predictions[0]))
            confidence = float(predictions[0][predicted_index])

            stage_name = stage_mapping.get(predicted_index, f"Norwood Stage {predicted_index + 1}")
            print(f"🔬 [CNN Analysis] {stage_name} (Confidence: {confidence * 100:.1f}%)")
            return stage_name

        except Exception as e:
            print(f"CNN Prediction Error: {e}")
            raise HTTPException(
                status_code=500,
                detail="Error during CNN AI processing."
            )

    else:
        raise HTTPException(
            status_code=500,
            detail=f"Unknown ACTIVE_MODEL: '{ACTIVE_MODEL}'. Please set to 'VIT' or 'CNN'."
        )

# ==============================
# GET DOCTOR DATA
# ==============================

@router.get("/data/{doctor_name}")
async def get_doctor_data(doctor_name: str):

    scans_cursor = scan_collection.find({
        "doctorName": doctor_name
    })

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

    return {
        "scans": pending_scans,
        "reports": completed_reports
    }

# ==============================
# PROCESS PATIENT SCAN
# ==============================

@router.put("/process-scan/{scan_id}")
async def process_scan(scan_id: str):

    scan = await scan_collection.find_one({
        "_id": ObjectId(scan_id)
    })

    if not scan:
        raise HTTPException(
            status_code=404,
            detail="Scan not found."
        )

    local_image_path = scan["imagePath"].lstrip("/")

    ai_result = analyze_image_with_ai(local_image_path)

    await scan_collection.update_one(
        {"_id": ObjectId(scan_id)},
        {
            "$set": {
                "status": "Processed",
                "baldnessStage": ai_result
            }
        }
    )

    return {
        "status": "success",
        "message": "Scan processed successfully"
    }

# ==============================
# DIRECT ANALYSIS
# ==============================

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

    return {
        "status": "success"
    }

# ==============================
# GET SINGLE DOCTOR PROFILE
# ==============================

@router.get("/profile/{doctor_name}")
async def get_profile(doctor_name: str):

    doctor = await db["users"].find_one({
        "fullName": {
            "$regex": f"^{doctor_name.strip()}$",
            "$options": "i"
        }
    })

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found"
        )

    doctor["_id"] = str(doctor["_id"])

    return {
        "_id": doctor["_id"],
        "fullName": doctor.get("fullName", ""),
        "speciality": doctor.get(
            "speciality",
            doctor.get("specialization", "")
        ),
        "contactNumber": doctor.get(
            "contactNumber",
            doctor.get("phone", "")
        ),
         "about": doctor.get("about", ""),
        "profileImage": doctor.get("profileImage", ""),
        "weeklySchedule": doctor.get("weeklySchedule", [])
    }

# ==============================
# UPLOAD PROFILE IMAGE
# ==============================

@router.post("/upload-profile-image")
async def upload_profile_image(
    file: UploadFile = File(...)
):

    upload_dir = "static/uploads/profile"

    os.makedirs(upload_dir, exist_ok=True)

    unique_filename = f"{uuid.uuid4()}_{file.filename}"

    file_path = os.path.join(
        upload_dir,
        unique_filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "imagePath": f"/static/uploads/profile/{unique_filename}"
    }
# ==============================
# UPDATE DOCTOR PROFILE
# ==============================

@router.put("/update-profile")
async def update_profile(data: dict):

    print("Incoming Data:", data)

    doctor_name = data.get("doctorName", "").strip()

    if not doctor_name:
        raise HTTPException(
            status_code=400,
            detail="Doctor name is required"
        )

    # FIND DOCTOR
    doctor = await db["users"].find_one({
        "fullName": {
            "$regex": f"^{doctor_name}$",
            "$options": "i"
        },
        "role": "doctor"
    })

    print("FOUND DOCTOR:", doctor)

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail=f"Doctor '{doctor_name}' not found in database"
        )

    update_data = {
        "specialization": data.get("speciality", ""),
        "phone": data.get("contactNumber", ""),
        "about": data.get("about", ""),
        "weeklySchedule": data.get("weeklySchedule", []),
        "profileImage": data.get("profileImage", "")
    }

    result = await db["users"].update_one(
        {
            "_id": doctor["_id"]
        },
        {
            "$set": update_data
        }
    )

    print("UPDATE RESULT:", result.modified_count)

    return {
        "status": "success",
        "message": "Doctor profile updated successfully"
    }
@router.get("/all-doctors")
async def get_all_doctors():

    doctors_cursor = db["users"].find({
        "role": "doctor",
        "status": "Approved"
    })

    doctors = await doctors_cursor.to_list(length=100)

    formatted_doctors = []

    for doctor in doctors:

        formatted_doctors.append({
            "id": str(doctor["_id"]),
            "fullName": doctor.get("fullName", ""),
            "speciality": doctor.get(
                "specialization",
                ""
            ),
            "contactNumber": doctor.get(
                "phone",
                ""
            ),
             "about": doctor.get(
                 "about", 
                 ""
           ),
            "profileImage": doctor.get(
                "profileImage",
                ""
            ),
            "weeklySchedule": doctor.get(
                "weeklySchedule",
                []
            )
        })

    return formatted_doctors