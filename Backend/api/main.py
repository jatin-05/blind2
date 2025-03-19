from fastapi import FastAPI, UploadFile, File,WebSocket
from fastapi.responses import JSONResponse
import torch
import cv2
import numpy as np
from ultralytics import YOLO
from gtts import gTTS
import os
import asyncio
import base64
import uvicorn 

from fastapi.middleware.cors import CORSMiddleware 


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://blind2-1-iveg.onrender.com"

    
]
app.add_middleware(
    CORSMiddleware ,
    allow_origins =origins ,
    allow_credentials =True ,
    allow_methods =["*"] ,
    allow_headers =["*"] ,
)

# midas = torch.hub.load("intel-isl/MiDaS", "MiDaS_small")  # lightweight version
# midas.eval()


yolo = YOLO("yolov8n.pt") 
model = YOLO("yolov8n.pt") 

def preprocess_midas(image):
    img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (256, 256))  # Resize to MiDaS input size
    img = torch.from_numpy(img).float().permute(2, 0, 1) / 255.0
    img = img.unsqueeze(0)
    return img



@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive base64 encoded image from frontend
            data = await websocket.receive_text()
            image_data = base64.b64decode(data)
            np_arr = np.frombuffer(image_data, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            # Run YOLO inference
            results = model(frame)

            # Extract detections
            detections = []
            for result in results:
                for box in result.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    label = result.names[int(box.cls[0])]
                    confidence = float(box.conf[0])
                    detections.append({"label": label, "confidence": confidence, "bbox": [x1, y1, x2, y2]})

            # Send detections back to frontend
            await websocket.send_json({"detections": detections})
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()


if __name__ == "__main__":
    uvicorn.run(app , host = '0.0.0.0')
    # uvicorn.run(app , host = 'localhost' , port =8000)

