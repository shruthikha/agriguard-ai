import torch
import torch.nn as nn
from torchvision import models

def build_crop_disease_model(num_classes: int = 38, pretrained: bool = False):
    """
    Builds a MobileNetV2 architecture for plant disease diagnosis matching
    the PlantVillage benchmark weights.
    """
    weights = models.MobileNet_V2_Weights.DEFAULT if pretrained else None
    model = models.mobilenet_v2(weights=weights)
    
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Sequential(
        nn.Dropout(p=0.2),
        nn.Linear(in_features, num_classes)
    )
    
    return model

