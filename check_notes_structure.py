import requests

SUPABASE_URL = "https://vczmygfrsmxzkyzzckfu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
}

# Check notes with isFavorite = true
print("🔍 Notas com isFavorite=true:")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/notes?isFavorite=eq.true&limit=5",
    headers=headers
)
if response.status_code == 200:
    data = response.json()
    print(f"   Encontradas: {len(data)} notas favoritas")
    if data:
        print(f"   Campos: {list(data[0].keys())}")
        for note in data:
            print(f"   - {note.get('title', 'Sem título')}: isFavorite={note.get('isFavorite')}")
else:
    print(f"   Erro: {response.status_code}")

# Check links/clipboard with isFavorite = true
print("\n🔍 Links/Clipboard com isFavorite=true:")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/links?isFavorite=eq.true&limit=5",
    headers=headers
)
if response.status_code == 200:
    data = response.json()
    print(f"   Encontrados: {len(data)} items favoritos")
    if data:
        print(f"   Campos: {list(data[0].keys())}")
        for item in data:
            print(f"   - [{item.get('contentType')}] {item.get('title', item.get('content', '')[:30])}: isFavorite={item.get('isFavorite')}")
