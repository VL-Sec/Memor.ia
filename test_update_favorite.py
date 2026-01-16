import requests
import json

SUPABASE_URL = "https://vczmygfrsmxzkyzzckfu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

note_id = "1768427325004_2vc7i83zg"

# Try to update isFavorite to true
print(f"🔄 Tentando atualizar isFavorite para true...")
response = requests.patch(
    f"{SUPABASE_URL}/rest/v1/notes?id=eq.{note_id}",
    headers=headers,
    json={"isFavorite": True}
)

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    data = response.json()
    if data:
        print(f"✅ Atualizado! isFavorite = {data[0].get('isFavorite')}")
    else:
        print("⚠️ Resposta vazia - pode ser problema de RLS")
else:
    print(f"❌ Erro ao atualizar")

# Verify by reading the note again
print(f"\n🔍 Verificando valor após update...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/notes?id=eq.{note_id}",
    headers=headers
)
if response.status_code == 200:
    data = response.json()
    if data:
        print(f"📋 isFavorite atual: {data[0].get('isFavorite')}")
