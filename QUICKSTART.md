# Quick Start Guide - Cats vs Dogs Classifier

## Step-by-Step Instructions

### 1. Install Dependencies

```bash
cd /home/twize/Desktop/ML-summatives
pip install -r requirements.txt
```

This will install all required packages including TensorFlow, FastAPI, and other dependencies.

### 2. Train the Model

Open Jupyter Notebook:

```bash
jupyter notebook
```

Navigate to `notebook/cats_vs_dogs_classification.ipynb` and run all cells:
- This will train the VGG16 transfer learning model
- Training will take 30-60 minutes
- Model will be saved to `models/cats_dogs_model.h5`

**Note**: The notebook includes:
- Data preprocessing and augmentation
- VGG16 transfer learning architecture
- Model training with optimization techniques
- Comprehensive evaluation with 5+ metrics
- Visualizations (7 different charts/plots)

### 3. Run the Application

After training is complete:

```bash
cd app
python main.py
```

Or using uvicorn:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Access the application at: http://localhost:8000

### 4. Test the Application

#### Make a Prediction
1. Go to http://localhost:8000/predict-page
2. Upload a cat or dog image
3. Click "Predict Image"
4. View results with confidence score

#### Retrain the Model
1. Go to http://localhost:8000/retrain-page
2. Select class (cats or dogs)
3. Upload multiple images
4. Click "Upload Files"
5. Click "Start Retraining"

#### Monitor Performance
1. Go to http://localhost:8000/monitoring
2. View system health and metrics
3. See real-time visualizations

### 5. Run Load Testing

In a new terminal:

```bash
locust -f locustfile.py --host=http://localhost:8000
```

Open http://localhost:8089 and configure:
- Number of users: 100
- Spawn rate: 10
- Run the test and record results

### 6. Docker Deployment (Optional)

Build and run with Docker:

```bash
docker-compose up --build
```

For multiple containers (scaling):

```bash
docker-compose up --scale ml-app=3
```

Test with load:

```bash
locust -f locustfile.py --host=http://localhost:8000 --users 200 --spawn-rate 20 --run-time 5m --headless
```

### 7. Record Results

After running Locust tests, record the following in README.md:
- Average response time
- Median response time
- 95th percentile response time
- Requests per second
- Failure rate
- Test with 1 container vs 2 containers vs 3 containers

### 8. Create Video Demo

Record a video showing:
1. Your face (camera ON)
2. Navigating the home page
3. Making a prediction with an image
4. Uploading training data
5. Triggering retraining
6. Viewing monitoring dashboard
7. Explaining the results

Upload to YouTube and add link to README.md

### 9. Deploy to Cloud (Optional)

Deploy to AWS/GCP/Azure:
- Use the provided Dockerfile
- Push to container registry
- Deploy to cloud platform
- Add URL to README.md

### 10. Prepare Submission

Create a zip file:

```bash
cd /home/twize/Desktop
zip -r ML-summatives.zip ML-summatives/ -x "*.pyc" "*__pycache__*" "*.git*" "archive/*"
```

Or push to GitHub:

```bash
cd /home/twize/Desktop/ML-summatives
git init
git add .
git commit -m "Initial commit - Cats vs Dogs MLOps Platform"
git remote add origin <your-repo-url>
git push -u origin main
```

## Troubleshooting

### Module Not Found Error
```bash
export PYTHONPATH="${PYTHONPATH}:/home/twize/Desktop/ML-summatives"
```

### Port Already in Use
```bash
# Kill process on port 8000
sudo lsof -t -i:8000 | xargs kill -9
```

### Model Not Loading
Ensure you've run the notebook and `models/cats_dogs_model.h5` exists

## Expected Results

After completing the notebook, you should have:
- Accuracy: >90%
- Precision: >90%
- Recall: >90%
- F1-Score: >90%
- ROC-AUC: >95%

## Grading Criteria Checklist

- [ ] Video Demo with camera ON
- [ ] Data file uploading functionality
- [ ] Data preprocessing of uploaded data
- [ ] Retraining using pretrained model
- [ ] Single image prediction
- [ ] Correct prediction display
- [ ] Clear preprocessing steps in notebook
- [ ] Optimization techniques used
- [ ] 4+ evaluation metrics
- [ ] Web UI (not just API)
- [ ] Data visualizations (3+)
- [ ] Dockerized deployment
- [ ] Load testing results

## Next Steps

1. Run the notebook to train your model
2. Test all features of the web application
3. Run Locust load tests and record results
4. Create your video demonstration
5. Update README.md with your results
6. Submit to GitHub and create zip file

Good luck with your submission!
