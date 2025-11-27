"""
Locust load testing script for Cats vs Dogs Classification API
Simulates multiple concurrent users making predictions
"""

from locust import HttpUser, task, between
import random
import io
from PIL import Image
import numpy as np


class MLModelUser(HttpUser):
    """Simulates a user interacting with the ML API"""
    
    # Wait time between tasks (1-3 seconds)
    wait_time = between(1, 3)
    
    def on_start(self):
        """Called when a simulated user starts"""
        print("User started")
    
    def create_test_image(self):
        """Create a random test image"""
        # Create a random 224x224 RGB image
        img_array = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
        img = Image.fromarray(img_array)
        
        # Convert to bytes
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)
        
        return img_byte_arr
    
    @task(10)
    def predict_image(self):
        """Make a prediction request (weighted 10x)"""
        # Create test image
        image_data = self.create_test_image()
        
        # Prepare file upload
        files = {
            'file': ('test_image.jpg', image_data, 'image/jpeg')
        }
        
        # Make prediction request
        with self.client.post(
            "/api/predict",
            files=files,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    if 'predicted_class' in data:
                        response.success()
                    else:
                        response.failure("Invalid response format")
                except Exception as e:
                    response.failure(f"Failed to parse response: {e}")
            else:
                response.failure(f"Got status code: {response.status_code}")
    
    @task(2)
    def get_status(self):
        """Check API status (weighted 2x)"""
        with self.client.get("/api/status", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status check failed: {response.status_code}")
    
    @task(1)
    def get_metrics(self):
        """Get model metrics (weighted 1x)"""
        with self.client.get("/api/metrics", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 404:
                # Metrics might not exist yet
                response.success()
            else:
                response.failure(f"Metrics check failed: {response.status_code}")
    
    @task(1)
    def get_dataset_stats(self):
        """Get dataset statistics (weighted 1x)"""
        with self.client.get("/api/dataset-stats", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Dataset stats failed: {response.status_code}")
    
    @task(1)
    def health_check(self):
        """Health check endpoint (weighted 1x)"""
        with self.client.get("/health", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Health check failed: {response.status_code}")


class WebPageUser(HttpUser):
    """Simulates a user browsing web pages"""
    
    wait_time = between(2, 5)
    
    @task(3)
    def view_home(self):
        """View home page"""
        self.client.get("/")
    
    @task(2)
    def view_predict_page(self):
        """View prediction page"""
        self.client.get("/predict-page")
    
    @task(1)
    def view_retrain_page(self):
        """View retrain page"""
        self.client.get("/retrain-page")
    
    @task(1)
    def view_monitoring(self):
        """View monitoring page"""
        self.client.get("/monitoring")


# Run with:
# locust -f locustfile.py --host=http://localhost:8000
# 
# Or for headless mode with specific users:
# locust -f locustfile.py --host=http://localhost:8000 --users 100 --spawn-rate 10 --run-time 5m --headless
#
# For Docker container testing with multiple containers:
# docker-compose up --scale ml-app=3
# locust -f locustfile.py --host=http://localhost:8000 --users 200 --spawn-rate 20 --run-time 10m
