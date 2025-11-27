"""
Data Preprocessing Module for Cats vs Dogs Classification
Handles image preprocessing, augmentation, and data loading
"""

import os
import numpy as np
from pathlib import Path
from PIL import Image
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator, load_img, img_to_array


class ImagePreprocessor:
    """Image preprocessing and augmentation handler"""
    
    def __init__(self, img_size=(224, 224), batch_size=32):
        """
        Initialize preprocessor
        
        Args:
            img_size: Target image dimensions (height, width)
            batch_size: Number of images per batch
        """
        self.img_size = img_size
        self.batch_size = batch_size
        
    def create_data_generators(self, train_dir, validation_split=0.2):
        """
        Create training and validation data generators with augmentation
        
        Args:
            train_dir: Path to training data directory
            validation_split: Fraction of training data for validation
            
        Returns:
            train_generator, validation_generator
        """
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=40,
            width_shift_range=0.2,
            height_shift_range=0.2,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest',
            validation_split=validation_split
        )
        
        train_generator = train_datagen.flow_from_directory(
            train_dir,
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='binary',
            subset='training',
            shuffle=True
        )
        
        validation_generator = train_datagen.flow_from_directory(
            train_dir,
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='binary',
            subset='validation',
            shuffle=False
        )
        
        return train_generator, validation_generator
    
    def create_test_generator(self, test_dir):
        """
        Create test data generator (no augmentation)
        
        Args:
            test_dir: Path to test data directory
            
        Returns:
            test_generator
        """
        test_datagen = ImageDataGenerator(rescale=1./255)
        
        test_generator = test_datagen.flow_from_directory(
            test_dir,
            target_size=self.img_size,
            batch_size=self.batch_size,
            class_mode='binary',
            shuffle=False
        )
        
        return test_generator
    
    def preprocess_image(self, image_path):
        """
        Preprocess a single image for prediction
        
        Args:
            image_path: Path to image file
            
        Returns:
            Preprocessed image array ready for model input
        """
        img = load_img(image_path, target_size=self.img_size)
        img_array = img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0
        
        return img_array
    
    def preprocess_image_from_bytes(self, image_bytes):
        """
        Preprocess image from bytes (for uploaded files)
        
        Args:
            image_bytes: Image in bytes format
            
        Returns:
            Preprocessed image array
        """
        img = Image.open(image_bytes)
        img = img.resize(self.img_size)
        img_array = np.array(img)
        
        # Ensure RGB format
        if len(img_array.shape) == 2:
            img_array = np.stack([img_array] * 3, axis=-1)
        elif img_array.shape[-1] == 4:
            img_array = img_array[:, :, :3]
            
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0
        
        return img_array
    
    def load_images_from_directory(self, directory, max_images=None):
        """
        Load multiple images from a directory
        
        Args:
            directory: Path to directory containing images
            max_images: Maximum number of images to load
            
        Returns:
            List of preprocessed image arrays
        """
        image_paths = list(Path(directory).glob('*.jpg')) + \
                     list(Path(directory).glob('*.jpeg')) + \
                     list(Path(directory).glob('*.png'))
        
        if max_images:
            image_paths = image_paths[:max_images]
        
        images = []
        for img_path in image_paths:
            try:
                img = self.preprocess_image(str(img_path))
                images.append(img)
            except Exception as e:
                print(f"Error loading {img_path}: {e}")
                continue
        
        return images
    
    def validate_image(self, image_path):
        """
        Validate if file is a valid image
        
        Args:
            image_path: Path to image file
            
        Returns:
            Boolean indicating if image is valid
        """
        try:
            img = Image.open(image_path)
            img.verify()
            return True
        except Exception:
            return False


def organize_uploaded_data(upload_dir, output_dir, class_name):
    """
    Organize uploaded images into proper directory structure
    
    Args:
        upload_dir: Directory containing uploaded images
        output_dir: Base directory for organized data
        class_name: Class label (cats or dogs)
    """
    from shutil import copy2
    
    class_dir = Path(output_dir) / class_name
    class_dir.mkdir(parents=True, exist_ok=True)
    
    uploaded_images = list(Path(upload_dir).glob('*.jpg')) + \
                     list(Path(upload_dir).glob('*.jpeg')) + \
                     list(Path(upload_dir).glob('*.png'))
    
    copied_count = 0
    for img_path in uploaded_images:
        try:
            dest_path = class_dir / img_path.name
            copy2(img_path, dest_path)
            copied_count += 1
        except Exception as e:
            print(f"Error copying {img_path}: {e}")
    
    return copied_count


def get_dataset_statistics(data_dir):
    """
    Get statistics about the dataset
    
    Args:
        data_dir: Path to data directory
        
    Returns:
        Dictionary with dataset statistics
    """
    stats = {}
    data_path = Path(data_dir)
    
    for class_dir in data_path.iterdir():
        if class_dir.is_dir():
            class_name = class_dir.name
            image_count = len(list(class_dir.glob('*.jpg'))) + \
                         len(list(class_dir.glob('*.jpeg'))) + \
                         len(list(class_dir.glob('*.png')))
            stats[class_name] = image_count
    
    stats['total'] = sum(stats.values())
    
    return stats
