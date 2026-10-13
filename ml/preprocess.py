import io
from PIL import Image
import torchvision.transforms as transforms
import torch

IMAGE_SIZE = (224, 224)
NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]

# Training transforms with augmentation
train_transforms = transforms.Compose([
    transforms.Resize(IMAGE_SIZE),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomVerticalFlip(p=0.3),
    transforms.RandomRotation(degrees=20),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=NORM_MEAN, std=NORM_STD)
])

# Evaluation / Prediction transforms
eval_transforms = transforms.Compose([
    transforms.Resize(IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=NORM_MEAN, std=NORM_STD)
])

def load_and_preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """Validate, load image bytes and return normalized PyTorch tensor with batch dimension."""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert('RGB')
    except Exception as e:
        raise ValueError(f"Invalid image format or corrupted file: {str(e)}")
    
    tensor = eval_transforms(image)
    return tensor.unsqueeze(0)  # Shape: (1, 3, 224, 224)

def parse_class_identifier(class_id: str):
    """
    Parses class directory names such as 'Tomato___Early_blight' or 'Pepper__bell___Bacterial_spot'
    into human-friendly (crop, disease, is_healthy).
    """
    cleaned = class_id.replace('__', '_')
    parts = cleaned.split('___') if '___' in cleaned else cleaned.split('_', 1)
    
    crop = parts[0].replace('_', ' ').strip().title()
    if crop.lower() == 'pepper bell' or 'pepper' in crop.lower():
        crop = 'Pepper'
    
    disease = parts[1].replace('_', ' ').strip().title() if len(parts) > 1 else 'Healthy'
    disease = disease.replace('Two Spotted Spider Mite', 'Spider Mites').strip()
    disease = disease.replace('Tomato Mosaic Virus', 'Mosaic Virus').strip()
    
    is_healthy = 'healthy' in disease.lower() or 'healthy' in class_id.lower()
    if is_healthy:
        disease = 'Healthy'
        
    return crop, disease, is_healthy
