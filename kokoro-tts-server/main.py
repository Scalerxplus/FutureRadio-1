import os
import uuid
import numpy as np
import soundfile as sf
import requests
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from kokoro_onnx import Kokoro
import uvicorn

app = FastAPI(title="Kokoro-82M TTS Server")

# Directory setup
OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs("models", exist_ok=True)
os.makedirs("voices", exist_ok=True)

# Model paths
MODEL_PATH = "models/kokoro-v1.0.onnx"
VOICES_BIN_PATH = "models/voices-v1.0.bin"

def download_file(url, dest):
    print(f"Downloading from {url} to {dest}...")
    response = requests.get(url, stream=True)
    response.raise_for_status()
    with open(dest, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    print("Download complete.")

# Ensure model exists (Download if missing)
if not os.path.exists(MODEL_PATH):
    print("Downloading Kokoro-82M ONNX v1.0 model...")
    download_file("https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx", MODEL_PATH)
    
if not os.path.exists(VOICES_BIN_PATH):
    print("Downloading Kokoro-82M v1.0 voices.bin...")
    download_file("https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin", VOICES_BIN_PATH)

# Initialize Kokoro (Loads into RAM/VRAM extremely fast)
try:
    kokoro = Kokoro(MODEL_PATH, VOICES_BIN_PATH)
    print("Kokoro-82M v1.0 Engine Initialized Successfully!")
except Exception as e:
    print(f"Failed to load Kokoro: {e}")
    kokoro = None

class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    voice_id: str = "pm"  # We map pm -> am_adam, aaira -> af_sky
    speed: float = 1.0

# Mock DB mapping
VOICE_MAP = {
    "pm": "am_adam",  # American Male
    "aaira": "af_sky", # American Female
}

def generate_audio_task(job_id: str, request: TTSRequest):
    if not kokoro:
        print(f"[Job {job_id}] Error: Kokoro engine not loaded.")
        return

    try:
        print(f"[Job {job_id}] Started generating Kokoro audio...")
        
        # Determine Kokoro voice name
        k_voice = VOICE_MAP.get(request.voice_id.lower(), "am_adam")
        
        # Generate Audio with Kokoro v1.0
        # For v1.0, voices are bundled inside voices-v1.0.bin, so we don't need to download individual voice files.
        stream, sample_rate = kokoro.create(request.text, voice=k_voice, speed=request.speed, lang="en-us")
        
        out_path = os.path.join(OUTPUT_DIR, f"{job_id}.wav")
        sf.write(out_path, stream, sample_rate)
        
        print(f"[Job {job_id}] Completed! Saved to {out_path}")
        
    except Exception as e:
        print(f"[Job {job_id}] Failed: {str(e)}")

@app.post("/generate-broadcast")
async def generate_broadcast(request: TTSRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    background_tasks.add_task(generate_audio_task, job_id, request)
    return JSONResponse(content={"status": "processing", "job_id": job_id})

@app.get("/status/{job_id}")
async def get_status(job_id: str):
    out_path = os.path.join(OUTPUT_DIR, f"{job_id}.wav")
    if os.path.exists(out_path):
        return {"status": "completed", "output_path": f"outputs/{job_id}.wav"}
    else:
        return {"status": "processing"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
