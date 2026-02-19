import requests
import json

# ข้อมูลจาก Google Sheets
GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwvSDRK2Qj8ONEAoAYKR0hD5IxLVN3KyZLLuDlgU5X71NHZZeKk7UaxPkDoY8mQNfuZSQ/exec"
SUPABASE_URL = "https://qpnparzjhrffzjxrejrn.supabase.co/rest/v1/shopee_accounts"
SUPABASE_KEY = "sb_publishable_oFfSgcKD0WFt8vSlMrLMRw_-4TvCSHO"

print("Fetching data from Google Sheets...")
response = requests.get(GOOGLE_SHEET_URL)
data = response.json()

if not isinstance(data, list):
    print("No data found or invalid format.")
    exit()

print(f"Found {len(data)} accounts. Migrating to Supabase...")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

# บันทึกลง Supabase (Upsert)
response = requests.post(SUPABASE_URL, headers=headers, data=json.dumps(data))

if response.status_code in [200, 201]:
    print("Migration successful!")
else:
    print(f"Migration failed: {response.status_code}")
    print(response.text)
