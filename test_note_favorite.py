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

# 1. Criar uma nota de teste
print("=" * 50)
print("📝 TESTE COMPLETO DE NOTAS + FAVORITOS")
print("=" * 50)

timestamp = int(datetime.now().timestamp())
test_note = {
    "id": f"test_{timestamp}",
    "userId": "test_user_emergent",
    "title": "Nota de Teste Emergent",
    "content": "Esta é uma nota de teste para verificar favoritos",
    "color": "blue",
    "isPinned": False,
    "isFavorite": False,
    "createdAt": datetime.now().isoformat(),
    "updatedAt": datetime.now().isoformat()
}

print(f"\n1️⃣ Criar nota de teste...")
response = requests.post(
    f"{SUPABASE_URL}/rest/v1/notes",
    headers=headers,
    json=test_note
)
if response.status_code == 201:
    print(f"   ✅ Nota criada: {test_note['title']}")
    print(f"   ID: {test_note['id']}")
else:
    print(f"   ❌ Erro: {response.status_code} - {response.text}")

# 2. Verificar que isFavorite = false
print(f"\n2️⃣ Verificar estado inicial (isFavorite=false)...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/notes?id=eq.{test_note['id']}",
    headers=headers
)
if response.status_code == 200:
    data = response.json()
    if data:
        print(f"   isFavorite = {data[0]['isFavorite']}")

# 3. Atualizar para favorito (isFavorite = true)
print(f"\n3️⃣ Marcar como favorito (isFavorite=true)...")
response = requests.patch(
    f"{SUPABASE_URL}/rest/v1/notes?id=eq.{test_note['id']}",
    headers=headers,
    json={"isFavorite": True}
)
if response.status_code == 200:
    data = response.json()
    if data:
        print(f"   ✅ Atualizado! isFavorite = {data[0]['isFavorite']}")
    else:
        print(f"   ⚠️ Resposta vazia")
else:
    print(f"   ❌ Erro: {response.status_code} - {response.text}")

# 4. Buscar todas as notas favoritas
print(f"\n4️⃣ Buscar TODAS as notas com isFavorite=true...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/notes?isFavorite=eq.true",
    headers=headers
)
if response.status_code == 200:
    data = response.json()
    print(f"   📋 Total de notas favoritas: {len(data)}")
    for note in data:
        print(f"      - [{note['id'][:20]}...] {note['title']} | isFavorite={note['isFavorite']}")
else:
    print(f"   ❌ Erro: {response.status_code}")

# 5. Limpar - apagar nota de teste
print(f"\n5️⃣ Limpar nota de teste...")
response = requests.delete(
    f"{SUPABASE_URL}/rest/v1/notes?id=eq.{test_note['id']}",
    headers=headers
)
if response.status_code in [200, 204]:
    print(f"   ✅ Nota de teste apagada")
else:
    print(f"   ❌ Erro ao apagar: {response.status_code}")

print("\n" + "=" * 50)
print("✅ TESTE CONCLUÍDO")
print("=" * 50)
