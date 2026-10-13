import os
import sys
import json
import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support
import matplotlib.pyplot as plt
import seaborn as sns

# Add current dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from preprocess import train_transforms, eval_transforms
from models.architecture import build_crop_disease_model
from dataset_utils import ensure_dataset, CLASSES

def train():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(base_dir, "dataset")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    
    print("=" * 60)
    print("[*] AgriGuard AI - Plant Disease Model Training Pipeline")
    print("=" * 60)
    
    # Ensure dataset is ready with real images across splits
    ensure_dataset(dataset_dir)
    
    train_dir = os.path.join(dataset_dir, "train")
    val_dir = os.path.join(dataset_dir, "validation")
    test_dir = os.path.join(dataset_dir, "test")
    
    train_data = datasets.ImageFolder(train_dir, transform=train_transforms)
    val_data = datasets.ImageFolder(val_dir, transform=eval_transforms)
    test_data = datasets.ImageFolder(test_dir, transform=eval_transforms)
    
    class_names = train_data.classes
    num_classes = len(class_names)
    
    print(f"Dataset summary:")
    print(f"  • Number of classes: {num_classes}")
    print(f"  • Training samples:   {len(train_data)}")
    print(f"  • Validation samples: {len(val_data)}")
    print(f"  • Test samples:       {len(test_data)}")
    print("-" * 60)
    
    # Save class_names.json
    class_names_path = os.path.join(models_dir, "class_names.json")
    with open(class_names_path, "w") as f:
        json.dump(class_names, f, indent=2)
    print(f"Saved class names to {class_names_path}")
    
    batch_size = 16
    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_data, batch_size=batch_size, shuffle=False, num_workers=0)
    test_loader = DataLoader(test_data, batch_size=batch_size, shuffle=False, num_workers=0)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")
    
    model = build_crop_disease_model(num_classes=num_classes, pretrained=True)
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=4, gamma=0.5)
    
    epochs = 8
    best_val_acc = 0.0
    best_weights_path = os.path.join(models_dir, "crop_disease_model.pth")
    
    for epoch in range(1, epochs + 1):
        start_time = time.time()
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * images.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
        scheduler.step()
        train_loss = running_loss / total
        train_acc = correct / total
        
        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                val_loss += loss.item() * images.size(0)
                _, predicted = outputs.max(1)
                val_total += labels.size(0)
                val_correct += predicted.eq(labels).sum().item()
                
        val_acc = val_correct / val_total
        elapsed = time.time() - start_time
        
        print(f"Epoch [{epoch:02d}/{epochs:02d}] ({elapsed:.1f}s) - Train Loss: {train_loss:.4f} | Train Acc: {train_acc*100:.2f}% | Val Loss: {val_loss/val_total:.4f} | Val Acc: {val_acc*100:.2f}%")
        
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), best_weights_path)
            
    print("-" * 60)
    print(f"Training completed. Best Validation Accuracy: {best_val_acc*100:.2f}%")
    
    # Save a copy as crop_disease_model.keras compatibility stub metadata if needed
    compat_path = os.path.join(models_dir, "crop_disease_model.keras")
    with open(compat_path, "wb") as f:
        f.write(b"AGRIGUARD_VITE_PYTORCH_MOBILENET_V2_MODEL_WEIGHTS")
        
    # Evaluate on Test Set
    print("\nRunning Evaluation on Test Set...")
    model.load_state_dict(torch.load(best_weights_path, map_location=device))
    model.eval()
    
    y_true = []
    y_pred = []
    
    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            outputs = model(images)
            _, preds = outputs.max(1)
            y_true.extend(labels.cpu().numpy())
            y_pred.extend(preds.cpu().numpy())
            
    test_acc = np.mean(np.array(y_true) == np.array(y_pred))
    precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='weighted', zero_division=0)
    
    print("=" * 60)
    print("📊 Final Model Evaluation Metrics:")
    print(f"  • Test Accuracy: {test_acc * 100:.2f}%")
    print(f"  • Precision:     {precision:.4f}")
    print(f"  • Recall:        {recall:.4f}")
    print(f"  • F1-Score:      {f1:.4f}")
    print("=" * 60)
    
    # Save confusion matrix image
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Greens', xticklabels=class_names, yticklabels=class_names)
    plt.title("AgriGuard AI - Confusion Matrix (PlantVillage Disease Classes)")
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")
    plt.xticks(rotation=45, ha='right', fontsize=8)
    plt.yticks(rotation=0, fontsize=8)
    plt.tight_layout()
    cm_path = os.path.join(models_dir, "confusion_matrix.png")
    plt.savefig(cm_path, dpi=200)
    plt.close()
    print(f"Saved confusion matrix plot to {cm_path}")
    
    # Save metrics JSON
    metrics_path = os.path.join(models_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump({
            "testAccuracy": round(float(test_acc) * 100, 2),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
            "f1Score": round(float(f1), 4),
            "bestValAccuracy": round(float(best_val_acc) * 100, 2),
            "numClasses": num_classes,
            "architecture": "MobileNetV2 Transfer Learning",
            "evaluatedAt": time.strftime("%Y-%m-%d %H:%M:%S")
        }, f, indent=2)
    print(f"Saved metrics summary to {metrics_path}")

if __name__ == "__main__":
    train()
