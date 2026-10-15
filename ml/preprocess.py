import io
from PIL import Image
import torchvision.transforms as transforms
import torch
import numpy as np

IMAGE_SIZE = (224, 224)
NORM_MEAN = [0.485, 0.456, 0.406]
NORM_STD = [0.229, 0.224, 0.225]

# Canonical 38-class mapping matching the database records exactly
CLASS_MAPPING = {
    "Apple___Apple_scab": ("Apple", "Apple Scab", False),
    "Apple___Black_rot": ("Apple", "Black Rot", False),
    "Apple___Cedar_apple_rust": ("Apple", "Cedar Apple Rust", False),
    "Apple___healthy": ("Apple", "Healthy", True),
    "Blueberry___healthy": ("Blueberry", "Healthy", True),
    "Cherry_(including_sour)___Powdery_mildew": ("Cherry", "Powdery Mildew", False),
    "Cherry_(including_sour)___healthy": ("Cherry", "Healthy", True),
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": ("Corn", "Cercospora Leaf Spot", False),
    "Corn_(maize)___Common_rust_": ("Corn", "Common Rust", False),
    "Corn_(maize)___Northern_Leaf_Blight": ("Corn", "Northern Leaf Blight", False),
    "Corn_(maize)___healthy": ("Corn", "Healthy", True),
    "Grape___Black_rot": ("Grape", "Black Rot", False),
    "Grape___Esca_(Black_Measles)": ("Grape", "Esca (Black Measles)", False),
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": ("Grape", "Leaf Blight", False),
    "Grape___healthy": ("Grape", "Healthy", True),
    "Orange___Haunglongbing_(Citrus_greening)": ("Orange", "Citrus Greening", False),
    "Peach___Bacterial_spot": ("Peach", "Bacterial Spot", False),
    "Peach___healthy": ("Peach", "Healthy", True),
    "Pepper__bell___Bacterial_spot": ("Pepper", "Bacterial Spot", False),
    "Pepper__bell___healthy": ("Pepper", "Healthy", True),
    "Potato___Early_blight": ("Potato", "Early Blight", False),
    "Potato___Late_blight": ("Potato", "Late Blight", False),
    "Potato___healthy": ("Potato", "Healthy", True),
    "Raspberry___healthy": ("Raspberry", "Healthy", True),
    "Soybean___healthy": ("Soybean", "Healthy", True),
    "Squash___Powdery_mildew": ("Squash", "Powdery Mildew", False),
    "Strawberry___Leaf_scorch": ("Strawberry", "Leaf Scorch", False),
    "Strawberry___healthy": ("Strawberry", "Healthy", True),
    "Tomato___Bacterial_spot": ("Tomato", "Bacterial Spot", False),
    "Tomato___Early_blight": ("Tomato", "Early Blight", False),
    "Tomato___Late_blight": ("Tomato", "Late Blight", False),
    "Tomato___Leaf_Mold": ("Tomato", "Leaf Mold", False),
    "Tomato___Septoria_leaf_spot": ("Tomato", "Septoria Leaf Spot", False),
    "Tomato___Spider_mites_Two_spotted_spider_mite": ("Tomato", "Spider Mites", False),
    "Tomato___Target_Spot": ("Tomato", "Target Spot", False),
    "Tomato___Tomato_mosaic_virus": ("Tomato", "Mosaic Virus", False),
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": ("Tomato", "Yellow Leaf Curl Virus", False),
    "Tomato___healthy": ("Tomato", "Healthy", True),
    "Rose___Black_spot": ("Rose", "Black Spot", False),
    "Rose___Powdery_mildew": ("Rose", "Powdery Mildew", False),
    "Rose___healthy": ("Rose", "Healthy", True),
}

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

# Aspect-ratio preserving center-crop transforms (for high-res phone/camera field photos)
aspect_crop_transforms = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(mean=NORM_MEAN, std=NORM_STD)
])

