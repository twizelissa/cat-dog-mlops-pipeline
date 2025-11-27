#!/bin/bash

# Render Build Script for Cats vs Dogs ML Backend

echo "🚀 Starting build process..."

# Install Python dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements-prod.txt

# Create models directory if it doesn't exist
echo "📁 Creating models directory..."
mkdir -p models

# Check if model file exists, if not download from GitHub releases or use placeholder
echo "🔍 Checking for model file..."
if [ ! -f "models/cats_dogs_model.h5" ]; then
    echo "⚠️  Model file not found!"
    echo "📥 Please upload your trained model to Render's persistent disk or environment variables"
    echo "   For now, the app will start but predictions will fail until model is uploaded"
    
    # Create a placeholder file to prevent startup errors
    echo "Creating placeholder file..."
    touch models/cats_dogs_model.h5
else
    echo "✅ Model file found!"
fi

# Download MobileNetV2 weights (these will be cached by TensorFlow)
echo "🔽 Pre-downloading MobileNetV2 weights..."
python -c "from tensorflow.keras.applications import MobileNetV2; MobileNetV2(weights='imagenet')" || echo "⚠️  MobileNetV2 download will happen at runtime"

echo "✅ Build completed successfully!"
