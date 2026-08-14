import base64
import io
import json
import time
import requests
from PIL import Image

key = None
with open(r"d:\OM NATU\SKH-Livestock\backend\.env", "r", encoding="utf-8") as f:
    for line in f:
        if line.strip().startswith("ONLINE_AI_API_KEY"):
            key = line.strip().split("=", 1)[1].strip().strip("\"'")

im = Image.open(r"d:\OM NATU\SKH-Livestock\scratch\test_cattle.jpg").convert("RGB")
im.thumbnail((512, 512))
buf = io.BytesIO()
im.save(buf, format="JPEG", quality=85)
b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
print(f"Optimized base64 payload size: {len(b64)/1024:.1f} KB")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={key}"
prompt_text = 'Analyze this cattle image. Respond in JSON: {"prediction": "healthy"|"foot-and-mouth"|"lumpy", "confidence": float, "probabilities": {"healthy": float, "foot-and-mouth": float, "lumpy": float}, "title": string, "summary": string, "action": string, "badge_class": "ok"|"warn"}'

payload = {
    "contents": [{"parts": [{"text": prompt_text}, {"inline_data": {"mime_type": "image/jpeg", "data": b64}}]}],
    "generationConfig": {"response_mime_type": "application/json", "temperature": 0.2}
}

t0 = time.time()
r = requests.post(url, json=payload, timeout=8)
t1 = time.time()
print(f"Status: {r.status_code} in {t1-t0:.2f}s")
if r.status_code == 200:
    print("Response JSON:\n", json.dumps(r.json()["candidates"][0]["content"]["parts"][0]["text"], indent=2))
