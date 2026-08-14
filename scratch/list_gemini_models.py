import os
import requests

key = None
with open(r"d:\OM NATU\SKH-Livestock\backend\.env", "r", encoding="utf-8") as f:
    for line in f:
        if line.strip().startswith("ONLINE_AI_API_KEY"):
            key = line.strip().split("=", 1)[1].strip().strip("\"'")

if key:
    r = requests.get(f"https://generativelanguage.googleapis.com/v1beta/models?key={key}")
    if r.status_code == 200:
        models = [m.get("name") for m in r.json().get("models", []) if "generateContent" in m.get("supportedGenerationMethods", [])]
        print("Available Multimodal Models for this Key:")
        for m in models:
            print(" -", m)
    else:
        print("HTTP Error:", r.status_code, r.text[:200])
