import requests
from datetime import datetime

SUPABASE_URL = "https://vczmygfrsmxzkyzzckfu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Dois userIds encontrados
user_ids = ["user_20a9c1bbc07a4846", "user_76f9dbc4798f416a"]

print("=" * 60)
print("CRIAR NOTAS DE TESTE PARA AMBOS OS UTILIZADORES")
print("=" * 60)

timestamp = int(datetime.now().timestamp())

for user_id in user_ids:
    print(f"\nCriar nota para: {user_id}")
    
    test_note = {
        "id": f"test_{user_id}_{timestamp}",
        "userId": user_id,
        "title": f"TESTE - {user_id[-8:]}",
        "content": "Se ves esta nota, o carregamento funciona!",
        "color": "green",
        "isPinned": False,
        "isFavorite": True,
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat()
    }
    
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/notes",
        headers=headers,
        json=test_note
    )
    
    if response.status_code == 201:
        print(f"   OK - Nota criada: {test_note['title']}")
    else:
        print(f"   ERRO: {response.text}")

print("\n" + "=" * 60)
print("TODAS AS NOTAS NO SUPABASE AGORA:")
print("=" * 60)

response = requests.get(
    f"{SUPABASE_URL}/rest/v1/notes?select=id,userId,title,isFavorite",
    headers=headers
)
if response.status_code == 200:
    data = response.json()
    print(f"Total: {len(data)} notas\n")
    for note in data:
        uid = note.get('userId', 'N/A')
        title = note.get('title', 'Sem titulo')
        fav = note.get('isFavorite', False)
        nid = note.get('id', 'N/A')
        print(f"   User: {uid}")
        print(f"   Title: {title}")
        print(f"   ID: {nid}")
        print(f"   Favorito: {fav}")
        print()
