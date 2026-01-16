import requests
import json

SUPABASE_URL = "https://vczmygfrsmxzkyzzckfu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json"
}

# Check table structure
print("🔍 Verificando estrutura da tabela notes...")
response = requests.get(
    f"{SUPABASE_URL}/rest/v1/notes?limit=1",
    headers=headers
)

if response.status_code == 200:
    data = response.json()
    if data:
        print(f"✅ Colunas encontradas: {list(data[0].keys())}")
        print(f"📋 Exemplo de nota: {json.dumps(data[0], indent=2)}")
    else:
        print("⚠️ Tabela vazia")
else:
    print(f"❌ Erro: {response.status_code} - {response.text}")
