"""
Prediction Module for Cats vs Dogs Classification
Handles single and batch predictions
"""

import numpy as np
import tensorflow as tf
from tensorflow import keras
from pathlib import Path
import json
from datetime import datetime


class Predictor:
    """Handler for model predictions"""
    
    def __init__(self, model_path='models/cats_dogs_model.h5', 
                 class_names=None):
        """
        Initialize predictor
        
        Args:
            model_path: Path to saved model
            class_names: List of class names (default: ['cats', 'dogs'])
        """
        self.model_path = model_path
        self.model = None
        self.class_names = class_names or ['cats', 'dogs']
        self.load_model()
        
    def load_model(self):
        """Load the trained model"""
        if Path(self.model_path).exists():
            self.model = keras.models.load_model(self.model_path)
            print(f"Model loaded from {self.model_path}")
        else:
            raise FileNotFoundError(f"Model not found at {self.model_path}")
    
    def predict_single(self, image_array, return_confidence=True):
        """
        Predict class for a single image
        
        Args:
            image_array: Preprocessed image array
            return_confidence: Whether to return confidence score
            
        Returns:
            Prediction result dictionary
        """
        if self.model is None:
            raise ValueError("Model not loaded")
        
        # Make prediction
        prediction_prob = self.model.predict(image_array, verbose=0)[0][0]
        
        # Determine class
        predicted_class_idx = int(prediction_prob > 0.5)
        predicted_class = self.class_names[predicted_class_idx]
        
        # Calculate confidence
        confidence = prediction_prob if predicted_class_idx == 1 else 1 - prediction_prob
        
        result = {
            'predicted_class': predicted_class,
            'class': predicted_class,  # Add for frontend compatibility
            'class_index': predicted_class_idx,
            'probability': float(prediction_prob),
            'timestamp': datetime.now().isoformat(),
            'prediction_time': 0.0  # Will be set by API endpoint
        }
        
        if return_confidence:
            result['confidence'] = float(confidence)
            result['confidence_percentage'] = f"{confidence * 100:.2f}%"
        
        return result
    
    def predict_batch(self, image_arrays):
        """
        Predict classes for multiple images
        
        Args:
            image_arrays: List of preprocessed image arrays
            
        Returns:
            List of prediction results
        """
        if self.model is None:
            raise ValueError("Model not loaded")
        
        results = []
        for img_array in image_arrays:
            result = self.predict_single(img_array)
            results.append(result)
        
        return results
    
    def predict_with_explanation(self, image_array):
        """
        Predict with detailed explanation
        
        Args:
            image_array: Preprocessed image array
            
        Returns:
            Detailed prediction result
        """
        result = self.predict_single(image_array)
        
        # Add explanation
        confidence = result['confidence']
        predicted_class = result['predicted_class']
        
        if confidence >= 0.9:
            explanation = f"Very confident that this is a {predicted_class}"
        elif confidence >= 0.7:
            explanation = f"Confident that this is a {predicted_class}"
        elif confidence >= 0.5:
            explanation = f"Likely a {predicted_class}"
        else:
            explanation = f"Uncertain prediction"
        
        result['explanation'] = explanation
        
        return result
    
    def get_top_predictions(self, image_array, top_k=2):
        """
        Get top predictions with probabilities
        
        Args:
            image_array: Preprocessed image array
            top_k: Number of top predictions to return
            
        Returns:
            List of top predictions
        """
        if self.model is None:
            raise ValueError("Model not loaded")
        
        prediction_prob = self.model.predict(image_array, verbose=0)[0][0]
        
        predictions = [
            {
                'class': self.class_names[0],
                'probability': float(1 - prediction_prob),
                'percentage': f"{(1 - prediction_prob) * 100:.2f}%"
            },
            {
                'class': self.class_names[1],
                'probability': float(prediction_prob),
                'percentage': f"{prediction_prob * 100:.2f}%"
            }
        ]
        
        # Sort by probability
        predictions.sort(key=lambda x: x['probability'], reverse=True)
        
        return predictions[:top_k]
    
    def save_prediction(self, prediction_result, save_path='predictions_log.json'):
        """
        Save prediction result to log file
        
        Args:
            prediction_result: Prediction result dictionary
            save_path: Path to log file
        """
        save_path = Path(save_path)
        
        # Load existing log or create new
        if save_path.exists():
            with open(save_path, 'r') as f:
                log = json.load(f)
        else:
            log = {'predictions': []}
        
        # Add new prediction
        log['predictions'].append(prediction_result)
        
        # Save updated log
        with open(save_path, 'w') as f:
            json.dump(log, f, indent=4)
    
    def get_prediction_statistics(self, log_path='predictions_log.json'):
        """
        Get statistics from prediction log
        
        Args:
            log_path: Path to prediction log file
            
        Returns:
            Statistics dictionary
        """
        log_path = Path(log_path)
        
        if not log_path.exists():
            return {'total_predictions': 0}
        
        with open(log_path, 'r') as f:
            log = json.load(f)
        
        predictions = log.get('predictions', [])
        
        if not predictions:
            return {'total_predictions': 0}
        
        stats = {
            'total_predictions': len(predictions),
            'cats_predicted': sum(1 for p in predictions if p['predicted_class'] == 'cats'),
            'dogs_predicted': sum(1 for p in predictions if p['predicted_class'] == 'dogs'),
            'average_confidence': np.mean([p.get('confidence', 0) for p in predictions])
        }
        
        return stats


def batch_predict_from_directory(predictor, image_dir, preprocessor):
    """
    Predict all images in a directory
    
    Args:
        predictor: Predictor instance
        image_dir: Directory containing images
        preprocessor: ImagePreprocessor instance
        
    Returns:
        List of predictions with filenames
    """
    from pathlib import Path
    
    image_paths = list(Path(image_dir).glob('*.jpg')) + \
                 list(Path(image_dir).glob('*.jpeg')) + \
                 list(Path(image_dir).glob('*.png'))
    
    results = []
    for img_path in image_paths:
        try:
            img_array = preprocessor.preprocess_image(str(img_path))
            prediction = predictor.predict_single(img_array)
            prediction['filename'] = img_path.name
            results.append(prediction)
        except Exception as e:
            print(f"Error predicting {img_path}: {e}")
    
    return results
