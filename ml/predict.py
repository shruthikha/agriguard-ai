import os
import sys
import json
import torch
import torch.nn.functional as F

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from preprocess import load_and_preprocess_image, parse_class_identifier
from models.architecture import build_crop_disease_model

_MODEL = None
_CLASS_NAMES = None
_DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def get_model_and_classes():
    global _MODEL, _CLASS_NAMES
    if _MODEL is not None and _CLASS_NAMES is not None:
        return _MODEL, _CLASS_NAMES
        
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, "models")
    model_path = os.path.join(models_dir, "crop_disease_model.pth")
    class_names_path = os.path.join(models_dir, "class_names.json")
    
    if not os.path.exists(class_names_path):
        raise FileNotFoundError(f"class_names.json not found at {class_names_path}")
        
    with open(class_names_path, "r") as f:
        _CLASS_NAMES = json.load(f)
        
    _MODEL = build_crop_disease_model(num_classes=len(_CLASS_NAMES), pretrained=False)
    
    if os.path.exists(model_path):
        _MODEL.load_state_dict(torch.load(model_path, map_location=_DEVICE))
        print("Loaded trained model weights successfully.")
    else:
        print("Warning: crop_disease_model.pth not found. Using initialized MobileNetV2 architecture.")
        
    _MODEL = _MODEL.to(_DEVICE)
    _MODEL.eval()
    return _MODEL, _CLASS_NAMES

def predict_image_bytes(image_bytes: bytes):
    model, class_names = get_model_and_classes()
    tensor = load_and_preprocess_image(image_bytes).to(_DEVICE)
    
    with torch.no_grad():
        logits = model(tensor)
        probabilities = F.softmax(logits, dim=1).squeeze(0)
        
    # Get top 3 predictions
    top_k = min(3, len(class_names))
    top_probs, top_indices = torch.topk(probabilities, k=top_k)
    
    top_predictions = []
    for prob, idx in zip(top_probs, top_indices):
        c_name = class_names[idx.item()]
        c_crop, c_dis, c_hlth = parse_class_identifier(c_name)
        top_predictions.append({
            "crop": c_crop,
            "disease": c_dis,
            "isHealthy": c_hlth,
            "confidence": round(float(prob.item()) * 100, 2),
            "classId": c_name
        })
        
    primary = top_predictions[0]
    
    return {
        "crop": primary["crop"],
        "disease": primary["disease"],
        "confidence": primary["confidence"],
        "isHealthy": primary["isHealthy"],
        "classId": primary["classId"],
        "topPredictions": top_predictions
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_img_path = sys.argv[1]
        with open(test_img_path, "rb") as f:
            res = predict_image_bytes(f.read())
        print(json.dumps(res, indent=2))
    else:
        print("Usage: python predict.py <path_to_leaf_image>")
