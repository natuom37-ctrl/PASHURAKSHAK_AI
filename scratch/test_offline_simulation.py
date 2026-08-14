import asyncio
import io
import json
import os
import sys
from unittest.mock import patch
import requests

# Add workspace root to sys.path
sys.path.insert(0, r"d:\OM NATU\SKH-Livestock")

from fastapi import UploadFile
from app import predict

async def run_offline_test():
    with open(r"d:\OM NATU\SKH-Livestock\scratch\test_cattle.jpg", "rb") as f:
        file_bytes = f.read()

    upload_file = UploadFile(
        file=io.BytesIO(file_bytes),
        filename="test_cattle.jpg",
        headers={"content-type": "image/jpeg"}
    )

    print("=== Simulating Gemini Cloud Unavailability (Network Disconnection / Timeout) ===")

    # Mock requests.post to simulate network offline / timeout to Google Gemini API
    with patch("requests.post", side_effect=requests.exceptions.ConnectTimeout("Connection to Gemini timed out (Network Offline Simulation)")):
        res = await predict(upload_file)
        
        print("HTTP Status: 200")
        print("inference_engine:", res.get("inference_engine"))
        print("network_status:", res.get("network_status"))
        print("prediction:", res.get("prediction"))
        print("confidence:", res.get("confidence"))
        print("probabilities:", json.dumps(res.get("probabilities"), indent=2))
        print("title:", res.get("title"))
        print("summary:", res.get("summary"))
        print("action:", res.get("action"))

if __name__ == "__main__":
    asyncio.run(run_offline_test())
