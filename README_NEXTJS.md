# Cats vs Dogs Classification - MLOps Pipeline

Complete end-to-end Machine Learning Operations (MLOps) pipeline for binary image classification using deep learning with VGG16 transfer learning.

## Video Demo

[Insert your YouTube video link here]

## Live Deployment

[Insert deployment URL here - e.g., AWS/GCP/Azure URL]

## Project Description

This project implements a comprehensive MLOps platform featuring:
- Deep learning model for cats vs dogs classification (VGG16 transfer learning)
- Modern Next.js frontend with real-time dashboards
- FastAPI backend with RESTful endpoints
- Complete retraining pipeline
- Docker containerization
- Load testing and performance monitoring

## Features

- Image classification using VGG16 transfer learning (15 epochs)
- Data preprocessing and augmentation
- Model training with optimization techniques (Early Stopping, Learning Rate Reduction)
- RESTful API for predictions (FastAPI)
- Modern Next.js UI with real-time dashboards
- Model retraining pipeline with data upload
- Docker containerization
- Load testing with Locust
- Comprehensive evaluation metrics (Accuracy, Precision, Recall, F1-Score, ROC-AUC)

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 18+ (for Next.js frontend)
- Docker (optional)
- CUDA-capable GPU (optional, for faster training)

### Installation

#### Option 1: Automated Setup (Recommended)

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Create a virtual environment
- Install Python dependencies
- Set up the project structure
- Copy dataset to appropriate directories

#### Option 2: Manual Setup

1. Backend Setup:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Frontend Setup:
```bash
cd frontend
npm install
cd ..
```

3. Prepare Dataset:
```bash
mkdir -p data/train data/test
cp -r archive/training_set/training_set/* data/train/
cp -r archive/test_set/test_set/* data/test/
```

### Running the Application

#### 1. Train the Model

```bash
source venv/bin/activate
jupyter notebook notebook/cats_vs_dogs_classification.ipynb
```

Run all cells to train the model (will take 15 epochs with VGG16 transfer learning).

#### 2. Start the Backend API

```bash
source venv/bin/activate
python app/main.py
```

The FastAPI server will start at `http://localhost:8000`

#### 3. Start the Next.js Frontend

In a new terminal:
```bash
cd frontend
npm run dev
```

The Next.js app will start at `http://localhost:3000`

#### 4. Access the Application

- **Frontend UI**: `http://localhost:3000` (Main Dashboard)
- **API Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **API Base URL**: `http://localhost:8000`

## Project Structure

```
ML-summatives/
│
├── README.md                          # Project documentation
├── requirements.txt                   # Python dependencies
├── Dockerfile                         # Docker configuration
├── docker-compose.yml                 # Multi-container setup
├── locustfile.py                      # Load testing script
├── setup.sh                           # Automated setup script
│
├── notebook/
│   └── cats_vs_dogs_classification.ipynb  # Model training (15 epochs)
│
├── src/
│   ├── preprocessing.py               # Data preprocessing utilities
│   ├── model.py                       # Model architecture & training
│   └── prediction.py                  # Prediction functions
│
├── app/
│   ├── main.py                        # FastAPI application
│   ├── templates/                     # HTML templates (legacy)
│   └── static/                        # CSS, JS, images (legacy)
│
├── frontend/                          # Next.js Frontend
│   ├── package.json                   # Node dependencies
│   ├── next.config.js                 # Next.js config
│   ├── tsconfig.json                  # TypeScript config
│   ├── tailwind.config.js             # Tailwind CSS config
│   ├── pages/
│   │   ├── index.tsx                  # Dashboard page
│   │   ├── predict.tsx                # Prediction page
│   │   └── retrain.tsx                # Retraining page
│   └── styles/
│       └── globals.css                # Global styles
│
├── data/
│   ├── train/
│   │   ├── cats/                      # 4,000 cat images
│   │   └── dogs/                      # 4,005 dog images
│   └── test/
│       ├── cats/                      # 1,011 cat images
│       └── dogs/                      # 1,012 dog images
│
└── models/
    ├── cats_dogs_model.h5             # Final trained model
    ├── best_model.h5                  # Best checkpoint
    ├── retrained_model.h5             # Retrained model
    ├── metrics.json                   # Evaluation metrics
    └── model_config.json              # Model configuration
```

## Model Architecture

- **Base Model**: VGG16 (pretrained on ImageNet, frozen layers)
- **Input Shape**: (224, 224, 3)
- **Custom Layers**:
  - GlobalAveragePooling2D
  - Dense(256, relu) + Dropout(0.5)
  - Dense(128, relu) + Dropout(0.3)
  - Dense(1, sigmoid)
- **Optimizer**: Adam (lr=0.0001)
- **Loss**: Binary Crossentropy
- **Training**: 15 epochs with Early Stopping (patience=5)
- **Callbacks**: ModelCheckpoint, ReduceLROnPlateau

## Evaluation Metrics

The model is evaluated using 6+ comprehensive metrics:

1. **Accuracy**: Overall classification accuracy
2. **Precision**: Positive predictive value
3. **Recall**: Sensitivity/True positive rate
4. **F1-Score**: Harmonic mean of precision and recall
5. **ROC-AUC**: Area under the ROC curve
6. **Confusion Matrix**: Visual representation of predictions
7. **Loss**: Binary crossentropy loss

All metrics are visualized in both the Jupyter notebook and the Next.js dashboard.

## API Endpoints

