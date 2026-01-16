import requests

SUPABASE_URL = "https://vczmygfrsmxzkyzzckfu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
}

user_id = "user_20a9c1bbc07a4846"

print("TESTE DE ACESSO - MESMA QUERY QUE A APP FAZ")
print("=" * 60)

# Teste 1: Query simples à tabela notes
print("\n1. SELECT * FROM notes WHERE userId = ...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/notes?select=*&userId=eq.{user_id}&order=createdAt.desc",
    headers=headers
)
print(f"   Status: {response.status_code}")
print(f"   Resultado: {len(response.json())} notas")
if response.json():
    for n in response.json():
        print(f"      - {n.get('title')}")

# Teste 2: Query simples à tabela links
print("\n2. SELECT * FROM links WHERE userId = ...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/links?select=*&userId=eq.{user_id}&order=createdAt.desc&limit=3",
    headers=headers
)
print(f"   Status: {response.status_code}")
print(f"   Resultado: {len(response.json())} links")
if response.json():
    for l in response.json()[:3]:
        print(f"      - {l.get('title', l.get('url', 'N/A'))}")

print("\n" + "=" * 60)
print("Se ambos devolvem dados, o problema NAO e RLS")
