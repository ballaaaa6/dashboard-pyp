import requests
import json

SUPABASE_URL = "https://qpnparzjhrffzjxrejrn.supabase.co/rest/v1/shopee_accounts"
SUPABASE_KEY = "sb_publishable_oFfSgcKD0WFt8vSlMrLMRw_-4TvCSHO"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

print("Testing Supabase connection...")
response = requests.get(SUPABASE_URL + "?select=*", headers=headers)

if response.status_code == 200:
    data = response.json()
    print(f"Connection successful! Found {len(data)} accounts.")
    print(json.dumps(data, indent=2))
else:
    print(f"Connection failed: {response.status_code}")
    print(response.text)
