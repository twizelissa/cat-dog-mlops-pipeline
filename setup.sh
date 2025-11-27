#!/bin/bash

# Setup script for Cats vs Dogs ML Project
# This script helps set up the environment and verify everything is ready

echo "=========================================="
echo "Cats vs Dogs Classifier - Setup Script"
echo "=========================================="
echo ""

# Check Python version
echo "Checking Python version..."
python3 --version
if [ $? -ne 0 ]; then
    echo "Error: Python 3 is not installed"
    exit 1
fi
echo ""

# Check if in correct directory
if [ ! -f "requirements.txt" ]; then
    echo "Error: Please run this script from the ML-summatives directory"
    exit 1
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv
echo "Virtual environment created"
echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate
echo ""

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip
echo ""

# Install requirements
echo "Installing dependencies (this may take a few minutes)..."
pip install -r requirements.txt
echo ""
echo "Dependencies installed successfully"
echo ""

# Verify dataset
echo "Verifying dataset..."
TRAIN_CATS=$(find data/train/cats -type f -name "*.jpg" 2>/dev/null | wc -l)
TRAIN_DOGS=$(find data/train/dogs -type f -name "*.jpg" 2>/dev/null | wc -l)
TEST_CATS=$(find data/test/cats -type f -name "*.jpg" 2>/dev/null | wc -l)
TEST_DOGS=$(find data/test/dogs -type f -name "*.jpg" 2>/dev/null | wc -l)

echo "Dataset Statistics:"
echo "  Training Cats: $TRAIN_CATS"
echo "  Training Dogs: $TRAIN_DOGS"
echo "  Test Cats: $TEST_CATS"
echo "  Test Dogs: $TEST_DOGS"
echo ""

if [ $TRAIN_CATS -eq 0 ] || [ $TRAIN_DOGS -eq 0 ]; then
    echo "Warning: Training data not found or incomplete"
    echo "Please ensure your dataset is in data/train/cats and data/train/dogs"
fi
echo ""

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p models
mkdir -p app/uploads
mkdir -p data/retrain/cats
mkdir -p data/retrain/dogs
echo "Directories created"
echo ""

# Check if model exists
if [ -f "models/cats_dogs_model.h5" ]; then
    echo "Model found: models/cats_dogs_model.h5"
else
    echo "No trained model found."
    echo "Please run the Jupyter notebook to train the model:"
    echo "  jupyter notebook notebook/cats_vs_dogs_classification.ipynb"
fi
echo ""

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo ""
echo "1. Train the model (if not already done):"
echo "   jupyter notebook"
echo "   Then open: notebook/cats_vs_dogs_classification.ipynb"
echo ""
echo "2. Run the application:"
echo "   python app/main.py"
echo "   or"
echo "   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo ""
echo "3. Access the web interface:"
echo "   http://localhost:8000"
echo ""
echo "4. Run load tests:"
echo "   locust -f locustfile.py --host=http://localhost:8000"
echo ""
echo "For more details, see QUICKSTART.md"
echo ""
