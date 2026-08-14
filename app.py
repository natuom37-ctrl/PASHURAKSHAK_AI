"""
PashuRakshak AI - Unified Full-Stack Application
Compiles and serves Backend API, AI Inference (TFLite), and Frontend UI on a single Localhost.
"""

import io
import os
import sys
import webbrowser
import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# Configure UTF-8 encoding for console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Resolve directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
PASHU_DIR = os.path.join(BASE_DIR, "pashu")

# Initialize FastAPI App
app = FastAPI(
    title="PashuRakshak AI - Livestock Health & Disease Detection",
    description="Unified API and Dashboard for Cattle Health Monitoring & TFLite Disease Classification",
    version="2.0.0"
)

# Enable CORS for universal access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import base64
import json
import requests

# Load environment configuration securely from backend/.env
def load_env_file():
    """Load configuration from backend/.env or .env if present"""
    env_paths = [
        os.path.join(BACKEND_DIR, ".env"),
        os.path.join(BASE_DIR, ".env")
    ]
    for p in env_paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k, v = k.strip(), v.strip().strip("\"'")
                            os.environ[k] = v
            except Exception as e:
                print(f"[!] Warning reading env file {p}: {e}")

load_env_file()

# Load TFLite Model (Offline Local Edge Fallback)
MODEL_PATHS = [
    os.path.join(BACKEND_DIR, "cattle_disease_model.tflite"),
    os.path.join(BASE_DIR, "cattle_disease_model.tflite"),
    "cattle_disease_model.tflite"
]

interpreter = None
input_details = None
output_details = None

for path in MODEL_PATHS:
    if os.path.exists(path):
        try:
            from ai_edge_litert.interpreter import Interpreter
            interpreter = Interpreter(model_path=path)
            interpreter.allocate_tensors()
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            print(f"[OK] Successfully loaded TFLite model from: {path}")
            break
        except Exception as e:
            print(f"[!] Warning loading model from {path}: {e}")

CLASS_NAMES = [
    "foot-and-mouth",
    "healthy",
    "lumpy"
]

DISEASE_INFO = {
    "healthy": {
        "title": "Healthy Animal",
        "badge_class": "ok",
        "summary": "No signs of contagious lesions or skin nodules detected. The cattle appears in normal healthy condition.",
        "action": "Maintain routine hygiene, balanced nutrition, and regular immunization schedule."
    },
    "foot-and-mouth": {
        "title": "Foot-and-Mouth Disease (FMD) Detected",
        "badge_class": "warn",
        "summary": "Visual indicators consistent with Foot-and-Mouth Disease observed (vesicular lesions/sores). Highly contagious viral disease.",
        "action": "Immediately isolate the animal, restrict herd movement, apply antiseptic wash to sores, and contact your local veterinary officer for FMD management."
    },
    "lumpy": {
        "title": "Lumpy Skin Disease (LSD) Detected",
        "badge_class": "warn",
        "summary": "Distinct cutaneous nodules/lumps identified on skin. Vector-borne viral infection affecting cattle.",
        "action": "Isolate the animal, use mosquito/fly repellents to control insect vectors, treat secondary skin infections, and report to veterinary authorities for vaccination."
    }
}


