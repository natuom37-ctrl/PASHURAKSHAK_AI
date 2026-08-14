import os, base64, json, requests

key = None
with open(r"d:\OM NATU\SKH-Livestock\backend\.env", "r", encoding="utf-8") as f:
    for line in f:
        if line.strip().startswith("ONLINE_AI_API_KEY"):
            key = line.strip().split("=", 1)[1].strip().strip("\"'")

with open(r"d:\OM NATU\SKH-Livestock\scratch\test_cattle.jpg", "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode("utf-8")

candidate_models = ["gemini-flash-latest", "gemini-3.5-flash", "gemini-3.7-flash", "gemini-2.5-flash-lite", "gemini-pro-latest"]

for m in candidate_models:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={key}"
    payload = {
        "contents": [{
            "parts": [
                {"text": "Analyze this cattle image. Respond in JSON: {\"prediction\": \"healthy\"|\"foot-and-mouth\"|\"lumpy\", \"confidence\": float}"},
                {"inline_data": {"mime_type": "image/jpeg", "data": img_b64}}
            ]
        }],
        "generationConfig": {"response_mime_type": "application/json"}
    }
    r = requests.post(url, json=payload, timeout=8)
    print(f"Model [{m}] -> HTTP {r.status_code}")
    if r.status_code == 200:
        print("Response:", r.json()["candidates"][0]["content"]["parts"][0]["text"][:150])
        break
    else:
        print("Error:", r.text[:150])
