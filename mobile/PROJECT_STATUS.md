# 📱 Memor.ia - ESTADO COMPLETO DO PROJETO
## Última Atualização: Janeiro 2025

---

# ⚠️ INSTRUÇÕES CRÍTICAS PARA NOVAS SESSÕES

## ANTES DE COMEÇAR QUALQUER TRABALHO:
```bash
cd C:\Projetos\Memor.ia
git checkout -- mobile/assets/
git pull
```

## NUNCA FAZER:
- ❌ Reverter código para versões anteriores
- ❌ Usar DEMO_USER
- ❌ Criar CustomTabBar
- ❌ Adicionar Settings como 5º tab
- ❌ Usar campo `reminder` (objeto) no Supabase
- ❌ Usar npm (sempre YARN)
- ❌ Modificar assets sem nova build
- ❌ Adicionar lembretes/notificações (removido - causava erros Supabase)
- ❌ Adicionar resumo semanal (removido)

---

# 🏗️ ARQUITETURA DE NAVEGAÇÃO

```
Stack.Navigator (raiz)
│
├── MainTabs (Tab.Navigator) ─── 4 TABS APENAS
│   ├── Links      → LinksScreen.js
│   ├── Clipboard  → ClipboardScreen.js
│   ├── Notas      → NotesScreen.js
│   └── Favoritos  → FavoritesScreen.js
│
└── Settings → SettingsScreen.js
    └── Acesso via ícone ⚙️ no CustomHeader (FORA do Tab.Navigator)
```

---

# 🖼️ ASSETS (Atualizados Janeiro 2025)

**Localização:** `/app/mobile/assets/`

| Ficheiro | Descrição |
|----------|-----------|
| `icon.png` | Ícone principal (logo azul novo) |
| `adaptive-icon.png` | Ícone Android (logo azul novo) |
| `splash.png` | Tela de splash (logo azul novo) - ATUALIZADO |
| `favicon.ico` | Favicon |
| `favicon.png` | Favicon PNG |

**⚠️ IMPORTANTE:** Assets só mudam com NOVA BUILD (hot reload não atualiza)

---

# ✅ FUNCIONALIDADES IMPLEMENTADAS

## 1. Autenticação
- **SEM login/password**
- Usa ID único do dispositivo
- Ficheiro: `/app/mobile/src/lib/userManager.js`
- Chave AsyncStorage: `@memoria_user_id`

## 2. LinksScreen.js
- ✅ Adicionar links (modal completo)
- ✅ Editar, eliminar, copiar
- ✅ Favoritos e Pin (fixar no topo)
- ✅ Pastas (criar, mover, eliminar)
- ✅ Criar pasta no modal "Mover para" (auto-seleciona)
- ✅ Pesquisa
- ✅ Teclado desaparece ao tocar fora
- ✅ Modais fecham ao tocar fora
- ✅ Permite guardar só com título OU só com URL
- ✅ Não mostra data
- ❌ REMOVIDO: Lembretes (causava erro Supabase "reminderAt column not found")

## 3. ClipboardScreen.js
- ✅ Colar texto manual
- ✅ **Captura Inteligente** (2 min) - guarda CADA texto como entrada separada
- ✅ Usa Set para evitar duplicados (por conteúdo)
- ✅ Cada entrada tem ID único e timestamp próprio
- ✅ Entradas são ACUMULADAS, não substituídas
- ✅ Verificação de duplicados antes de adicionar ao estado local
- ✅ Favoritos e Pin
- ✅ Pastas (criar, mover)
- ✅ Criar pasta no modal "Mover para" (auto-seleciona)
- ✅ Pesquisa (limpa ao perder foco)
- ✅ Cards compactos (sem data)
- ✅ numberOfLines={2}

## 4. NotesScreen.js
- ✅ Criar, editar, eliminar notas
- ✅ Cores personalizadas
- ✅ Favoritos e Pin
- ✅ Armazenamento LOCAL (AsyncStorage)
- ✅ Pesquisa
- ✅ Permite guardar só com título OU só com conteúdo
- ✅ Mostra data de criação
- ❌ REMOVIDO: Lembretes

## 5. FavoritesScreen.js
- ✅ Mostra todos os favoritos (links, notas, clipboard)
- ✅ Filtros por tipo
- ✅ Pesquisa

## 6. SettingsScreen.js
- ✅ Seleção de idioma (6 idiomas)
- ✅ Premium / Código de ativação
- ✅ Backup Cloud simplificado (1 alerta apenas)
- ✅ Links legais discretos (sem ícones)
- ❌ REMOVIDO: Resumo semanal (causava problemas)
- ❌ REMOVIDO: Backup manual

