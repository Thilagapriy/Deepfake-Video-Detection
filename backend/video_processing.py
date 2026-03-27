import os
import asyncio
import json
import random
import cv2
import numpy as np
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from history import get_current_user

router = APIRouter(prefix="/api/video", tags=["video"])

UPLOAD_DIR = "./temp_videos"
FRAMES_DIR = "./static/frames"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(FRAMES_DIR, exist_ok=True)

async def simulate_analysis(video_path: str):
    await asyncio.sleep(5) # Simulating initial analysis delay
    
    # 1. Extract frames using OpenCV
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception("Failed to open video")
        
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)

    # Pick 5 evenly spaced frames
    frame_indices = [int(i * total_frames / 5) for i in range(5)]
    frames_extracted = []
    
    session_id = uuid.uuid4().hex[:8]
    
    for idx, f_idx in enumerate(frame_indices):
        cap.set(cv2.CAP_PROP_POS_FRAMES, min(f_idx, total_frames - 1))
        ret, frame = cap.read()
        if ret:
            # Resize for uniform frontend display
            frame = cv2.resize(frame, (400, 300))
            filename = f"frame_{session_id}_{idx}.jpg"
            out_path = os.path.join(FRAMES_DIR, filename)
            cv2.imwrite(out_path, frame)
            frames_extracted.append({"name": filename, "path": out_path, "idx": idx})
    
    cap.release()
    
    is_fake = random.choice(["Real", "Fake"])
    fake_percentage = round(random.uniform(55.0, 99.9) if is_fake == "Fake" else random.uniform(0.1, 45.0), 2)
    
    frames_names = [f["name"] for f in frames_extracted]
    gradcam_frame_name = ""
    
    # Apply simulated Grad-CAM heatmap to the middle frame if Fake, or just any frame
    if frames_extracted and is_fake == "Fake":
        target = frames_extracted[2] if len(frames_extracted) > 2 else frames_extracted[-1]
        img = cv2.imread(target["path"])
        
        # 1. Create a mock activation map (1-channel 0-255)
        activation_map = np.zeros(img.shape[:2], dtype=np.float32)
        h, w = activation_map.shape
        # Add primary activation over the approximate face/mouth area
        cv2.circle(activation_map, (w//2, h//2 + 20), 80, 255.0, -1)
        # Smooth out the map to mimic low-resolution CNN feature map behavior
        activation_map = cv2.GaussianBlur(activation_map, (121, 121), 0)
        
        # Normalize between 0 and 255
        activation_map = (activation_map - np.min(activation_map)) / (np.max(activation_map) - np.min(activation_map) + 1e-5)
        activation_map = np.uint8(255 * activation_map)
        
        # 2. Apply JET Colormap to convert grayscale map to Blue-to-Red heatmap
        heatmap = cv2.applyColorMap(activation_map, cv2.COLORMAP_JET)
        
        # 3. Superimpose the heatmap (Grad-CAM) over the original image
        vis = cv2.addWeighted(heatmap, 0.45, img, 0.55, 0)
        
        gradcam_frame_name = f"gradcam_{target['name']}"
        cv2.imwrite(os.path.join(FRAMES_DIR, gradcam_frame_name), vis)
        
        # Replace original with gradcam in the list or just supply it to highlight
        frames_names[target["idx"]] = gradcam_frame_name
    
    stats = {
        "confidence_score": fake_percentage,
        "faces_detected": random.randint(1, 3),
        "total_frames_analyzed": total_frames
    }
    
    return is_fake, fake_percentage, frames_names, gradcam_frame_name, stats

@router.post("/analyze")
async def analyze_video(
    file: UploadFile = File(...), 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Invalid video format.")
        
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_location, "wb+") as file_object:
        file_object.write(await file.read())

    # Simulate inference using SOTA MDNet / ViT
    is_fake, fake_percentage, frames, gradcam_frame, stats = await simulate_analysis(file_location)
    
    # Save to history table
    history_entry = models.History(
        user_id=current_user.id,
        video_filename=file.filename,
        is_fake=is_fake,
        fake_percentage=fake_percentage,
        frame_data_json=json.dumps(frames),
        gradcam_frame_path=gradcam_frame,
        stats_json=json.dumps(stats)
    )
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)
    
    return {
        "id": history_entry.id,
        "is_fake": is_fake,
        "fake_percentage": fake_percentage,
        "frames": frames,
        "gradcam_frame": gradcam_frame,
        "stats": stats,
        "message": "Analysis completed successfully"
    }
