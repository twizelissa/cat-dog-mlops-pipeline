# Cats vs Dogs Image Classification - MLOps Platform

A complete Machine Learning Operations platform for binary image classification using deep learning and transfer learning techniques.

## Project Description

This project implements an end-to-end MLOps pipeline for classifying images of cats and dogs. It features a trained deep learning model using VGG16 transfer learning, a web-based UI for predictions and model retraining, comprehensive monitoring capabilities, and containerized deployment.

### Key Features

- Real-time image classification with confidence scores
- Transfer learning using VGG16 pretrained on ImageNet
- Web-based interface for predictions and model management
- Model retraining capability with new data uploads
- Performance monitoring and metrics visualization
- Dockerized deployment for scalability
- Load testing with Locust for performance analysis

## Video Demo

[Insert your YouTube video link here]

## Live Deployment

[Insert deployment URL here - e.g., AWS/GCP/Azure URL]

## Model Performance Metrics

- Accuracy: [To be filled after training]
- Precision: [To be filled after training]
- Recall: [To be filled after training]
- F1-Score: [To be filled after training]
- ROC-AUC: [To be filled after training]

## Project Structure

```
ML-summatives/
│
├── README.md
│
├── notebook/
│   └── cats_vs_dogs_classification.ipynb
│
├── src/
│   ├── preprocessing.py
│   ├── model.py
│   └── prediction.py
│
├── data/
│   ├── train/
│   │   ├── cats/
│   │   └── dogs/
│   └── test/
│       ├── cats/
│       └── dogs/
│
├── models/
│   ├── cats_dogs_model.h5
│   ├── model_config.json
│   └── metrics.json
│
├── app/
│   ├── main.py
│   ├── templates/
│   │   ├── index.html
│   │   ├── predict.html
│   │   ├── retrain.html
│   │   └── monitoring.html
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       ├── main.js
│   │       ├── predict.js
│   │       ├── retrain.js
│   │       └── monitoring.js
│   └── uploads/
│
├── Dockerfile
├── docker-compose.yml
├── locustfile.py
└── requirements.txt
```

## Setup Instructions

### Prerequisites

- Python 3.9 or higher
- Docker and Docker Compose (for containerized deployment)
- 8GB+ RAM recommended for model training
- GPU recommended but not required

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ML-summatives
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Train the Model

Open and run the Jupyter notebook to train the model:

```bash
jupyter notebook notebook/cats_vs_dogs_classification.ipynb
```

Run all cells in the notebook. This will:
- Load and preprocess the dataset
- Build the VGG16 transfer learning model
- Train the model with optimization techniques
- Evaluate performance with multiple metrics
- Save the trained model to `models/cats_dogs_model.h5`

Training takes approximately 30-60 minutes depending on hardware.

### 5. Run the Application

#### Option A: Direct Python Execution

```bash
cd app
python main.py
```

The application will be available at `http://localhost:8000`

#### Option B: Using Uvicorn

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Option C: Docker Deployment

Build and run with Docker Compose:

```bash
docker-compose up --build
```

For scaling with multiple containers:

```bash
docker-compose up --scale ml-app=3
```

## Using the Application

### 1. Home Page

Access at `http://localhost:8000/`
- View system status and uptime
- See model performance metrics
- Check dataset statistics

### 2. Make Predictions

Access at `http://localhost:8000/predict-page`
- Upload an image of a cat or dog
- Click "Predict Image"
- View prediction result with confidence score

### 3. Retrain Model

Access at `http://localhost:8000/retrain-page`
- Select class (cats or dogs)
- Upload multiple training images
- Click "Upload Files"
- Click "Start Retraining" to trigger retraining process

### 4. Monitor Performance

Access at `http://localhost:8000/monitoring`
- View real-time system health
- See performance metrics charts
- Monitor dataset distribution
- Track prediction statistics

## Load Testing with Locust

### Run Locust Tests

1. Start the application
2. In a new terminal, run:

```bash
locust -f locustfile.py --host=http://localhost:8000
```

3. Open browser at `http://localhost:8089`
4. Configure test parameters:
   - Number of users: 100
   - Spawn rate: 10 users/second
   - Host: http://localhost:8000

### Load Testing with Docker Containers

Test with multiple containers:

```bash
# Start 3 containers
docker-compose up --scale ml-app=3 -d

# Run load test
locust -f locustfile.py --host=http://localhost:8000 --users 200 --spawn-rate 20 --run-time 5m --headless
```

### Metrics to Monitor

- Response time (average, median, 95th percentile)
- Requests per second (RPS)
- Failure rate
- Latency under different loads

## Load Testing Results

[To be filled after running Locust tests]

### Test Configuration
- Number of users: 
- Spawn rate:
- Test duration:
- Number of containers:

### Results
- Average response time:
- Median response time:
- 95th percentile:
- Requests per second:
- Failure rate:

## API Documentation

### Endpoints

#### GET /
- Home page

#### GET /predict-page
- Prediction interface

#### GET /retrain-page
- Retraining interface

#### GET /monitoring
- Monitoring dashboard

#### GET /api/status
- Returns system status and uptime

#### GET /api/metrics
- Returns model performance metrics

#### GET /api/dataset-stats
- Returns dataset statistics

#### POST /api/predict
- Upload image for prediction
- Body: FormData with 'file' field
- Returns: Prediction result with confidence

#### POST /api/upload-training-data
- Upload training images
- Query param: class_name (cats/dogs)
- Body: FormData with 'files' field
- Returns: Upload summary

#### POST /api/retrain
- Trigger model retraining
- Returns: Retraining status

#### GET /api/retrain-status
- Check retraining progress

#### GET /health
- Health check endpoint

## Technologies Used

- **Machine Learning**: TensorFlow, Keras, VGG16
- **Web Framework**: FastAPI, Uvicorn
- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **Data Processing**: NumPy, Pandas, Pillow
- **Visualization**: Matplotlib, Seaborn
- **Containerization**: Docker, Docker Compose
- **Load Testing**: Locust
- **Model Evaluation**: Scikit-learn

## Optimization Techniques Applied

1. Transfer Learning with VGG16 pretrained on ImageNet
2. Data Augmentation (rotation, zoom, flip, shift)
3. Early Stopping to prevent overfitting
4. Learning Rate Reduction on plateau
5. Dropout Regularization
6. Model Checkpointing

## Evaluation Metrics

The model is evaluated using:
- Accuracy
- Precision
- Recall
- F1-Score
- ROC-AUC Score
- Confusion Matrix
- Classification Report

## Dataset

- Training Set: ~8,000 images (4,000 cats + 4,000 dogs)
- Test Set: ~2,000 images (1,000 cats + 1,000 dogs)
- Image Size: 224x224 pixels
- Format: JPEG

## Future Improvements

- Add authentication and user management
- Implement model versioning
- Add A/B testing capabilities
- Integrate CI/CD pipeline
- Add more detailed logging
- Implement caching for predictions
- Support batch predictions
- Add more visualization types

## Troubleshooting

### Model Not Loading
- Ensure you've run the Jupyter notebook and trained the model
- Check that `models/cats_dogs_model.h5` exists
- Verify file permissions

### Memory Issues During Training
- Reduce batch size in notebook
- Use fewer epochs
- Close other applications

### Docker Issues
- Ensure Docker daemon is running
- Check port 8000 is not in use
- Verify Docker Compose version

## License

This project is for educational purposes.

## Author

[Your Name]

## Acknowledgments

- Dataset: Cats vs Dogs dataset
- Pretrained Model: VGG16 from ImageNet
- Framework: TensorFlow/Keras