### Health Check
```http
GET /health
Response: { "status": "healthy", "model_loaded": true, "uptime": 1234 }
```

### Predict Single Image
```http
POST /predict
Content-Type: multipart/form-data
Body: file (image file)
Response: { "class": "Cat", "confidence": 0.95, "prediction_time": 0.123 }
```

### Get Model Metrics
```http
GET /metrics
Response: { "accuracy": 0.95, "precision": 0.94, "recall": 0.96, ... }
```

### Upload Training Data
```http
POST /upload-training-data
Content-Type: multipart/form-data
Body: files[] (multiple image files)
Response: { "message": "Uploaded X files", "saved_files": [...] }
```

### Trigger Retraining
```http
POST /retrain
Response: { "status": "success", "final_accuracy": 0.96, "epochs_trained": 15 }
```

Full API documentation available at: `http://localhost:8000/docs`

## UI Features (Next.js)

### 1. Dashboard (`/`)
- Real-time model status and uptime
- Performance metrics visualization (Bar charts)
- Dataset distribution (Pie charts)
- Model architecture information
- Quick action cards

### 2. Prediction Page (`/predict`)
- Drag & drop image upload
- Real-time prediction with confidence scores
- Beautiful result display
- Prediction time tracking

### 3. Retraining Page (`/retrain`)
- Bulk image upload (multiple files)
- Training data management
- One-click retraining trigger
- Training results dashboard
- Progress indicators

### Design Features
- Modern gradient backgrounds
- Responsive Tailwind CSS design
- Interactive charts with Recharts
- Smooth animations and transitions
- Professional card-based layout

## Docker Deployment

### Single Container

```bash
# Build the image
docker build -t cats-dogs-classifier .

# Run the container
docker run -p 8000:8000 cats-dogs-classifier
```

### Multi-Container with Docker Compose

```bash
# Start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Scale the API
docker-compose up --scale api=3
```

The docker-compose setup includes:
- FastAPI backend (scalable)
- Next.js frontend
- Shared volumes for models and data

## Load Testing with Locust

### Run Load Tests

```bash
# Activate virtual environment
source venv/bin/activate

# Start Locust with web UI
locust -f locustfile.py

# Or run headless with specific parameters
locust -f locustfile.py --host=http://localhost:8000 \
  --users=100 --spawn-rate=10 --run-time=5m --headless
```

### Access Locust UI

Navigate to `http://localhost:8089` to:
- Configure concurrent users (e.g., 50, 100, 200)
- Set spawn rate (users/second)
- View real-time statistics
- Monitor response times
- Check failure rates
- Download comprehensive reports

### Test Different Container Scales

```bash
# Test with 1 container
docker-compose up --scale api=1

# Test with 3 containers
docker-compose up --scale api=3

# Test with 5 containers
docker-compose up --scale api=5
```

Record latency and response times for each configuration.

## Optimization Techniques Applied

1. **Transfer Learning**: Using VGG16 pretrained on ImageNet
2. **Data Augmentation**: Rotation, shifting, shearing, zooming, flipping
3. **Early Stopping**: Prevents overfitting (patience=5)
4. **Learning Rate Reduction**: Adaptive learning (factor=0.5, patience=3)
5. **Dropout Regularization**: 50% and 30% dropout layers
6. **Batch Normalization**: Through VGG16 architecture
7. **Model Checkpointing**: Saves best performing model

## Technologies Used

### Backend
- Python 3.8+
- TensorFlow / Keras
- FastAPI
- Uvicorn
- NumPy, Pandas
- Scikit-learn

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Recharts (visualizations)
- Axios (API calls)

### DevOps
- Docker
- Docker Compose
- Locust (load testing)
- Jupyter Notebook

## Assignment Compliance

This project meets all MLOps summative assignment requirements:

### Data Acquisition & Processing
- Image dataset (non-tabular)
- Comprehensive preprocessing
- Data augmentation pipeline

### Model Creation & Testing
- VGG16 transfer learning
- 15 epochs training
- 5+ evaluation metrics
- Confusion matrix, ROC curve visualizations

### Model Retraining
- Bulk data upload functionality
- Retraining trigger mechanism
- Uses pretrained model for transfer learning

### API Creation
- RESTful FastAPI endpoints
- Swagger documentation
- File upload handling

### UI Features
- Model uptime monitoring
- Data visualizations (3+ charts)
- Train/retrain functionalities
- Modern Next.js interface

### Cloud Deployment Ready
- Dockerized application
- Docker Compose for multi-container
- Scalable architecture

### Load Testing
- Locust integration
- Performance monitoring
- Multi-container scaling tests

## Setup Instructions

1. **Clone the repository**
2. **Run setup script**: `./setup.sh`
3. **Train the model**: Open and run the Jupyter notebook
4. **Start backend**: `python app/main.py`
5. **Start frontend**: `cd frontend && npm run dev`
6. **Access dashboard**: `http://localhost:3000`
7. **Run load tests**: `locust -f locustfile.py`

## Results Summary

[To be filled after training - include:
- Final accuracy, precision, recall, F1-score, ROC-AUC
- Training time
- Locust test results with different container counts
- Screenshots of UI]

## License

MIT License

## Author

[Your Name]
[Your Email]
[Your GitHub]

## Acknowledgments

- Dataset: Kaggle Cats vs Dogs
- Transfer Learning: VGG16 (ImageNet)
- Framework: TensorFlow/Keras
