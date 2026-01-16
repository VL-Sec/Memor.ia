import requests

SUPABASE_URL = "https://vczmygfrsmxzkyzzckfu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
}

user_id = "user_20a9c1bbc07a4846"

print(f"NOTAS DO UTILIZADOR: {user_id}")
print("=" * 60)

response = requests.get(
    f"{SUPABASE_URL}/rest/v1/notes?userId=eq.{user_id}&select=*",
    headers=headers
)

if response.status_code == 200:
    data = response.json()
    print(f"Total: {len(data)} notas\n")
    for note in data:
        print(f"  Title: {note.get('title')}")
        print(f"  ID: {note.get('id')}")
        print(f"  isFavorite: {note.get('isFavorite')}")
        print(f"  color: {note.get('color')}")
        print()
else:
    print(f"ERRO: {response.status_code} - {response.text}")