## 7. Notificações
- ❌ **COMPLETAMENTE REMOVIDO** - Causava erros com Supabase
- Não há lembretes em Links
- Não há lembretes em Notas
- Não há Resumo Semanal

## 8. UX Global
- ✅ Teclado desaparece ao tocar fora (todas as telas)
- ✅ Modais fecham ao tocar fora + fecham teclado
- ✅ `keyboardShouldPersistTaps="handled"` em listas
- ✅ Toast notifications mais rápidas (1.5 segundos)

---

# 🌐 TRADUÇÕES (6 Idiomas)

**Ficheiro:** `/app/mobile/src/lib/i18n.js`

| Idioma | Código | Tabs | Smart Clipboard |
|--------|--------|------|-----------------|
| 🇬🇧 English | en | Links, Clipboard, Notes, Favorites | Smart Capture |
| 🇵🇹 Português | pt | Links, Clipboard, Notas, Favoritos | Captura Inteligente |
| 🇪🇸 Español | es | Enlaces, Portapapeles, Notas, Favoritos | Captura Inteligente |
| 🇫🇷 Français | fr | Liens, Presse-papiers, Notes, Favoris | Capture Intelligente |
| 🇩🇪 Deutsch | de | Links, Zwischenablage, Notizen, Favoriten | Intelligente Erfassung |
| 🇮🇹 Italiano | it | Link, Appunti, Note, Preferiti | Cattura Intelligente |

**Botões:** Ativar/Desativar traduzidos corretamente (não Iniciar/Parar)

---

# 💾 ARMAZENAMENTO

## Supabase (Cloud)
| Tabela | Campos Importantes |
|--------|-------------------|
| `links` | id, userId, url, title, contentType, isFavorite, isPinned, folderId, createdAt |
| `folders` | id, userId, name, icon, isDefault, folderType, createdAt |

**⚠️ NOTA:** Campo `reminderAt` NÃO existe na tabela - não usar!

## AsyncStorage (Local)
| Chave | Descrição |
|-------|-----------|
| `@memoria_user_id` | ID único do dispositivo |
| `memoria-notes-{userId}` | Notas do utilizador |
| `memoria-cloud-backup-enabled` | Preferência backup |
| `memoria-premium` | Status premium |
| `memoria-language` | Idioma selecionado |

---

# 🔗 URLS OFICIAIS

| Tipo | URL |
|------|-----|
| Terms of Service | `https://www.notion.so/Terms-of-Service-Memor-ia-2e3f9fe156fc80fc8c5bf9f9f9f008e1` |
| Privacy Policy | `https://www.notion.so/Privacy-Policy-Memor-ia-2e3f9fe156fc80edb1d2e6d0bd5f91e7` |
| GitHub | `https://github.com/VL-Sec/Memor.ia` |

---

# 📦 DEPENDÊNCIAS

```json
{
  "expo": "~54.0.0",
  "react": "19.x",
  "react-native": "0.76.x",
  "@react-navigation/native": "^7.x",
  "@react-navigation/bottom-tabs": "^7.x",
  "@react-navigation/native-stack": "^7.x",
  "@react-native-async-storage/async-storage": "2.1.x",
  "react-native-toast-message": "^2.x",
  "@supabase/supabase-js": "^2.x"
}
```

**Package Manager:** YARN (nunca npm)

---

# 🔧 COMANDOS

## Atualizar do GitHub
```bash
cd C:\Projetos\Memor.ia
git checkout -- mobile/assets/
git pull
```

## Desenvolvimento
```bash
cd mobile
npx expo start --dev-client --clear
```

## Build Android Preview (APK standalone)
```bash
cd C:\Projetos\Memor.ia\mobile
eas build --platform android --profile preview
```

## Build Android Development (hot reload)
```bash
cd C:\Projetos\Memor.ia\mobile
eas build --platform android --profile development
```

## Build iOS
```bash
cd C:\Projetos\Memor.ia\mobile
eas build --platform ios --profile preview
```

---

# 🚫 PROBLEMAS RESOLVIDOS (NÃO REINTRODUZIR)

| Problema | Solução Aplicada |
|----------|------------------|
| DEMO_USER | userId único por dispositivo |
| CustomTabBar | Tab bar padrão React Navigation |
| Settings no Tab.Navigator | Settings no Stack (acesso via ⚙️) |
| Badge "Geral" nos itens | Removida completamente |
| Backup manual | Apenas backup cloud |
| expo-crypto | UUID puro JavaScript |
| Teclado não desaparece | TouchableWithoutFeedback + Keyboard.dismiss |
| Erro Supabase "reminder" | **REMOVIDO lembretes completamente** |
| Erro Supabase "reminderAt" | **REMOVIDO lembretes completamente** |
| Smart Clipboard sobrescreve | Cada entrada com ID único + Set + verificação duplicados |
| Cards Clipboard grandes | Compactados, numberOfLines={2}, sem data |
| Segundo alert backup | Removido |
| Links legais com ícones | Discretos, só texto |
| Resumo semanal | **REMOVIDO completamente** |
| Toast muito lento | Reduzido para 1.5 segundos |

