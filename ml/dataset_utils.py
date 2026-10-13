import os
import json
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites_Two_spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

def create_synthetic_leaf(class_name: str, width: int = 224, height: int = 224) -> Image.Image:
    """
    Creates a realistic synthetic leaf image for the specified disease class
    with appropriate base pigmentation, vein patterns, and characteristic lesions.
    """
    # Background: soft soil or neutral natural backdrop
    bg_color = (random.randint(230, 245), random.randint(235, 248), random.randint(225, 240))
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Leaf color by crop & health
    is_healthy = "healthy" in class_name.lower()
    
    if "Apple" in class_name:
        leaf_base = (34, 139, 34) if is_healthy else (50, 110, 40)
    elif "Pepper" in class_name:
        leaf_base = (46, 139, 87) if is_healthy else (60, 120, 50)
    elif "Potato" in class_name:
        leaf_base = (30, 130, 30) if is_healthy else (70, 100, 35)
    else:  # Tomato
        leaf_base = (40, 150, 40) if is_healthy else (65, 115, 45)
        
    # Draw leaf contour (elliptical with pointed tip)
    center_x, center_y = width // 2, height // 2
    r_x = int(width * 0.38)
    r_y = int(height * 0.42)
    
    leaf_bbox = [center_x - r_x, center_y - r_y, center_x + r_x, center_y + r_y]
    draw.ellipse(leaf_bbox, fill=leaf_base, outline=(25, 80, 25))
    
    # Draw main vein and side veins
    vein_color = (max(0, leaf_base[0] - 15), min(255, leaf_base[1] + 25), max(0, leaf_base[2] - 10))
    draw.line([(center_x, center_y - r_y + 10), (center_x, center_y + r_y - 10)], fill=vein_color, width=3)
    
    for offset in range(-r_y + 25, r_y - 25, 25):
        y_pos = center_y + offset
        draw.line([(center_x, y_pos), (center_x - int(r_x * 0.7), y_pos - 15)], fill=vein_color, width=2)
        draw.line([(center_x, y_pos), (center_x + int(r_x * 0.7), y_pos - 15)], fill=vein_color, width=2)
        
    # Draw characteristic disease symptoms if diseased
    if not is_healthy:
        if "scab" in class_name.lower() or "bacterial" in class_name.lower() or "septoria" in class_name.lower():
            # Small dark circular/angular spots
            spot_color = (40, 30, 20)
            halo_color = (190, 180, 50)
            for _ in range(random.randint(15, 30)):
                sx = random.randint(center_x - int(r_x * 0.6), center_x + int(r_x * 0.6))
                sy = random.randint(center_y - int(r_y * 0.6), center_y + int(r_y * 0.6))
                rad = random.randint(3, 8)
                draw.ellipse([sx - rad - 2, sy - rad - 2, sx + rad + 2, sy + rad + 2], fill=halo_color)
                draw.ellipse([sx - rad, sy - rad, sx + rad, sy + rad], fill=spot_color)
                
        elif "black_rot" in class_name.lower():
            # Dark necrotic expanding lesions
            rot_color = (25, 20, 15)
            for _ in range(random.randint(3, 6)):
                sx = random.randint(center_x - int(r_x * 0.5), center_x + int(r_x * 0.5))
                sy = random.randint(center_y - int(r_y * 0.5), center_y + int(r_y * 0.5))
                rad = random.randint(15, 28)
                draw.ellipse([sx - rad, sy - rad, sx + rad, sy + rad], fill=rot_color)
                
        elif "rust" in class_name.lower():
            # Orange-yellow rust pustules
            rust_color = (210, 105, 30)
            yellow_halo = (230, 190, 40)
            for _ in range(random.randint(25, 45)):
                sx = random.randint(center_x - int(r_x * 0.6), center_x + int(r_x * 0.6))
                sy = random.randint(center_y - int(r_y * 0.6), center_y + int(r_y * 0.6))
                rad = random.randint(2, 6)
                draw.ellipse([sx - rad - 1, sy - rad - 1, sx + rad + 1, sy + rad + 1], fill=yellow_halo)
                draw.ellipse([sx - rad, sy - rad, sx + rad, sy + rad], fill=rust_color)
                
        elif "early_blight" in class_name.lower() or "target_spot" in class_name.lower():
            # Concentric rings / target pattern
            for _ in range(random.randint(4, 9)):
                sx = random.randint(center_x - int(r_x * 0.5), center_x + int(r_x * 0.5))
                sy = random.randint(center_y - int(r_y * 0.5), center_y + int(r_y * 0.5))
                for ring in [18, 14, 10, 6]:
                    c = (85 + ring * 3, 55 + ring * 2, 25)
                    draw.ellipse([sx - ring, sy - ring, sx + ring, sy + ring], fill=c)
                    
        elif "late_blight" in class_name.lower():
            # Irregular water-soaked brown/black necrotic patches
            for _ in range(random.randint(3, 7)):
                sx = random.randint(center_x - int(r_x * 0.5), center_x + int(r_x * 0.5))
                sy = random.randint(center_y - int(r_y * 0.5), center_y + int(r_y * 0.5))
                rad_x = random.randint(15, 32)
                rad_y = random.randint(12, 26)
                draw.ellipse([sx - rad_x, sy - rad_y, sx + rad_x, sy + rad_y], fill=(45, 40, 30))
                
        elif "mosaic" in class_name.lower():
            # Mottled light green and yellow mosaic pattern
            for _ in range(random.randint(20, 35)):
                sx = random.randint(center_x - int(r_x * 0.6), center_x + int(r_x * 0.6))
                sy = random.randint(center_y - int(r_y * 0.6), center_y + int(r_y * 0.6))
                c = (random.randint(170, 210), random.randint(190, 225), 40)
                draw.ellipse([sx - 10, sy - 8, sx + 10, sy + 8], fill=c)
                
        elif "spider_mites" in class_name.lower() or "mold" in class_name.lower():
            # Stippling, yellow speckles and webbing effect
            for _ in range(random.randint(40, 70)):
                sx = random.randint(center_x - int(r_x * 0.65), center_x + int(r_x * 0.65))
                sy = random.randint(center_y - int(r_y * 0.65), center_y + int(r_y * 0.65))
                draw.point((sx, sy), fill=(235, 230, 150))
                draw.point((sx + 1, sy), fill=(215, 200, 100))

    # Add subtle natural texture filter
    img = img.filter(ImageFilter.SMOOTH_MORE)
    return img

def ensure_dataset(base_dir: str, samples_per_class_train: int = 15, samples_per_class_val: int = 5, samples_per_class_test: int = 5):
    """
    Ensures dataset directory structure exists with training, validation, and test sets.
    Generates realistic samples if not present.
    """
    for split, count in [('train', samples_per_class_train), ('validation', samples_per_class_val), ('test', samples_per_class_test)]:
        split_dir = os.path.join(base_dir, split)
        os.makedirs(split_dir, exist_ok=True)
        for cls in CLASSES:
            cls_dir = os.path.join(split_dir, cls)
            os.makedirs(cls_dir, exist_ok=True)
            existing = [f for f in os.listdir(cls_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
            if len(existing) < count:
                for i in range(len(existing), count):
                    img = create_synthetic_leaf(cls)
                    img.save(os.path.join(cls_dir, f"{cls}_{split}_{i+1:03d}.jpg"), quality=95)
    print(f"Dataset verified and populated across train/validation/test in {base_dir}")
