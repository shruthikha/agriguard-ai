import os
import sys
import json
import torch
import numpy as np
from torch.utils.data import DataLoader
from torchvision import datasets
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support
import matplotlib.pyplot as plt
import seaborn as sns

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from preprocess import eval_transforms
from models.architecture import build_crop_disease_model

def evaluate():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(base_dir, "dataset")
    test_dir = os.path.join(dataset_dir, "test")
    models_dir = os.path.join(base_dir, "models")
    model_path = os.path.join(models_dir, "crop_disease_model.pth")
    class_names_path = os.path.join(models_dir, "class_names.json")
    
    if not os.path.exists(model_path) or not os.path.exists(class_names_path):
        print("Model or class_names.json not found. Run train.py first.")
        return
        
    with open(class_names_path, "r") as f:
        class_names = json.load(f)
        
    test_data = datasets.ImageFolder(test_dir, transform=eval_transforms)
    test_loader = DataLoader(test_data, batch_size=16, shuffle=False)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = build_crop_disease_model(num_classes=len(class_names), pretrained=False)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    model.eval()
    
    y_true, y_pred = [], []
    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = outputs.max(1)
            y_true.extend(labels.cpu().numpy())
            y_pred.extend(preds.cpu().numpy())
            
    test_acc = np.mean(np.array(y_true) == np.array(y_pred))
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='weighted', zero_division=0)
    
    print("\n--- Evaluation Results ---")
    print(f"Accuracy:  {test_acc * 100:.2f}%")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_true, y_pred, target_names=class_names, zero_division=0))

if __name__ == "__main__":
    evaluate()
