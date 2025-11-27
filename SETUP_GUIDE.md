# Complete Setup and Running Guide

## What Has Been Built

You now have a complete MLOps pipeline with:

1. **Jupyter Notebook** - Model training with 15 epochs using VGG16
2. **FastAPI Backend** - RESTful API for predictions and retraining
3. **Next.js Frontend** - Modern, responsive UI with real-time dashboards
4. **Docker Setup** - Containerization and multi-container orchestration
5. **Load Testing** - Locust configuration for performance testing

## Step-by-Step Guide

### Step 1: Prepare the Dataset

```bash
cd /home/twize/Desktop/ML-summatives

# Create data directories
mkdir -p data/train data/test models

# Copy dataset (if not already done)
cp -r archive/training_set/training_set/* data/train/
cp -r archive/test_set/test_set/* data/test/
```

### Step 2: Set Up Python Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Train the Model

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Start Jupyter
jupyter notebook
```

In Jupyter:
1. Navigate to `notebook/cats_vs_dogs_classification.ipynb`
2. Run all cells (Kernel > Restart & Run All)
3. Wait for training to complete (15 epochs, may take 30-60 minutes depending on hardware)
4. The model will be saved to `models/cats_dogs_model.h5`

### Step 4: Set Up Next.js Frontend

```bash
cd frontend

# Install Node dependencies
npm install

# Go back to project root
cd ..
```

### Step 5: Start the Backend API

```bash
# Make sure you're in project root and venv is activated
source venv/bin/activate

# Start FastAPI server
python app/main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Model loaded successfully
```

Keep this terminal open.

### Step 6: Start the Frontend

Open a NEW terminal:

```bash
cd /home/twize/Desktop/ML-summatives/frontend

# Start Next.js development server
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Step 7: Access the Application

Open your browser and go to:

- **Main Dashboard**: http://localhost:3000
- **Prediction Page**: http://localhost:3000/predict
- **Retraining Page**: http://localhost:3000/retrain
- **API Docs**: http://localhost:8000/docs

### Step 8: Test Prediction

1. Go to http://localhost:3000/predict
2. Click the upload area
3. Select a cat or dog image
4. Click "Predict"
5. View the results

### Step 9: Test Retraining

1. Go to http://localhost:3000/retrain
2. Upload multiple cat/dog images
3. Click "Upload Files"
4. After upload, click "Start Retraining"
5. Wait for retraining (will take several minutes for 15 epochs)

### Step 10: Run Load Tests

Open a NEW terminal:

```bash
cd /home/twize/Desktop/ML-summatives
source venv/bin/activate

# Start Locust
locust -f locustfile.py
```

1. Open http://localhost:8089
2. Set number of users (try 50, 100, 200)
3. Set spawn rate (e.g., 10)
4. Set host: http://localhost:8000
5. Click "Start Swarming"
6. Record the results (response times, requests/sec, failures)

### Step 11: Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Test with multiple containers
docker-compose up --scale api=3

# Run in background
docker-compose up -d
```

## Troubleshooting

### Issue: Model not found
**Solution**: Make sure you ran the Jupyter notebook and the model is saved in `models/cats_dogs_model.h5`

### Issue: Frontend can't connect to backend
**Solution**: 
- Check if backend is running on http://localhost:8000
- Check the Next.js config rewrites in `frontend/next.config.js`

### Issue: npm install fails
**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port already in use
**Solution**:
```bash
# For port 8000
lsof -ti:8000 | xargs kill -9

# For port 3000
lsof -ti:3000 | xargs kill -9
```

## Recording Your Video Demo

### What to Show (in order):

1. **Introduction** (30 seconds)
   - Camera ON
   - Explain the project briefly
   - Show the dataset

2. **Dashboard** (1 minute)
   - Navigate to http://localhost:3000
   - Show metrics, visualizations
   - Explain the charts

3. **Prediction** (1 minute)
   - Go to Predict page
   - Upload a cat image
   - Show prediction result
   - Upload a dog image
   - Show prediction result

4. **Retraining** (2 minutes)
   - Go to Retrain page
   - Upload multiple images
   - Trigger retraining
   - Show progress/results

5. **API Documentation** (30 seconds)
   - Show http://localhost:8000/docs
   - Demonstrate one API call

6. **Load Testing** (1 minute)
   - Show Locust UI
   - Start a test
   - Show statistics

7. **Docker** (30 seconds)
   - Show docker-compose.yml
   - Run docker-compose up

8. **Notebook** (1 minute)
   - Open Jupyter notebook
   - Scroll through key sections
   - Show evaluation metrics

Total: ~7-8 minutes

## Checklist Before Submission

- [ ] Model trained successfully (15 epochs)
- [ ] All metrics calculated (Accuracy, Precision, Recall, F1, ROC-AUC)
- [ ] Frontend working (Dashboard, Predict, Retrain)
- [ ] Backend API working (all endpoints)
- [ ] Prediction working correctly
- [ ] Retraining working (data upload + trigger)
- [ ] Load testing completed with Locust
- [ ] Docker containers built and running
- [ ] Video demo recorded (camera ON)
- [ ] README.md updated with video link
- [ ] GitHub repository created and pushed
- [ ] All files in correct structure

## Grading Rubric Alignment

### Video Demo (5 points)
- Camera ON
- Shows prediction
- Shows retraining

### Retraining Process (10 points)
- Data upload working
- Data preprocessing (done in preprocessing.py)
- Uses pretrained model for transfer learning

### Prediction Process (10 points)
- Single image upload
- Correct predictions
- Displays confidence scores

### Evaluation of Models (10 points)
- Clear preprocessing in notebook
- Uses VGG16 pretrained model
- Data augmentation
- Early stopping
- Learning rate reduction
- 5+ metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Loss)

### Deployment Package (10 points)
- Next.js UI (modern web app)
- Model uptime shown
- 3+ visualizations (bar chart, pie chart, metrics)
- Prediction and retrain pages functional

## Expected Results

With the Cats vs Dogs dataset (10,000+ images), you should achieve:
- **Accuracy**: 90-95%
- **Precision**: 90-95%
- **Recall**: 90-95%
- **F1-Score**: 90-95%
- **ROC-AUC**: 95-98%

## Files to Submit

### Attempt 1: ZIP File
Compress the entire project folder:
```bash
cd /home/twize/Desktop
zip -r ML-summatives.zip ML-summatives/ \
  -x "*/node_modules/*" \
  -x "*/.next/*" \
  -x "*/venv/*" \
  -x "*/__pycache__/*" \
  -x "*/.ipynb_checkpoints/*"
```

### Attempt 2: GitHub URL
1. Create GitHub repository
2. Push all code
3. Add video link to README
4. Submit repository URL

## Good Luck!

You have everything you need for full marks (45/45). Just follow this guide step by step!
