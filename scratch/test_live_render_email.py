import urllib.request
import json

url = "https://janova.onrender.com/api/auth/send-otp"
payload = {
    "email": "garvitsar21@gmail.com",
    "password": "TestPassword123!"
}

req_data = json.dumps(payload).encode('utf-8')
http_req = urllib.request.Request(
    url,
    data=req_data,
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(http_req, timeout=15) as resp:
        print("STATUS:", resp.status)
        print("RESPONSE:", resp.read().decode('utf-8'))
except urllib.error.HTTPError as he:
    print("HTTP ERROR:", he.code, he.read().decode('utf-8'))
except Exception as e:
    print("EXCEPTION:", e)