---

# 📋 ESTRUTURA DE FICHEIROS

```
/app/mobile/
├── App.js                 # Navegação principal + Toast config (1.5s)
├── app.json               # Config Expo
├── package.json           # Dependências
├── PROJECT_STATUS.md      # Este ficheiro
├── assets/
│   ├── icon.png           # Logo novo
│   ├── adaptive-icon.png  # Logo Android
│   ├── splash.png         # Splash screen (ATUALIZADO)
│   ├── favicon.ico
│   └── favicon.png
└── src/
    ├── components/
    │   └── CustomHeader.js
    ├── lib/
    │   ├── i18n.js        # Traduções (6 idiomas)
    │   ├── premium.js     # Lógica premium
    │   ├── supabase.js    # Cliente Supabase
    │   └── userManager.js # ID único dispositivo
    └── screens/
        ├── LinksScreen.js      # SEM lembretes
        ├── ClipboardScreen.js
        ├── NotesScreen.js      # SEM lembretes
        ├── FavoritesScreen.js
        └── SettingsScreen.js   # SEM resumo semanal
```

---

# 📝 NOTAS TÉCNICAS

## Smart Clipboard (Captura Inteligente) - LÓGICA SIMPLIFICADA
- **Abordagem:** Event-driven, NÃO content-driven
- **Sem Set de deduplicação** - cada mudança no clipboard = nova entrada
- Verifica a cada **1 segundo** se o valor do clipboard MUDOU
- Se mudou → guarda como nova entrada (com ID e timestamp únicos)
- Se não mudou → ignora (mesmo valor = nenhum novo evento de cópia)
- **Limitação técnica:** Se o utilizador copiar o mesmo texto 2x seguidas, só a primeira é detetada (o clipboard do sistema não dispara eventos, só podemos ler o valor atual)
- **Fluxo:**
  1. Ativar → lê clipboard atual como `lastClipboardContent`
  2. A cada 1s: lê clipboard
  3. Se diferente de `lastClipboardContent` → nova entrada
  4. Atualiza `lastClipboardContent`
  5. Toast de confirmação

## Modais
- Todos têm `TouchableWithoutFeedback` no overlay
- Ao tocar fora: fecha modal + `Keyboard.dismiss()`
- Conteúdo interno tem `onPress={Keyboard.dismiss}`

## Toast Notifications
- Tempo de visibilidade: **1.5 segundos** (era 3 segundos)
- Configurado em `App.js`: `visibilityTime={1500}`

## Tab Bar
- Usa traduções dinâmicas: `t.tabLinks`, `t.tabClipboard`, `t.tabNotes`, `t.tabFavorites`
- `tabBarItemStyle: { flex: 1 }` para distribuição uniforme

---

# ✅ ESTADO ATUAL

**Data:** Janeiro 2025
**Estado:** ✅ Funcional e Estável
**Pronto para:** Build de produção

---

# 🎯 CORREÇÕES APLICADAS (Janeiro 2025 - Sessão Atual)

1. ✅ Tab Bar com traduções dinâmicas (`t.tabLinks`, `t.tabNotes`, etc.)
2. ✅ Tab Bar com `tabBarItemStyle: { flex: 1 }` para distribuição uniforme
3. ✅ Novo splash.png atualizado
4. ✅ **REMOVIDO todos os lembretes** (Links e Notas) - erro Supabase
5. ✅ **REMOVIDO resumo semanal** - causava problemas
6. ✅ Teclado desaparece ao tocar fora em LinksScreen
7. ✅ Toast notifications mais rápidas (1.5s em vez de 3s)
8. ✅ **Search bar limpa automaticamente ao perder foco** (todas as telas)
9. ✅ **Smart Clipboard SIMPLIFICADO - Event-driven:**
   - REMOVIDO Set de deduplicação
   - Cada MUDANÇA no clipboard = nova entrada
   - Sem bloqueio por conteúdo repetido
   - ID único + timestamp para cada entrada

---

# 📋 PRÓXIMOS PASSOS

1. Testes em dispositivos iOS
2. Publicação nas stores

---

**FIM DO DOCUMENTO - GUARDAR SEMPRE ESTA INFORMAÇÃO**
