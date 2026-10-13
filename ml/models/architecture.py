import torch
import torch.nn as nn
from torchvision import models

def build_crop_disease_model(num_classes: int = 18, pretrained: bool = True):
    """
    Builds a MobileNetV2 architecture for crop disease classification
    using transfer learning.
    """
    weights = models.MobileNet_V2_Weights.DEFAULT if pretrained else None
    model = models.mobilenet_v2(weights=weights)
    
    # Freeze earlier layers for transfer learning feature extraction
    for param in model.features[:10].parameters():
        param.requires_grad = False
        
    # Replace classifier head with custom dropout & linear layer
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, 256),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2),
        nn.Linear(256, num_classes)
    )
    
    return model
