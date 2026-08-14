import os
import re

workspace = r"d:\OM NATU\SKH-Livestock"
secret_patterns = [
    re.compile(r"AIza[0-9A-Za-z-_]{35}"),
    re.compile(r"AQ\.[0-9A-Za-z-_]{30,}"),
    re.compile(r"key=AQ\.[0-9A-Za-z-_]+"),
    re.compile(r"key=AIza[0-9A-Za-z-_]+")
]

findings = []

for root, dirs, files in os.walk(workspace):
    if "venv" in root or ".git" in root or "__pycache__" in root:
        continue
    for f in files:
        filepath = os.path.join(root, f)
        relpath = os.path.relpath(filepath, workspace).replace("\\", "/")
        if relpath in ["backend/.env", ".env"]:
            continue
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as file_obj:
                content = file_obj.read()
                for pattern in secret_patterns:
                    matches = pattern.findall(content)
                    if matches:
                        findings.append((relpath, len(matches)))
                        break
        except Exception:
            pass

print("=== SECURITY SCAN RESULTS ===")
if findings:
    print(f"ALERT: Potential hardcoded secret patterns found in {len(findings)} files:")
    for f, count in findings:
        print(f" - {f} ({count} occurrence(s))")
else:
    print("ALL CLEAR: Zero hard-coded Gemini API keys or secrets detected in any project files.")
