import requests

SUPABASE_URL = "https://vczmygfrsmxzkyzzckfu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
}

user_id = "user_20a9c1bbc07a4846"

print("=" * 60)
print("VERIFICACAO FINAL DO SUPABASE")
print("=" * 60)

# Notas
print("\n1. NOTAS:")
response = requests.get(f"{SUPABASE_URL}/rest/v1/notes?userId=eq.{user_id}", headers=headers)
if response.status_code == 200:
    data = response.json()
    print(f"   Total: {len(data)} notas")
    for note in data:
        print(f"   - {note.get('title', 'Sem titulo')} | fav={note.get('isFavorite')} | pin={note.get('isPinned')}")

# Notas favoritas
print("\n2. NOTAS FAVORITAS:")
response = requests.get(f"{SUPABASE_URL}/rest/v1/notes?userId=eq.{user_id}&isFavorite=eq.true", headers=headers)
if response.status_code == 200:
    data = response.json()
    print(f"   Total: {len(data)} notas favoritas")
    for note in data:
        print(f"   - {note.get('title', 'Sem titulo')}")

# Links favoritos
print("\n3. LINKS FAVORITOS:")
response = requests.get(f"{SUPABASE_URL}/rest/v1/links?userId=eq.{user_id}&isFavorite=eq.true", headers=headers)
if response.status_code == 200:
    data = response.json()
    print(f"   Total: {len(data)} links favoritos")

print("\n" + "=" * 60)
print("VERIFICACAO COMPLETA!")
print("=" * 60)