def check_image_quality(image: Image.Image) -> dict:
    """
    Evaluates image quality metrics:
    - blur / sharpness (Laplacian variance on grayscale)
    - foliage / leaf color presence (in HSV color space)
    """
    gray = np.array(image.convert('L'), dtype=np.float32)
    if max(gray.shape) > 600:
        scale = 600.0 / max(gray.shape)
        new_w, new_h = max(1, int(gray.shape[1] * scale)), max(1, int(gray.shape[0] * scale))
        gray_im = Image.fromarray(gray.astype(np.uint8)).resize((new_w, new_h), Image.BILINEAR)
        gray = np.array(gray_im, dtype=np.float32)

    # 3x3 Laplacian operator for edge variance
    laplacian = (
        -4 * gray[1:-1, 1:-1]
        + gray[:-2, 1:-1] + gray[2:, 1:-1]
        + gray[1:-1, :-2] + gray[1:-1, 2:]
    )
    blur_score = float(laplacian.var()) if laplacian.size > 0 else 0.0
    is_blurry = blur_score < 20.0

    # Foliage / leaf color detection in HSV
    hsv = np.array(image.convert('HSV'), dtype=np.float32)
    h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
    
    # Accommodate natural diseased foliage (chlorosis, necrosis, rust, blight) and hand context
    green_mask = (h >= 30) & (h <= 120) & (s >= 20) & (v >= 20)
    yellow_mask = (h >= 12) & (h < 35) & (s >= 25) & (v >= 25)
    brown_mask = (h >= 6) & (h < 25) & (s >= 20) & (s <= 220) & (v >= 15) & (v <= 220)
    
    foliage_mask = green_mask | yellow_mask | brown_mask
    leaf_ratio = float(np.mean(foliage_mask)) if foliage_mask.size > 0 else 0.0
    is_leaf_detected = leaf_ratio >= 0.05

    # Center blossom / flower detection (yellow, pink, red petals)
    ch, cw = h.shape[0] // 2, h.shape[1] // 2
    r = min(ch, cw) // 2
    if r > 10:
        center_h = h[ch-r:ch+r, cw-r:cw+r]
        center_s = s[ch-r:ch+r, cw-r:cw+r]
        center_v = v[ch-r:ch+r, cw-r:cw+r]
        yellow_flower = (center_h >= 18) & (center_h <= 45) & (center_s >= 60) & (center_v >= 100)
        red_pink_flower = ((center_h <= 10) | (center_h >= 240)) & (center_s >= 50) & (center_v >= 80)
        flower_ratio = float(np.mean(yellow_flower | red_pink_flower))
    else:
        flower_ratio = 0.0
    is_flower_detected = flower_ratio >= 0.25

    return {
        "isBlurry": bool(is_blurry),
        "blurScore": round(blur_score, 2),
        "isLeafDetected": bool(is_leaf_detected or is_flower_detected),
        "leafRatio": round(leaf_ratio, 3),
        "isFlowerDetected": bool(is_flower_detected),
        "flowerRatio": round(flower_ratio, 3)
    }

def load_and_preprocess_image(image_bytes: bytes, return_details: bool = False):
    """
    Validate and load image bytes, cleanly compositing transparency onto white canvas
    to avoid black background distortion, then return normalized PyTorch multi-scale tensors.
    """
    try:
        raw_image = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise ValueError(f"Invalid image format or corrupted file: {str(e)}")
    
    # Handle transparency cleanly (PNG, WEBP, GIF) without black border artifact
    if raw_image.mode in ('RGBA', 'LA') or (raw_image.mode == 'P' and 'transparency' in raw_image.info):
        rgba = raw_image.convert('RGBA')
        canvas = Image.new('RGB', rgba.size, (255, 255, 255))
        canvas.paste(rgba, mask=rgba.split()[-1])
        rgb_image = canvas
    else:
        rgb_image = raw_image.convert('RGB')
    
    quality_info = check_image_quality(rgb_image)
    tensor_direct = eval_transforms(rgb_image).unsqueeze(0)  # Shape: (1, 3, 224, 224)
    tensor_crop = aspect_crop_transforms(rgb_image).unsqueeze(0)  # Shape: (1, 3, 224, 224)
    
    tensors = (tensor_direct, tensor_crop)
    if return_details:
        return tensors, rgb_image, quality_info
    return tensors

def parse_class_identifier(class_id: str):
    """
    Parses class directory names into exact human-friendly (crop, disease, is_healthy)
    matching the database model.
    """
    if class_id in CLASS_MAPPING:
        return CLASS_MAPPING[class_id]
        
    # Algorithmic fallback
    if "___" in class_id:
        crop_part, disease_part = class_id.split("___", 1)
    elif "_" in class_id:
        crop_part, disease_part = class_id.split("_", 1)
    else:
        crop_part, disease_part = class_id, "Unknown"
        
    crop = crop_part.replace("__", " ").replace("_", " ").strip().title()
    if "pepper" in crop.lower():
        crop = "Pepper"
        
    disease = disease_part.replace("__", " ").replace("_", " ").strip().title()
    disease = disease.replace("Two Spotted Spider Mite", "Spider Mites")
    disease = disease.replace("Tomato Mosaic Virus", "Mosaic Virus")
    disease = " ".join(disease.split())
    
    is_healthy = "healthy" in disease.lower() or "healthy" in class_id.lower()
    if is_healthy:
        disease = "Healthy"
        
    return crop, disease, is_healthy

