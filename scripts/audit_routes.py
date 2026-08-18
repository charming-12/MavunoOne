from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app"

page_routes = set()
for path in APP.rglob("page.tsx"):
    rel = path.parent.relative_to(APP)
    route = "/" if str(rel) == "." else "/" + str(rel).replace("\\", "/")
    page_routes.add(route.rstrip("/") or "/")

refs = {}
patterns = [
    re.compile(r'href=["\'](/[^"\']+)["\']'),
    re.compile(r'(?:router\.(?:push|replace)|redirect)\(["\'](/[^"\']+)["\']'),
]
for path in APP.rglob("*.tsx"):
    text = path.read_text(errors="ignore")
    for pattern in patterns:
        for match in pattern.finditer(text):
            target = match.group(1).split("?")[0].split("#")[0].rstrip("/") or "/"
            if target.startswith("/api/") or target.startswith("/_next/"):
                continue
            refs.setdefault(target, set()).add(str(path.relative_to(ROOT)))

missing = []
for target, files in sorted(refs.items()):
    exact = target in page_routes
    dynamic = any("[" in route and target.startswith(route.split("[")[0].rstrip("/")) for route in page_routes)
    if not exact and not dynamic:
        missing.append((target, sorted(files)))

print("PAGE_ROUTES")
for route in sorted(page_routes):
    print(route)
print("\nREFERENCED_MISSING_ROUTES")
if not missing:
    print("NONE")
else:
    for target, files in missing:
        print(target)
        for file in files:
            print(f"  - {file}")
