"""Quick API integration test suite for Stratify AI backend."""
import requests, json, sys

BASE = "http://localhost:8080/api"
passed = 0
failed = 0

def test(name, method, path, expected_status, body=None, check_fn=None):
    global passed, failed
    url = f"{BASE}{path}"
    try:
        if method == "GET":
            r = requests.get(url)
        elif method == "POST":
            r = requests.post(url, json=body)
        elif method == "PUT":
            r = requests.put(url, json=body)
        elif method == "DELETE":
            r = requests.delete(url)
        
        status_ok = r.status_code == expected_status
        data = r.json() if r.text else None
        check_ok = True
        check_msg = ""
        
        if check_fn and data:
            check_ok, check_msg = check_fn(data)
        
        if status_ok and check_ok:
            print(f"  ✅ PASS: {name}  (HTTP {r.status_code})")
            passed += 1
        else:
            print(f"  ❌ FAIL: {name}  (HTTP {r.status_code}, expected {expected_status}) {check_msg}")
            if data: print(f"         Response: {json.dumps(data, indent=None)[:200]}")
            failed += 1
    except Exception as e:
        print(f"  ❌ ERROR: {name}  ({e})")
        failed += 1

# ===== Tests =====
print("\n🔬 Stratify AI — Backend API Test Suite\n" + "="*50)

# 1. Health
test("Health check", "GET", "/health", 200,
     check_fn=lambda d: (d.get("status") == "ok", ""))

# 2. Empty projects
test("Projects (empty)", "GET", "/projects", 200,
     check_fn=lambda d: (isinstance(d, list) and len(d) == 0, f"Expected [], got {len(d)} items"))

# 3. Empty stats
test("Stats (empty)", "GET", "/projects/stats", 200,
     check_fn=lambda d: (d.get("total") == 0 and d.get("active") == 0, ""))

# 4. Empty recent activity
test("Recent activity (empty)", "GET", "/projects/recent-activity", 200,
     check_fn=lambda d: (isinstance(d, list) and len(d) == 0, ""))

# 5. Create project
proj_body = {
    "clientName": "Test Client",
    "company": "Test Corp",
    "email": "test@corp.com",
    "status": "active",
    "requirements": {
        "objective": "Build a web app",
        "features": ["Auth", "Dashboard"],
        "budgetRange": "$10,000-$20,000",
        "timeline": "2 months"
    }
}
test("Create project", "POST", "/projects", 201, body=proj_body,
     check_fn=lambda d: (d.get("clientName") == "Test Client", f"Got {d.get('clientName')}"))

# Get the created project ID
r = requests.get(f"{BASE}/projects")
projects = r.json()
if projects:
    proj_id = projects[0]["id"]
    
    # 6. Get project by ID
    test("Get project by ID", "GET", f"/projects/{proj_id}", 200,
         check_fn=lambda d: (d.get("company") == "Test Corp", ""))
    
    # 7. Stats after create
    test("Stats after create", "GET", "/projects/stats", 200,
         check_fn=lambda d: (d.get("total") == 1 and d.get("active") == 1, f"Got {d}"))
    
    # 8. Update project
    test("Update project", "PUT", f"/projects/{proj_id}", 200,
         body={"status": "completed"},
         check_fn=lambda d: (d.get("status") == "completed", f"Got {d.get('status')}"))
    
    # 9. Add activity
    test("Add activity", "POST", f"/projects/{proj_id}/activity", 201,
         body={"type": "status_change", "message": "Completed", "agent": "orchestrator"})
    
    # 10. Add scope entry
    test("Add scope entry", "POST", f"/projects/{proj_id}/scope", 201,
         body={"type": "in_scope", "description": "Auth module",
               "justification": "Original requirement", "impact": {"time": "0h", "cost": "$0"}})
    
    # 11. Recent activity after
    test("Recent activity after", "GET", "/projects/recent-activity", 200,
         check_fn=lambda d: (isinstance(d, list) and len(d) > 0, "Expected non-empty"))
    
    # 12. Delete project
    test("Delete project", "DELETE", f"/projects/{proj_id}", 204)
    
    # 13. Projects after delete
    test("Projects after delete", "GET", "/projects", 200,
         check_fn=lambda d: (isinstance(d, list) and len(d) == 0, f"Expected [], got {len(d)}"))
else:
    print("  ⚠️  SKIP: Could not get project ID for further tests")
    failed += 5

# 14. Project not found
test("Project 404", "GET", "/projects/nonexistent-id", 404)

# 15. Settings defaults
test("Settings defaults", "GET", "/settings", 200,
     check_fn=lambda d: ("companyName" in d and "currency" in d, ""))

# 16. Update settings
test("Update settings", "PUT", "/settings", 200,
     body={"companyName": "My Corp", "defaultRate": 150, "currency": "INR"},
     check_fn=lambda d: (d.get("companyName") == "My Corp", f"Got {d.get('companyName')}"))

# 17. Verify seed endpoint removed
r = requests.post(f"{BASE}/projects/seed")
seed_gone = r.status_code in (404, 405, 422)
if seed_gone:
    print(f"  ✅ PASS: Seed endpoint removed  (HTTP {r.status_code})")
    passed += 1
else:
    print(f"  ❌ FAIL: Seed endpoint still exists  (HTTP {r.status_code})")
    failed += 1

# 18. Frontend served from root
r = requests.get("http://localhost:8080/")
if r.status_code == 200 and "Stratify" in r.text:
    print(f"  ✅ PASS: Frontend served from /  (HTTP {r.status_code})")
    passed += 1
else:
    print(f"  ❌ FAIL: Frontend not served  (HTTP {r.status_code})")
    failed += 1

print(f"\n{'='*50}")
print(f"Results: {passed} passed, {failed} failed, {passed+failed} total")
if failed == 0:
    print("🎉 ALL TESTS PASSED!")
else:
    print(f"⚠️  {failed} test(s) failed — review above.")
sys.exit(1 if failed else 0)
