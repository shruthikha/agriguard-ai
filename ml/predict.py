import os
import sys
import json
import math
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

def predict_image_bytes(image_bytes: bytes, crop_hint: str = None):
    """
    Performs deterministic inference on image bytes:
    - Extracts image quality (blurriness, leaf presence)
    - Computes softmax probabilities over all 18 classes
    - Evaluates distribution entropy (out-of-distribution detection)
    - Returns primary prediction, top 3 alternative predictions, quality metrics, and warnings
    """
    model, class_names = get_model_and_classes()
    tensors, rgb_image, quality_info = load_and_preprocess_image(image_bytes, return_details=True)
    
    with torch.no_grad():
        if isinstance(tensors, (tuple, list)):
            t_direct, t_crop = tensors
            t_direct = t_direct.to(_DEVICE)
            t_crop = t_crop.to(_DEVICE)
            logits_direct = model(t_direct)
            logits_crop = model(t_crop)
            # Multi-scale ensemble: balances global leaf silhouette with close-up lesion texture
            logits = (logits_direct + logits_crop) / 2.0
        else:
            tensor = tensors.to(_DEVICE)
            logits = model(tensor)
            
        probabilities = F.softmax(logits, dim=1).squeeze(0)
        
    probs_list = probabilities.cpu().tolist()
    
    # 1. Calculate Shannon entropy for Out-of-Distribution (OOD) uncertainty
    entropy = -sum(p * math.log2(p + 1e-12) for p in probs_list if p > 0)
    # Max possible entropy for 38 classes is log2(38) = 5.25
    is_ood = (entropy > 4.65) and (max(probs_list) < 0.20)
    quality_info["entropy"] = round(float(entropy), 2)
    quality_info["isOOD"] = bool(is_ood)
    
    # 2. Check if user provided a specific crop hint or floral blossom detected
    crop_hint_analysis = None
    crop_indices = []
    hint_clean = crop_hint.strip().title() if (crop_hint and crop_hint.strip()) else ""

    # Special handling for Rose (ornamental / garden flora)
    is_rose_query = (hint_clean.lower() == 'rose') or (
        (not hint_clean) and quality_info.get("isFlowerDetected", False)
    )

    if is_rose_query:
        # Evaluate visual pathology: spot/blight vs powdery mildew vs healthy
        spot_prob = sum(probabilities[i].item() for i, c in enumerate(class_names) if any(k in c.lower() for k in ['blight', 'spot', 'rot', 'scorch']))
        mildew_prob = sum(probabilities[i].item() for i, c in enumerate(class_names) if 'mildew' in c.lower())
        healthy_prob = sum(probabilities[i].item() for i, c in enumerate(class_names) if 'healthy' in c.lower())
        
        total_p = spot_prob + mildew_prob + healthy_prob + 1e-6
        spot_pct = spot_prob / total_p
        mildew_pct = mildew_prob / total_p
        healthy_pct = healthy_prob / total_p

        rose_candidates = [
            {
                "crop": "Rose",
                "disease": "Black Spot",
                "isHealthy": False,
                "confidence": round(spot_pct * 100, 2),
                "classId": "Rose___Black_spot"
            },
            {
                "crop": "Rose",
                "disease": "Powdery Mildew",
                "isHealthy": False,
                "confidence": round(mildew_pct * 100, 2),
                "classId": "Rose___Powdery_mildew"
            },
            {
                "crop": "Rose",
                "disease": "Healthy",
                "isHealthy": True,
                "confidence": round(healthy_pct * 100, 2),
                "classId": "Rose___healthy"
            }
        ]
        rose_candidates.sort(key=lambda x: x["confidence"], reverse=True)
        ranked_predictions = rose_candidates
        crop_hint_analysis = {
            "hint": "Rose" if hint_clean.lower() == 'rose' else "Rose (Flower Detected)",
            "matchesPrimary": True,
            "strongMismatch": False
        }
    elif hint_clean:
        # Find indices corresponding to this crop
        crop_indices = [i for i, c in enumerate(class_names) if hint_clean.lower() in c.lower()]
    
    if is_rose_query:
        pass
    elif crop_indices:
        hint_logits = logits[:, crop_indices]
        hint_probs = F.softmax(hint_logits, dim=1).squeeze(0)
        
        # Global top 1 for comparison
        global_top_p, global_top_idx = torch.topk(probabilities, k=1)
        global_c_name = class_names[global_top_idx.item()]
        global_crop, global_dis, _ = parse_class_identifier(global_c_name)
        
        # Check if global prediction strongly suggests a completely different crop
        strong_crop_mismatch = (global_top_p.item() > 0.85) and (global_crop.lower() != hint_clean.lower())
        
        if not strong_crop_mismatch:
            # Use crop-conditioned probabilities for sharper diagnostic certainty
            top_k = min(4, len(crop_indices))
            top_probs, top_indices = torch.topk(hint_probs, k=top_k)
            
            ranked_predictions = []
            for prob, idx in zip(top_probs, top_indices):
                orig_idx = crop_indices[idx.item()]
                c_name = class_names[orig_idx]
                c_crop, c_dis, c_hlth = parse_class_identifier(c_name)
                ranked_predictions.append({
                    "crop": c_crop,
                    "disease": c_dis,
                    "isHealthy": c_hlth,
                    "confidence": round(float(prob.item()) * 100, 2),
                    "classId": c_name
                })
        else:
            # Fall back to global if mismatch is overwhelmingly strong (>85%)
            top_k = min(4, len(class_names))
            top_probs, top_indices = torch.topk(probabilities, k=top_k)
            ranked_predictions = []
            for prob, idx in zip(top_probs, top_indices):
                c_name = class_names[idx.item()]
                c_crop, c_dis, c_hlth = parse_class_identifier(c_name)
                ranked_predictions.append({
                    "crop": c_crop,
                    "disease": c_dis,
                    "isHealthy": c_hlth,
                    "confidence": round(float(prob.item()) * 100, 2),
                    "classId": c_name
                })
                
        crop_hint_analysis = {
            "hint": hint_clean,
            "matchesPrimary": (ranked_predictions[0]["crop"].lower() == hint_clean.lower()),
            "strongMismatch": strong_crop_mismatch
        }
    else:
        # Standard unconditioned prediction over all classes
        top_k = min(4, len(class_names))
        top_probs, top_indices = torch.topk(probabilities, k=top_k)
        ranked_predictions = []
        for prob, idx in zip(top_probs, top_indices):
            c_name = class_names[idx.item()]
            c_crop, c_dis, c_hlth = parse_class_identifier(c_name)
            ranked_predictions.append({
                "crop": c_crop,
                "disease": c_dis,
                "isHealthy": c_hlth,
                "confidence": round(float(prob.item()) * 100, 2),
                "classId": c_name
            })
            
    primary = ranked_predictions[0]
    alternatives = ranked_predictions[1:4]
    
    # 3. Actionable warnings
    warnings = []
    if quality_info.get("isBlurry"):
        warnings.append("The uploaded image appears blurry or out-of-focus. For highest accuracy, capture a sharp photo in good daylight.")
    if not quality_info.get("isLeafDetected"):
        warnings.append("Low vegetation foliage detected. Make sure the photo clearly frames a plant leaf rather than soil or background.")
    if is_ood or primary["confidence"] < 35.0:
        warnings.append(f"AI confidence is low ({primary['confidence']}%). Visual symptoms may be atypical or from an unsupported plant variety.")
    if crop_hint_analysis and crop_hint_analysis.get("strongMismatch"):
        warnings.append(f"You selected '{crop_hint_analysis['hint']}', but visual leaf features strongly resemble {primary['crop']} ({primary['confidence']}%).")
        
    return {
        "crop": primary["crop"],
        "disease": primary["disease"],
        "confidence": primary["confidence"],
        "isHealthy": primary["isHealthy"],
        "classId": primary["classId"],
        "topPredictions": ranked_predictions,
        "alternativePredictions": alternatives,
        "quality": quality_info,
        "warnings": warnings,
        "cropHintAnalysis": crop_hint_analysis
    }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_img_path = sys.argv[1]
        hint = sys.argv[2] if len(sys.argv) > 2 else None
        with open(test_img_path, "rb") as f:
            res = predict_image_bytes(f.read(), crop_hint=hint)
        print(json.dumps(res, indent=2))
    else:
        print("Usage: python predict.py <path_to_leaf_image> [optional_crop_hint]")

