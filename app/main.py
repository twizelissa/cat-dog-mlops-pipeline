"""
FastAPI Application for Cats vs Dogs Classification
Provides REST API and web interface for predictions and retraining
"""

import os
import sys
import io
import json
import shutil
from pathlib import Path
from datetime import datetime
from typing import List, Optional
import asyncio
import time
import numpy as np
from PIL import Image

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import uvicorn
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / 'src'))

from preprocessing import ImagePreprocessor, get_dataset_statistics
from model import CatsDogsModel
from prediction import Predictor

# Initialize FastAPI app
app = FastAPI(title="Cats vs Dogs Classification API", version="1.0.0")

# Mount static files and templates
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

# Paths
BASE_DIR = Path(__file__).parent.parent
MODEL_DIR = BASE_DIR / 'models'
DATA_DIR = BASE_DIR / 'data'
UPLOAD_DIR = BASE_DIR / 'app' / 'uploads'
RETRAIN_DATA_DIR = DATA_DIR / 'retrain'

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
RETRAIN_DATA_DIR.mkdir(exist_ok=True)

# Global state
app_state = {
    'model_uptime_start': datetime.now(),
    'total_predictions': 0,
    'total_retrains': 0,
    'is_retraining': False,
    'last_retrain': None
}

# Initialize components
preprocessor = ImagePreprocessor(img_size=(224, 224), batch_size=32)
predictor = None
detector_model = None

# Try to load existing model
try:
    model_path = MODEL_DIR / 'cats_dogs_model.h5'
    if model_path.exists():
        predictor = Predictor(model_path=str(model_path))
        print("Model loaded successfully")
    else:
        print("No trained model found. Please train a model first.")
    
    # Load MobileNetV2 for object detection
    print("Loading MobileNetV2 detector...")
    detector_model = MobileNetV2(weights='imagenet', include_top=True)
    print("MobileNetV2 detector loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")


# Pydantic models
class PredictionResponse(BaseModel):
    predicted_class: str
    confidence: float
    confidence_percentage: str
    probability: float
    timestamp: str


class StatusResponse(BaseModel):
    status: str
    model_loaded: bool
    uptime: str
    total_predictions: int
    total_retrains: int
    is_retraining: bool


