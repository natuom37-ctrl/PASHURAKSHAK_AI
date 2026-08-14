import os

workspace = r"d:\OM NATU\SKH-Livestock"

tracked = []
ignored = []

ignore_rules = [
    ".env", "backend/.env", "backend/venv", "scratch", "__pycache__"
]

for root, dirs, files in os.walk(workspace):
    for f in files:
        rel = os.path.relpath(os.path.join(root, f), workspace).replace("\\", "/")
        if any(rel.startswith(rule) or f"/{rule}" in rel or rel == rule for rule in [".env", "backend/.env", "backend/venv", "scratch", "__pycache__"]) or rel.endswith(".pyc"):
            ignored.append(rel)
        else:
            tracked.append(rel)

print(f"Tracked Files for Deployment ({len(tracked)}):")
for t in sorted(tracked)[:20]:
    print(f"  + {t}")
if len(tracked) > 20:
    print(f"  ... and {len(tracked) - 20} more clean files.")

print(f"\nProtected Ignored Files ({len(ignored)}):")
for ig in sorted(ignored)[:10]:
    print(f"  [X] {ig}")
