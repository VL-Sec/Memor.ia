print("=" * 60)
print("📊 COMPARAÇÃO: Código vs Supabase")
print("=" * 60)

# O que o código NotesScreen.js usa (handleSaveNote)
codigo_usa = {
    "id": "generateId()",
    "userId": "userId (prop)",
    "title": "noteTitle.trim()",
    "content": "noteContent.trim()",
    "color": "noteColor",
    "isPinned": "false",
    "isFavorite": "false", 
    "createdAt": "new Date().toISOString()",
    "updatedAt": "new Date().toISOString()"
}

# O que a tabela Supabase tem
supabase_tem = [
    "id",
    "userId",  # com aspas no SQL: "userId"
    "title",
    "content", 
    "color",
    "isPinned",  # com aspas no SQL: "isPinned"
    "isFavorite",  # com aspas no SQL: "isFavorite"
    "reminderDate",
    "notificationId",
    "createdAt",  # com aspas no SQL: "createdAt"
    "updatedAt"   # com aspas no SQL: "updatedAt"
]

print("\n🔵 O que o CÓDIGO envia:")
for k, v in codigo_usa.items():
    print(f"   {k}: {v}")

print("\n🟢 O que a TABELA tem:")
for col in supabase_tem:
    print(f"   {col}")

print("\n" + "=" * 60)
print("⚠️  POTENCIAL PROBLEMA:")
print("=" * 60)
print("""
No SQL que criaste, usaste aspas nos nomes das colunas:
  "userId", "isPinned", "isFavorite", "createdAt", "updatedAt"

Isso significa que o PostgreSQL guarda os nomes EXATAMENTE assim,
com case-sensitivity.

O código JavaScript usa:
  userId, isPinned, isFavorite, createdAt, updatedAt (sem aspas)

Isto PODE causar problemas se houver mismatch.

SOLUÇÃO: Verificar se os nomes batem certo.
""")