class MetricsResponse(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float


# Helper functions
def get_uptime():
    """Calculate application uptime"""
    uptime = datetime.now() - app_state['model_uptime_start']
    hours, remainder = divmod(int(uptime.total_seconds()), 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{hours}h {minutes}m {seconds}s"


def save_uploaded_file(upload_file: UploadFile, destination: Path):
    """Save uploaded file to disk"""
    with open(destination, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)


# Routes
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Render home page"""
    return templates.TemplateResponse("index.html", {
        "request": request,
        "title": "Cats vs Dogs Classifier"
    })


@app.get("/predict-page", response_class=HTMLResponse)
async def predict_page(request: Request):
    """Render prediction page"""
    return templates.TemplateResponse("predict.html", {
        "request": request,
        "title": "Make Prediction"
    })


@app.get("/retrain-page", response_class=HTMLResponse)
async def retrain_page(request: Request):
    """Render retraining page"""
    return templates.TemplateResponse("retrain.html", {
        "request": request,
        "title": "Retrain Model"
    })


@app.get("/monitoring", response_class=HTMLResponse)
async def monitoring_page(request: Request):
    """Render monitoring page"""
    return templates.TemplateResponse("monitoring.html", {
        "request": request,
        "title": "Model Monitoring"
    })


@app.get("/api/status", response_model=StatusResponse)
async def get_status():
    """Get API status and uptime"""
    return StatusResponse(
        status="running",
        model_loaded=predictor is not None,
        uptime=get_uptime(),
        total_predictions=app_state['total_predictions'],
        total_retrains=app_state['total_retrains'],
        is_retraining=app_state['is_retraining']
    )


@app.get("/api/metrics")
async def get_metrics():
    """Get model performance metrics"""
    metrics_path = MODEL_DIR / 'metrics.json'
    
    if not metrics_path.exists():
        raise HTTPException(status_code=404, detail="Metrics not found")
    
    with open(metrics_path, 'r') as f:
        metrics = json.load(f)
    
    return metrics


@app.get("/api/dataset-stats")
async def get_dataset_stats():
    """Get dataset statistics"""
    train_stats = get_dataset_statistics(DATA_DIR / 'train')
    test_stats = get_dataset_statistics(DATA_DIR / 'test')
    
    # Check retrain data
    retrain_stats = {}
    if RETRAIN_DATA_DIR.exists():
        retrain_stats = get_dataset_statistics(RETRAIN_DATA_DIR)
    
    return {
        "training": train_stats,
        "testing": test_stats,
        "retraining": retrain_stats
    }


@app.post("/api/predict")
async def predict_image(file: UploadFile = File(...)):
    """Predict class for uploaded image"""
    global predictor, detector_model
    
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        start_time = time.time()
        
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Step 1: Detect if image contains cat or dog using MobileNetV2
        if detector_model is not None:
            detector_image = image.resize((224, 224))
            detector_array = np.array(detector_image)
            detector_array = np.expand_dims(detector_array, axis=0)
            detector_array = preprocess_input(detector_array)
            
            # Get predictions from detector
            detector_predictions = detector_model.predict(detector_array, verbose=0)
            decoded = decode_predictions(detector_predictions, top=5)[0]
            
            # Check if any of top 5 predictions are cat or dog related
            cat_dog_classes = [
                'tabby', 'tiger_cat', 'persian_cat', 'siamese_cat', 'egyptian_cat',
                'cougar', 'lynx', 'leopard', 'cheetah', 'jaguar', 'lion', 'tiger',
                'pug', 'chihuahua', 'pomeranian', 'german_shepherd', 'golden_retriever',
                'labrador_retriever', 'beagle', 'bulldog', 'boxer', 'rottweiler',
                'dalmatian', 'saint_bernard', 'husky', 'great_dane', 'standard_poodle',
                'terrier', 'yorkshire_terrier', 'cocker_spaniel', 'irish_setter',
                'english_setter', 'border_collie', 'collie', 'malamute', 'kelpie',
                'komondor', 'old_english_sheepdog', 'shetland_sheepdog', 'basenji',
                'leonberg', 'newfoundland', 'great_pyrenees', 'samoyed',
                'malinois', 'keeshond', 'brabancon_griffon', 'cardigan', 'pembroke',
                'toy_poodle', 'miniature_poodle', 'white_wolf', 'red_wolf', 'coyote',
                'dingo', 'african_hunting_dog', 'hyena', 'red_fox', 'kit_fox',
                'arctic_fox', 'grey_fox', 'timber_wolf', 'mexican_hairless'
            ]
            
            is_cat_or_dog = any(pred[1] in cat_dog_classes for pred in decoded)
            max_confidence = max([pred[2] for pred in decoded])
            
            # If not cat/dog with reasonable confidence, return unknown
            if not is_cat_or_dog and max_confidence > 0.3:
                prediction_time = (time.time() - start_time)
                detected_object = decoded[0][1].replace('_', ' ').title()
                print(f"Image rejected: Detected {detected_object}")
                return {
                    "predicted_class": "unknown",
                    "class": "unknown",
                    "confidence": 0.0,
                    "prediction_time": prediction_time,
                    "is_valid": False,
                    "detected_object": detected_object,
                    "message": f"This appears to be: {detected_object}"
                }
        
        # Step 2: If it is a cat/dog, use our trained model
        image_bytes = io.BytesIO(contents)
        img_array = preprocessor.preprocess_image_from_bytes(image_bytes)
        
        # Make prediction
        result = predictor.predict_single(img_array)
        
        # Add prediction time
        result['prediction_time'] = time.time() - start_time
        result['is_valid'] = True
        
        # Update stats
        app_state['total_predictions'] += 1
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/api/upload-training-data")
async def upload_training_data(
    files: List[UploadFile] = File(...),
    class_name: str = "cats"
):
    """Upload multiple images for retraining"""
    if class_name not in ['cats', 'dogs']:
        raise HTTPException(status_code=400, detail="Class must be 'cats' or 'dogs'")
    
    # Create class directory
    class_dir = RETRAIN_DATA_DIR / class_name
    class_dir.mkdir(parents=True, exist_ok=True)
    
    saved_files = []
    errors = []
    
    for file in files:
        if not file.content_type.startswith('image/'):
            errors.append(f"{file.filename}: Not an image")
            continue
        
        try:
            # Save file
            file_path = class_dir / file.filename
            save_uploaded_file(file, file_path)
            saved_files.append(file.filename)
        except Exception as e:
            errors.append(f"{file.filename}: {str(e)}")
    
    return {
        "uploaded": len(saved_files),
        "files": saved_files,
        "errors": errors,
        "class": class_name
    }


async def retrain_model_task():
    """Background task to retrain model"""
    global predictor, app_state
    
    try:
        app_state['is_retraining'] = True
        print("Starting model retraining...")
        
        # Check if retrain data exists
        if not RETRAIN_DATA_DIR.exists() or not any(RETRAIN_DATA_DIR.iterdir()):
            print("No retraining data available")
            return
        
        # Initialize model
        model_trainer = CatsDogsModel(img_size=(224, 224), learning_rate=0.0001)
        
        # Create data generators
        train_gen, val_gen = preprocessor.create_data_generators(
            str(RETRAIN_DATA_DIR),
            validation_split=0.2
        )
        
        # Load pretrained model and retrain
        pretrained_path = MODEL_DIR / 'cats_dogs_model.h5'
        
        if pretrained_path.exists():
            history = model_trainer.retrain(
                train_gen, val_gen,
                str(pretrained_path),
                epochs=15,
                model_save_path=str(MODEL_DIR / 'retrained_model.h5')
            )
        else:
            # Train from scratch if no pretrained model
            model_trainer.build_model(use_pretrained=True)
            history = model_trainer.train(
                train_gen, val_gen,
                epochs=15,
                model_save_path=str(MODEL_DIR / 'retrained_model.h5')
            )
        
        # Replace current model with retrained one
        shutil.copy(
            MODEL_DIR / 'retrained_model.h5',
            MODEL_DIR / 'cats_dogs_model.h5'
        )
        
        # Reload predictor
        predictor = Predictor(model_path=str(MODEL_DIR / 'cats_dogs_model.h5'))
        
        # Update state
        app_state['total_retrains'] += 1
        app_state['last_retrain'] = datetime.now().isoformat()
        
        print("Model retraining completed successfully")
        
    except Exception as e:
        print(f"Error during retraining: {e}")
    finally:
        app_state['is_retraining'] = False


@app.post("/api/retrain")
async def trigger_retrain(background_tasks: BackgroundTasks):
    """Trigger model retraining"""
    if app_state['is_retraining']:
        raise HTTPException(status_code=409, detail="Retraining already in progress")
    
    # Add retraining task to background
    background_tasks.add_task(retrain_model_task)
    
    return {
        "message": "Retraining started",
        "status": "processing"
    }


@app.get("/api/retrain-status")
async def get_retrain_status():
    """Get retraining status"""
    return {
        "is_retraining": app_state['is_retraining'],
        "total_retrains": app_state['total_retrains'],
        "last_retrain": app_state['last_retrain']
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
