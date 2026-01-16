import requests

SUPABASE_URL = "https://vczmygfrsmxzkyzzckfu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
}

# Check links table for clipboard items (contentType = 'text')
print("CLIPBOARD (tabela 'links' com contentType='text'):")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/links?contentType=eq.text&limit=5",
    headers=headers
)
if response.status_code == 200:
    data = response.json()
    print(f"Total: {len(data)} itens")
    for item in data:
        print(f"  - {item.get('title', item.get('content', 'N/A')[:30])}")
else:
    print(f"Erro: {response.status_code}")
