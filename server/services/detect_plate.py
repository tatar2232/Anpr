import sys
import json
import argparse
from ultralytics import YOLO
import cv2
import numpy as np

def detect_plate(model_path, image_bytes):
    # Load the model
    model = YOLO(model_path)
    
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Run inference
    results = model(image)
    
    # Get the best prediction (highest confidence)
    best_pred = None
    max_conf = 0
    
    for r in results:
        for box in r.boxes:
            conf = float(box.conf[0])
            if conf > max_conf:
                max_conf = conf
                # Get the class name if available, otherwise use the box coordinates
                if hasattr(r, 'names') and box.cls is not None:
                    best_pred = r.names[int(box.cls[0])]
                else:
                    # Extract the license plate region and perform OCR if needed
                    # For now, we'll just return the confidence
                    best_pred = "DETECTED"
    
    return {
        "plate_number": best_pred if best_pred else None,
        "confidence": round(max_conf * 100, 2)
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', required=True, help='Path to YOLO model')
    parser.add_argument('--image', required=True, help='Path to image or - for stdin')
    args = parser.parse_args()
    
    # Read image from stdin if specified
    if args.image == '-':
        image_bytes = sys.stdin.buffer.read()
    else:
        with open(args.image, 'rb') as f:
            image_bytes = f.read()
    
    result = detect_plate(args.model, image_bytes)
    print(json.dumps(result))
