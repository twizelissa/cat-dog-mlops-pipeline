"""
Model Creation and Training Module for Cats vs Dogs Classification
Handles model architecture, training, and evaluation
"""

import os
import json
from pathlib import Path
from datetime import datetime
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
from tensorflow.keras.applications import VGG16
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
from tensorflow.keras.optimizers import Adam
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score
)


class CatsDogsModel:
    """Model builder and trainer for binary image classification"""
    
    def __init__(self, img_size=(224, 224), learning_rate=0.0001):
        """
        Initialize model builder
        
        Args:
            img_size: Input image dimensions (height, width)
            learning_rate: Learning rate for optimizer
        """
        self.img_size = img_size
        self.learning_rate = learning_rate
        self.model = None
        self.history = None
        
    def build_model(self, use_pretrained=True):
        """
        Build the model architecture using transfer learning
        
        Args:
            use_pretrained: Whether to use pretrained VGG16 weights
            
        Returns:
            Compiled Keras model
        """
        if use_pretrained:
            # Load pretrained VGG16
            base_model = VGG16(
                weights='imagenet',
                include_top=False,
                input_shape=(self.img_size[0], self.img_size[1], 3)
            )
            base_model.trainable = False
            
            # Build custom top layers
            self.model = models.Sequential([
                base_model,
                layers.GlobalAveragePooling2D(),
                layers.Dense(256, activation='relu'),
                layers.Dropout(0.5),
                layers.Dense(128, activation='relu'),
                layers.Dropout(0.3),
                layers.Dense(1, activation='sigmoid')
            ])
        else:
            # Build custom CNN
            self.model = models.Sequential([
                layers.Conv2D(32, (3, 3), activation='relu', 
                            input_shape=(self.img_size[0], self.img_size[1], 3)),
                layers.MaxPooling2D((2, 2)),
                layers.Conv2D(64, (3, 3), activation='relu'),
                layers.MaxPooling2D((2, 2)),
                layers.Conv2D(128, (3, 3), activation='relu'),
                layers.MaxPooling2D((2, 2)),
                layers.Flatten(),
                layers.Dense(256, activation='relu'),
                layers.Dropout(0.5),
                layers.Dense(1, activation='sigmoid')
            ])
        
        # Compile model
        self.model.compile(
            optimizer=Adam(learning_rate=self.learning_rate),
            loss='binary_crossentropy',
            metrics=['accuracy', 
                    tf.keras.metrics.Precision(), 
                    tf.keras.metrics.Recall()]
        )
        
        return self.model
    
    def train(self, train_generator, validation_generator, 
              epochs=15, model_save_path='models/best_model.h5'):
        """
        Train the model
        
        Args:
            train_generator: Training data generator
            validation_generator: Validation data generator
            epochs: Number of training epochs
            model_save_path: Path to save the best model
            
        Returns:
            Training history
        """
        if self.model is None:
            raise ValueError("Model not built. Call build_model() first.")
        
        # Create model directory if it doesn't exist
        Path(model_save_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Define callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=5,
                restore_best_weights=True,
                verbose=1
            ),
            ModelCheckpoint(
                filepath=model_save_path,
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=3,
                min_lr=1e-7,
                verbose=1
            )
        ]
        
        # Train model
        self.history = self.model.fit(
            train_generator,
            steps_per_epoch=train_generator.samples // train_generator.batch_size,
            epochs=epochs,
            validation_data=validation_generator,
            validation_steps=validation_generator.samples // validation_generator.batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        return self.history
    
    def retrain(self, train_generator, validation_generator, 
                pretrained_model_path, epochs=15, 
                model_save_path='models/retrained_model.h5'):
        """
        Retrain model on new data using existing model as base
        
        Args:
            train_generator: New training data generator
            validation_generator: New validation data generator
            pretrained_model_path: Path to existing trained model
            epochs: Number of retraining epochs
            model_save_path: Path to save retrained model
            
        Returns:
            Retraining history
        """
        # Load pretrained model
        self.model = keras.models.load_model(pretrained_model_path)
        
        print(f"Loaded pretrained model from {pretrained_model_path}")
        print(f"Starting retraining for {epochs} epochs...")
        
        # Retrain with new data
        history = self.train(
            train_generator, 
            validation_generator, 
            epochs=epochs,
            model_save_path=model_save_path
        )
        
        return history
    
    def evaluate(self, test_generator):
        """
        Evaluate model on test data
        
        Args:
            test_generator: Test data generator
            
        Returns:
            Dictionary containing all evaluation metrics
        """
        if self.model is None:
            raise ValueError("Model not available. Build or load a model first.")
        
        # Generate predictions
        test_generator.reset()
        predictions_prob = self.model.predict(test_generator, verbose=1)
        predictions = (predictions_prob > 0.5).astype(int).flatten()
        true_labels = test_generator.classes
        
        # Calculate metrics
        metrics = {
            'accuracy': float(accuracy_score(true_labels, predictions)),
            'precision': float(precision_score(true_labels, predictions)),
            'recall': float(recall_score(true_labels, predictions)),
            'f1_score': float(f1_score(true_labels, predictions)),
            'roc_auc': float(roc_auc_score(true_labels, predictions_prob)),
            'confusion_matrix': confusion_matrix(true_labels, predictions).tolist(),
            'classification_report': classification_report(
                true_labels, predictions, 
                target_names=['cats', 'dogs'],
                output_dict=True
            )
        }
        
        return metrics
    
    def save_model(self, model_path='models/cats_dogs_model.h5', 
                   save_config=True):
        """
        Save model and configuration
        
        Args:
            model_path: Path to save model file
            save_config: Whether to save model configuration as JSON
        """
        if self.model is None:
            raise ValueError("No model to save")
        
        model_path = Path(model_path)
        model_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save model
        self.model.save(model_path)
        print(f"Model saved to {model_path}")
        
        # Save configuration
        if save_config:
            config = {
                'architecture': 'VGG16 Transfer Learning',
                'input_shape': list(self.img_size) + [3],
                'learning_rate': self.learning_rate,
                'created_at': datetime.now().isoformat()
            }
            
            config_path = model_path.parent / 'model_config.json'
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=4)
            
            print(f"Configuration saved to {config_path}")
    
    def load_model(self, model_path='models/cats_dogs_model.h5'):
        """
        Load saved model
        
        Args:
            model_path: Path to model file
        """
        self.model = keras.models.load_model(model_path)
        print(f"Model loaded from {model_path}")
        return self.model
    
    def save_metrics(self, metrics, metrics_path='models/metrics.json'):
        """
        Save evaluation metrics to file
        
        Args:
            metrics: Dictionary of metrics
            metrics_path: Path to save metrics JSON
        """
        metrics_path = Path(metrics_path)
        metrics_path.parent.mkdir(parents=True, exist_ok=True)
        
        metrics['timestamp'] = datetime.now().isoformat()
        
        with open(metrics_path, 'w') as f:
            json.dump(metrics, f, indent=4)
        
        print(f"Metrics saved to {metrics_path}")
    
    def get_model_summary(self):
        """
        Get model architecture summary
        
        Returns:
            Model summary as string
        """
        if self.model is None:
            return "No model available"
        
        summary_list = []
        self.model.summary(print_fn=lambda x: summary_list.append(x))
        return '\n'.join(summary_list)


def fine_tune_model(model, base_model_layers=15):
    """
    Fine-tune a pretrained model by unfreezing top layers
    
    Args:
        model: Keras model to fine-tune
        base_model_layers: Number of base model layers to keep frozen
        
    Returns:
        Fine-tuned model
    """
    # Unfreeze top layers of base model
    base_model = model.layers[0]
    base_model.trainable = True
    
    # Freeze bottom layers
    for layer in base_model.layers[:base_model_layers]:
        layer.trainable = False
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=Adam(learning_rate=1e-5),
        loss='binary_crossentropy',
        metrics=['accuracy', 
                tf.keras.metrics.Precision(), 
                tf.keras.metrics.Recall()]
    )
    
    return model
