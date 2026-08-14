import os

backend_env = r"d:\OM NATU\SKH-Livestock\backend\.env"
root_env = r"d:\OM NATU\SKH-Livestock\.env"

print("Backend .env exists:", os.path.exists(backend_env))
print("Root .env exists:", os.path.exists(root_env))

if os.path.exists(backend_env):
    with open(backend_env, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("ONLINE_AI_API_KEY"):
                parts = line.split("=", 1)
                if len(parts) == 2:
                    val = parts[1].strip().strip("\"'")
                    is_set = bool(val and val != "YOUR_GEMINI_API_KEY_HERE")
                    is_placeholder = (val == "YOUR_GEMINI_API_KEY_HERE")
                    print("ONLINE_AI_API_KEY variable present: True")
                    print("Is Placeholder:", is_placeholder)
                    print("Is Non-empty Configured Key:", is_set)
                    print("Key Length (characters):", len(val))
