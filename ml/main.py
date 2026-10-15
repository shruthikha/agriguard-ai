import os
import sys
from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Form
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
from predict import predict_image_bytes, get_model_and_classes

app = FastAPI(
    title="AgriGuard AI - Crop Disease Classification Service",
    description="High-performance MobileNetV2 ML Inference API for Plant Leaf Diseases",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE_MB = int(os.environ.get("MAX_UPLOAD_SIZE_MB", "15"))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

@app.on_event("startup")
async def startup_event():
    print("🌾 Loading ML model into memory on startup...")
    try:
        get_model_and_classes()
        print("✅ ML Model loaded and ready for inference!")
    except Exception as e:
        print(f"⚠️ Warning loading model: {e}")

@app.get("/")
async def root():
    return {
        "service": "AgriGuard AI ML Engine",
        "status": "online",
        "health": "/health",
        "docs": "/docs"
    }

@app.get("/health")
@app.get("/api/health")
async def health_check():
    try:
        _, class_names = get_model_and_classes()
        model_loaded = True
        num_classes = len(class_names)
    except Exception:
        model_loaded = False
        num_classes = 0
        
    return {
        "status": "healthy",
        "modelLoaded": model_loaded,
        "classesCount": num_classes,
        "service": "AgriGuard AI ML Engine"
    }

@app.post("/predict")
async def predict_crop_disease(
    image: UploadFile = File(...),
    crop: Optional[str] = Form(None)
):
    filename = image.filename or "unknown"
    ext = os.path.splitext(filename.lower())[1]
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format '{ext}'. Allowed formats: JPG, JPEG, PNG, WEBP."
        )
        
    content = await image.read()
    
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty image uploaded.")
        
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Image file exceeds maximum allowable size of {MAX_FILE_SIZE_MB}MB."
        )
        
    try:
        result = predict_image_bytes(content, crop_hint=crop)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
