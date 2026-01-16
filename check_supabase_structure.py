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

print("=" * 60)
print("🔍 VERIFICAÇÃO COMPLETA DO SUPABASE")
print("=" * 60)

# 1. Verificar estrutura da tabela NOTES
print("\n📋 TABELA: notes")
print("-" * 40)
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/notes?limit=1",
    headers=headers
)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    if data:
        print(f"✅ Tabela existe!")
        print(f"Colunas: {list(data[0].keys())}")
        print(f"\nExemplo de registo:")
        print(json.dumps(data[0], indent=2, default=str))
    else:
        print("⚠️ Tabela existe mas está vazia")
        # Tentar inserir para ver a estrutura
        print("\n🧪 A tentar inserir uma nota de teste...")
elif response.status_code == 404:
    print("❌ Tabela NÃO existe!")
else:
    print(f"❌ Erro: {response.text}")

# 2. Verificar estrutura da tabela LINKS (para comparar)
print("\n📋 TABELA: links")
print("-" * 40)
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/links?limit=1",
    headers=headers
)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    if data:
        print(f"✅ Tabela existe!")
        print(f"Colunas: {list(data[0].keys())}")
    else:
        print("⚠️ Tabela existe mas está vazia")

# 3. Testar INSERT em notes
print("\n" + "=" * 60)
print("🧪 TESTE DE INSERT NA TABELA NOTES")
print("=" * 60)

from datetime import datetime
timestamp = int(datetime.now().timestamp())

test_note = {
    "id": f"test_check_{timestamp}",
    "userId": "test_user_check",
    "title": "Teste de verificação",
    "content": "Conteúdo de teste",
    "color": "default",
    "isPinned": False,
    "isFavorite": True,
    "createdAt": datetime.now().isoformat(),
    "updatedAt": datetime.now().isoformat()
}

print(f"\nA tentar inserir:")
print(json.dumps(test_note, indent=2))

response = requests.post(
    f"{SUPABASE_URL}/rest/v1/notes",
    headers=headers,
    json=test_note
)

print(f"\nStatus: {response.status_code}")
if response.status_code == 201:
    print("✅ INSERT bem sucedido!")
    result = response.json()
    print(f"Resultado: {json.dumps(result, indent=2, default=str)}")
    
    # Limpar
    requests.delete(
        f"{SUPABASE_URL}/rest/v1/notes?id=eq.{test_note['id']}",
        headers=headers
    )
    print("🧹 Nota de teste apagada")
else:
    print(f"❌ Erro no INSERT:")
    print(response.text)
    
# 4. Verificar se há notas do utilizador real
print("\n" + "=" * 60)
print("👤 NOTAS DE UTILIZADORES REAIS")
print("=" * 60)

response = requests.get(
    f"{SUPABASE_URL}/rest/v1/notes?select=id,userId,title,isFavorite,isPinned&limit=10",
    headers=headers
)
if response.status_code == 200:
    data = response.json()
    print(f"Total de notas encontradas: {len(data)}")
    for note in data:
        print(f"  - [{note.get('userId', 'N/A')[:20]}] {note.get('title', 'Sem título')[:30]} | fav={note.get('isFavorite')} pin={note.get('isPinned')}")

print("\n" + "=" * 60)
