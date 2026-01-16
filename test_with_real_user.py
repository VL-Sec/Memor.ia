import requests
import json
from datetime import datetime

SUPABASE_URL = "https://vczmygfrsmxzkyzzckfu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

print("=" * 60)
print("🔍 VERIFICAR userIds EXISTENTES")
print("=" * 60)

# Ver todos os userIds únicos na tabela links
print("\n📋 userIds na tabela LINKS:")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/links?select=userId&limit=10",
    headers=headers
)
if response.status_code == 200:
    data = response.json()
    user_ids = set(item['userId'] for item in data if item.get('userId'))
    for uid in user_ids:
        print(f"   - {uid}")
    
    if user_ids:
        # Usar o primeiro userId real
        real_user_id = list(user_ids)[0]
        print(f"\n🎯 Usar userId real: {real_user_id}")
        
        # Criar uma nota de teste com esse userId
        print("\n📝 Criar nota de teste com userId real...")
        timestamp = int(datetime.now().timestamp())
        test_note = {
            "id": f"real_test_{timestamp}",
            "userId": real_user_id,
            "title": "🧪 Nota de Teste Real",
            "content": "Esta nota foi criada para testar se aparece na app",
            "color": "blue",
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
            print(f"   ✅ Nota criada com sucesso!")
            print(f"   ID: {test_note['id']}")
            print(f"   Title: {test_note['title']}")
            print(f"   isFavorite: {test_note['isFavorite']}")
            print(f"\n   ⚠️  AGORA VAI À APP E VERIFICA:")
            print(f"   1. Menu Notas - deve aparecer '🧪 Nota de Teste Real'")
            print(f"   2. Menu Favoritos - deve aparecer também")
        else:
            print(f"   ❌ Erro: {response.status_code}")
            print(f"   {response.text}")

# Verificar notas existentes
print("\n" + "=" * 60)
print("📋 TODAS AS NOTAS NO SUPABASE:")
print("=" * 60)
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/notes?select=*",
    headers=headers
)
if response.status_code == 200:
    data = response.json()
    print(f"Total: {len(data)} notas")
    for note in data:
        print(f"   [{note.get('userId', 'N/A')[:15]}...] {note.get('title', 'Sem título')[:30]} | fav={note.get('isFavorite')}")