def call_gemini_vision(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Call Google Gemini Multimodal REST API with strict timeout.
    Returns standardized dictionary matching the frontend contract if successful.
    """
    api_key = os.getenv("ONLINE_AI_API_KEY", "").strip()
    if not api_key or api_key in ["YOUR_GEMINI_API_KEY_HERE", ""]:
        raise ValueError("No valid Gemini API key configured.")

    model = os.getenv("ONLINE_AI_MODEL", "gemini-3.5-flash").strip()
    timeout_sec = float(os.getenv("ONLINE_AI_TIMEOUT_SECONDS", "7.0"))

    b64_data = base64.b64encode(image_bytes).decode("utf-8")

    prompt_text = (
        "You are an expert veterinary AI screening system specializing in cattle livestock health and epidemiology. "
        "Analyze this cattle image specifically for: "
        "1. Healthy cattle status "
        "2. Foot-and-Mouth Disease (FMD) (vesicular lesions, salivation, mouth/foot sores) "
        "3. Lumpy Skin Disease (LSD) (cutaneous nodular skin lesions, lumps, edema) "
        "Respond strictly in valid JSON matching this schema: "
        "{\n"
        '  "prediction": "healthy" | "foot-and-mouth" | "lumpy",\n'
        '  "confidence": <float between 50.0 and 99.9>,\n'
        '  "probabilities": {\n'
        '    "healthy": <float between 0.0 and 100.0>,\n'
        '    "foot-and-mouth": <float between 0.0 and 100.0>,\n'
        '    "lumpy": <float between 0.0 and 100.0>\n'
        "  },\n"
        '  "title": <string diagnosis header>,\n'
        '  "summary": <clinical assessment summary in 1-2 sentences>,\n'
        '  "action": <recommended veterinary action in 1-2 sentences>,\n'
        '  "badge_class": "ok" | "warn"\n'
        "}\n"
        "Ensure all 3 probabilities sum close to 100.0."
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt_text},
                    {
                        "inline_data": {
                            "mime_type": mime_type if mime_type.startswith("image/") else "image/jpeg",
                            "data": b64_data
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json",
            "temperature": 0.2
        }
    }

    headers = {"Content-Type": "application/json"}
    
    # Try configured model, fallback to active supported aliases if needed
    candidate_models = [model]
    for alt in ["gemini-3.5-flash", "gemini-3.7-flash", "gemini-flash-latest"]:
        if alt not in candidate_models:
            candidate_models.append(alt)

    response = None
    last_err = None
    for cand in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{cand}:generateContent?key={api_key}"
        try:
            r = requests.post(url, json=payload, headers=headers, timeout=timeout_sec)
            if r.status_code == 200:
                response = r
                break
            else:
                last_err = f"Model {cand} returned HTTP {r.status_code}: {r.text[:180]}"
        except Exception as ex:
            last_err = str(ex)

    if response is None or response.status_code != 200:
        raise RuntimeError(f"Gemini API call failed: {last_err}")

    data = response.json()
    candidates = data.get("candidates", [])
    if not candidates:
        raise RuntimeError("Gemini returned empty candidates.")

    part_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
    result = json.loads(part_text)

    raw_pred = str(result.get("prediction", "healthy")).lower().strip()
    if "lumpy" in raw_pred:
        pred_class = "lumpy"
    elif "foot" in raw_pred or "fmd" in raw_pred:
        pred_class = "foot-and-mouth"
    else:
        pred_class = "healthy"

    conf = float(result.get("confidence", 88.0))
    conf = round(conf if conf > 1 else conf * 100, 2)

    probs = result.get("probabilities", {})
    norm_probs = {
        "foot-and-mouth": round(float(probs.get("foot-and-mouth", probs.get("fmd", 5.0))), 2),
        "healthy": round(float(probs.get("healthy", 90.0)), 2),
        "lumpy": round(float(probs.get("lumpy", probs.get("lsd", 5.0))), 2)
    }

    info = DISEASE_INFO.get(pred_class, {})

    return {
        "prediction": pred_class,
        "confidence": conf,
        "probabilities": norm_probs,
        "title": result.get("title") or info.get("title", pred_class.title()),
        "summary": result.get("summary") or info.get("summary", ""),
        "action": result.get("action") or info.get("action", ""),
        "badge_class": "ok" if pred_class == "healthy" else "warn",
        "inference_engine": "online_ai",
        "network_status": "online"
    }


def run_tflite_inference(image_bytes: bytes) -> dict:
    """
    Execute local TFLite model using ai_edge_litert interpreter.
    """
    if interpreter is None:
        raise HTTPException(status_code=503, detail="AI Model interpreter is not loaded.")

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))

    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)

    interpreter.set_tensor(input_details[0]["index"], image_array)
    interpreter.invoke()

    predictions = interpreter.get_tensor(output_details[0]["index"])[0]

    predicted_index = int(np.argmax(predictions))
    predicted_class = CLASS_NAMES[predicted_index]
    confidence = float(predictions[predicted_index] * 100)

    probabilities = {
        CLASS_NAMES[i]: round(float(predictions[i] * 100), 2)
        for i in range(len(CLASS_NAMES))
    }

    info = DISEASE_INFO.get(predicted_class, {})

    return {
        "prediction": predicted_class,
        "confidence": round(confidence, 2),
        "probabilities": probabilities,
        "title": info.get("title", predicted_class.title()),
        "summary": info.get("summary", ""),
        "action": info.get("action", ""),
        "badge_class": info.get("badge_class", "ok"),
        "inference_engine": "offline_tflite",
        "network_status": "offline"
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    api_key = os.getenv("ONLINE_AI_API_KEY", "").strip()
    online_ready = bool(api_key and api_key != "YOUR_GEMINI_API_KEY_HERE")
    return {
        "status": "healthy",
        "model_loaded": interpreter is not None,
        "online_ai_configured": online_ready,
        "online_model": os.getenv("ONLINE_AI_MODEL", "gemini-3.5-flash"),
        "classes": CLASS_NAMES,
        "version": "2.0.0"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    try:
        image_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read image payload: {e}")

    # 1. Attempt Online AI (Google Gemini 2.5 Flash) if configured
    online_enabled = os.getenv("ONLINE_AI_ENABLED", "true").lower() in ["true", "1", "yes"]
    api_key = os.getenv("ONLINE_AI_API_KEY", "").strip()

    if online_enabled and api_key and api_key != "YOUR_GEMINI_API_KEY_HERE":
        try:
            result = call_gemini_vision(image_bytes, file.content_type)
            return result
        except Exception as e:
            print(f"[Hybrid AI] ⚠️ Online Gemini vision screening unavailable ({e}). Falling back to local TFLite...")

    # 2. Offline Fallback: Local Edge TFLite model
    try:
        result = run_tflite_inference(image_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Local TFLite inference error: {str(e)}")



# Serve Frontend HTML Dashboard at Root /
@app.get("/", response_class=HTMLResponse)
def serve_dashboard():
    # Priority: root index.html -> pashu/index.html -> pashu html file
    candidates = [
        os.path.join(BASE_DIR, "index.html"),
        os.path.join(PASHU_DIR, "index.html"),
        os.path.join(PASHU_DIR, "pashurakshak_ai_alive_lenis_ui (1).html")
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return FileResponse(candidate)
    return HTMLResponse("<h1>PashuRakshak AI Dashboard</h1><p>Frontend file not found.</p>")


# Mount static assets
CSS_DIR = os.path.join(BASE_DIR, "css")
JS_DIR = os.path.join(BASE_DIR, "js")
ASSETS_DIR = os.path.join(BASE_DIR, "assets")

if os.path.exists(CSS_DIR):
    app.mount("/css", StaticFiles(directory=CSS_DIR), name="css")

if os.path.exists(JS_DIR):
    app.mount("/js", StaticFiles(directory=JS_DIR), name="js")

if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

if os.path.exists(PASHU_DIR):
    app.mount("/pashu", StaticFiles(directory=PASHU_DIR, html=True), name="pashu")




def run():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    url = f"http://localhost:{port}"

    print("=" * 65)
    print(" 🐮 PashuRakshak AI - Unified Full-Stack Server")
    print("=" * 65)
    print(f" [✓] Web Dashboard (UI)        : {url}/")
    print(f" [✓] Backend AI API Endpoint   : {url}/predict")
    print(f" [✓] Interactive API Docs      : {url}/docs")
    print(f" [✓] System Health Status      : {url}/api/health")
    print("=" * 65)
    print(" Press Ctrl+C in this console to stop the server.\n")

    # Only open browser automatically when running locally (not in cloud/headless mode)
    if "--no-browser" not in sys.argv and not os.getenv("PORT"):
        try:
            webbrowser.open(url)
        except Exception:
            pass

    uvicorn.run(app, host=host, port=port, log_level="info")


if __name__ == "__main__":
    run()
