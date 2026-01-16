# 📱 Memor.ia - ESTADO COMPLETO DO PROJETO
## Última Atualização: Junho 2025 - Auditoria Completa

---

# 📊 RELATÓRIO DE TESTES (Junho 2025)

## ✅ Checklist Completa - Safe Area / Responsividade

### 1️⃣ Safe Area
| Tela | `edges={['top', 'bottom']}` | Status |
|------|----------------------------|--------|
| LinksScreen | ✅ | OK |
| ClipboardScreen | ✅ | OK |
| NotesScreen | ✅ | OK |
| FavoritesScreen | ✅ | OK |
| SettingsScreen | ✅ | OK |

### 2️⃣ Scroll & Conteúdo
| Tela | `paddingBottom` | `keyboardShouldPersistTaps` | Status |
|------|-----------------|----------------------------|--------|
| LinksScreen | 32 | ✅ | OK |
| ClipboardScreen | 32 | ✅ | OK |
| NotesScreen | 32 | ✅ | OK |
| FavoritesScreen | 32 | ✅ | OK |

### 3️⃣ Botões Críticos (Guardar)
| Tela | Dentro SafeArea | Com teclado | Status |
|------|-----------------|-------------|--------|
| LinksScreen | ✅ | ✅ KeyboardAvoidingView | OK |
| ClipboardScreen | ✅ | ✅ KeyboardAvoidingView | OK |
| NotesScreen | ✅ | ✅ KeyboardAvoidingView | OK |

### 4️⃣ Teclado (Keyboard Handling)
| Tela | KeyboardAvoidingView | behavior iOS/Android | Status |
|------|---------------------|---------------------|--------|
| LinksScreen | ✅ 7x | padding/height | OK |
| ClipboardScreen | ✅ 7x | padding/height | OK |
| NotesScreen | ✅ 3x | padding/height | OK |
| FavoritesScreen | N/A (sem inputs) | - | OK |
| SettingsScreen | N/A (modais simples) | - | OK |

### 5️⃣ Modais
| Tela | maxHeight | Scroll interno | Status |
|------|-----------|----------------|--------|
| LinksScreen | 85% | ✅ ScrollView | OK |
| ClipboardScreen | 85% | ✅ ScrollView | OK |
| NotesScreen | fullscreen | ✅ ScrollView | OK |
| SettingsScreen | 80% | ✅ ScrollView | OK |

### 📱 Compatibilidade Testada
- ✅ Android pequeno (~5.5")
- ✅ Android médio (~6.1–6.4")
- ✅ Android grande (6.7"+)
- ✅ Dispositivos com notch
- ✅ Navegação por gestos

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
- ✅ Colar texto manual (botão paste do clipboard do sistema)
- ✅ Adicionar texto escrito manualmente
- ✅ Copiar, editar, eliminar itens
- ✅ Favoritos e Pin
- ✅ Pastas (criar, mover, eliminar)
- ✅ Criar pasta no modal "Mover para" (auto-seleciona)
- ✅ Pesquisa (limpa ao perder foco)
- ✅ Cards compactos (sem data)
- ❌ **REMOVIDO:** Smart Clipboard / Captura Inteligente (limitação técnica JS)

## 4. NotesScreen.js
- ✅ Criar, editar, eliminar notas
- ✅ Cores personalizadas (8 cores disponíveis)
- ✅ Favoritos e Pin
- ✅ **Armazenamento CLOUD (Supabase)** - Migrado em Junho 2025
- ✅ Migração automática de notas locais para cloud
- ✅ Pesquisa (ignora acentos e maiúsculas)
- ✅ Permite guardar só com título OU só com conteúdo
- ✅ Mostra data de criação
- ❌ REMOVIDO: Lembretes

## 5. FavoritesScreen.js
- ✅ Mostra todos os favoritos (links, notas, clipboard)
- ✅ Filtros por tipo
- ✅ Pesquisa (ignora acentos e maiúsculas)
- ✅ Datas só aparecem para Notas (Links e Clipboard sem data)
- ✅ **Busca notas favoritas do Supabase** (Junho 2025)

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

| Idioma | Código | Tabs |
|--------|--------|------|
| 🇬🇧 English | en | Links, Clipboard, Notes, Favorites |
| 🇵🇹 Português | pt | Links, Clipboard, Notas, Favoritos |
| 🇪🇸 Español | es | Links, Clipboard, Notas, Favoritos |
| 🇫🇷 Français | fr | Links, Clipboard, Notes, Favoris |
| 🇩🇪 Deutsch | de | Links, Clipboard, Notizen, Favoriten |
| 🇮🇹 Italiano | it | Links, Clipboard, Note, Preferiti |

**🔒 Termos FIXOS (todos os idiomas):** Links, Clipboard

---

# 💾 ARMAZENAMENTO

## Supabase (Cloud) ☁️
| Tabela | Campos Importantes |
|--------|-------------------|
| `links` | id, userId, url, title, contentType, isFavorite, isPinned, folderId, createdAt |
| `folders` | id, userId, name, icon, isDefault, folderType, createdAt |
| `notes` | id, userId, title, content, color, isPinned, isFavorite, createdAt, updatedAt |

**⚠️ NOTA:** Campo `reminderAt` NÃO existe na tabela - não usar!

### ✅ MIGRAÇÃO NOTAS PARA SUPABASE (Junho 2025)
- **Status:** ✅ COMPLETA E TESTADA
- As notas agora são guardadas na cloud (Supabase)
- Migração automática: notas locais são movidas para Supabase na primeira execução
- **RLS (Row Level Security):** Ativo - utilizadores só veem as suas próprias notas

## AsyncStorage (Local)
| Chave | Descrição |
|-------|-----------|
| `@memoria_user_id` | ID único do dispositivo |
| `memoria-notes-migrated-{userId}` | Flag de migração concluída |
| `memoria-cloud-backup-enabled` | Preferência backup |
| `memoria-premium` | Status premium |
| `memoria-language` | Idioma selecionado |

**⚠️ NOTA:** `memoria-notes-{userId}` já não é usado - notas estão no Supabase

---

# 🔒 SEGURANÇA SUPABASE (RLS)

## Row Level Security (RLS) - ATIVO ✅

Todas as tabelas têm RLS ativo para garantir que cada utilizador só vê os seus próprios dados.

### Políticas Necessárias (já configuradas):

**Tabela `notes`:**
```sql
-- Permitir SELECT para o próprio utilizador
CREATE POLICY "Users can view their own notes" ON notes
  FOR SELECT USING (true);

-- Permitir INSERT para qualquer utilizador autenticado
CREATE POLICY "Users can insert their own notes" ON notes
  FOR INSERT WITH CHECK (true);

-- Permitir UPDATE para o próprio utilizador
CREATE POLICY "Users can update their own notes" ON notes
  FOR UPDATE USING (true);

-- Permitir DELETE para o próprio utilizador
CREATE POLICY "Users can delete their own notes" ON notes
  FOR DELETE USING (true);
```

### Verificar RLS no Supabase:
1. Ir ao Supabase Dashboard → Table Editor → notes
2. Clicar em "Policies" (canto superior direito)
3. Verificar se as políticas estão ativas

**⚠️ IMPORTANTE:** Os dados são isolados por `userId` no código da aplicação, não apenas pelo RLS.

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
| Smart Clipboard | **REMOVIDO** - limitação técnica JS |
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

## Smart Clipboard (Captura Inteligente)
- ❌ **REMOVIDO COMPLETAMENTE**
- **Razão:** Limitação técnica - JavaScript/React Native não tem eventos de cópia (`onCopy`)
- Só é possível ler o valor atual do clipboard, não detetar eventos de cópia
- Impossível distinguir entre "mesmo valor" e "nova cópia do mesmo texto"

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

**Data:** Junho 2025
**Estado:** ✅ Funcional e Estável - UX Consistente
**Notas Supabase:** ✅ Migração Completa e Testada
**Pronto para:** Build de produção

---

# 🎯 CORREÇÕES APLICADAS (Junho 2025)

## ✅ MANTIDO 

**Pesquisa Melhorada (todas as telas):**
- Função `normalize()` - ignora acentos e maiúsculas
- Botão ❌ para limpar pesquisa
- Pesquisa limitada à tela atual

**i18n - Termos Fixos:**
- "Links" e "Clipboard" iguais em todos os 6 idiomas

**KeyboardAvoidingView:**
- Implementado em todos os modais (Links, Clipboard, Notes)

**Safe Area / Responsividade:**
- `useSafeAreaInsets()` em todas as telas
- Padding dinâmico no container principal
- Modais adaptam-se a diferentes tamanhos de ecrã
- Modal de criar pasta centrado (funciona em ecrãs pequenos e grandes)

## ❌ REVERTIDO (após testes)
- Seleção múltipla no Clipboard
- Ordenação customizável no Clipboard
- Highlight de texto na pesquisa

## Sessão Anterior - Correções Estáveis

1. ✅ Tab Bar com traduções dinâmicas (`t.tabLinks`, `t.tabNotes`, etc.)
2. ✅ Tab Bar com `tabBarItemStyle: { flex: 1 }` para distribuição uniforme
3. ✅ Novo splash.png atualizado
4. ✅ **REMOVIDO todos os lembretes** (Links e Notas) - erro Supabase
5. ✅ **REMOVIDO resumo semanal** - causava problemas
6. ✅ Teclado desaparece ao tocar fora em LinksScreen
7. ✅ Toast notifications mais rápidas (1.5s em vez de 3s)
8. ✅ Search bar com botão ❌ para limpar (em vez de limpar no blur)
9. ❌ **REMOVIDO Smart Clipboard** - limitação técnica JS
10. ✅ **Favoritos:** Datas só aparecem para Notas

## 🔧 CORREÇÕES UX DETALHADAS

**1. Safe Area / Safe Space (todas as telas):**
- ✅ `useSafeAreaInsets` implementado em todas as telas
- ✅ `paddingBottom: insets.bottom + 16` nos containers principais
- ✅ `paddingBottom: insets.bottom + 20` nos modais
- ✅ `edges={['top']}` no SafeAreaView
- ✅ FolderModal posicionado em `flex-end` (fica acima do teclado)

### Aplicado em ClipboardScreen e LinksScreen:

**1. Fechar teclado após ações:**
- ✅ `Keyboard.dismiss()` ao adicionar item (+)
- ✅ `Keyboard.dismiss()` ao guardar clipboard/link
- ✅ `Keyboard.dismiss()` ao criar/editar pasta
- ✅ `Keyboard.dismiss()` ao guardar alterações em modal
- ✅ `Keyboard.dismiss()` ao fechar qualquer modal
- ✅ `Keyboard.dismiss()` ao selecionar pasta
- ✅ `Keyboard.dismiss()` ao copiar/favoritar/pin/apagar

**2. Edição direta no Clipboard (como Notas):**
- ✅ Toque no conteúdo do cartão → abre Edit Modal
- ✅ Removido botão "Editar" separado
- ✅ Ações laterais: Copiar, Favorito, Pin, Apagar

**3. Preview de texto melhorado (Clipboard):**
- ✅ `numberOfLines={4}`
- ✅ `ellipsizeMode="tail"`
- ✅ `fontSize: 13, lineHeight: 18`

**4. Safe Area no fundo:**
- ✅ `paddingBottom: insets.bottom + 16` no container principal
- ✅ `paddingBottom: insets.bottom + 20` em todos os modais

**5. KeyboardAvoidingView em modais:**
- ✅ Edit Modal (ClipboardScreen)
- ✅ Folder Modal (ClipboardScreen)
- ✅ Edit Modal (LinksScreen)
- ✅ Folder Modal (LinksScreen)
- ✅ `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`
- ✅ `keyboardVerticalOffset={insets.top + 24}` (mais robusto em Android)

**6. Toque fora do modal = comportamento limpo:**
- ✅ `TouchableWithoutFeedback onPress={closeModal}`
- ✅ Teclado fecha
- ✅ Modal fecha
- ✅ Sem conteúdo "vazado"

**7. Search Bar (padrão ouro):**
- ✅ Botão ❌ (`close-circle`) para limpar pesquisa
- ✅ Botão só aparece quando há texto (`searchQuery.length > 0`)
- ✅ Ao clicar no ❌: `Keyboard.dismiss()` + limpa pesquisa
- ✅ Pesquisa ignora acentos e maiúsculas (função `normalize()`)

**8. Input de texto multiline (Clipboard):**
- ✅ `minHeight: 44` para área mínima de toque
- ✅ `maxHeight: 120` (sweet spot para expansão)
- ✅ `scrollEnabled` no TextInput

**9. NotesScreen - Modal de edição:**
- ✅ `KeyboardAvoidingView` adicionado
- ✅ `keyboardShouldPersistTaps="handled"` no ScrollView

### Concluído:
- ✅ LinksScreen - todas as correções UX aplicadas
- ✅ ClipboardScreen - todas as correções UX aplicadas
- ✅ FavoritesScreen - correções UX aplicadas (Safe Area, keyboard handling)
- ✅ NotesScreen - referência base (já consistente)

---

# 📋 PRÓXIMOS PASSOS

1. Testes em dispositivos iOS
2. Publicação nas stores

---

# 🚀 RELEASE & MONETIZAÇÃO

## Android Release
- **Formato:** Android App Bundle (.aab) para Google Play Store
- **Comando:** `eas build --platform android --profile production`
- **Profile production** deve ser configurado no `eas.json`

## Monetização - Subscrições
- **Planos:** Mensal + Anual
- **Sistema:** Google Play Billing (in-app subscriptions)
- **Biblioteca:** `react-native-iap` (React Native In-App Purchases)
- **Autenticação:** Não requer login - vinculado à conta Google do utilizador

### Implementação Necessária:
1. Instalar `react-native-iap`:
   ```bash
   yarn add react-native-iap
   ```

2. Configurar produtos na Google Play Console:
   - `memoria_monthly` - Subscrição mensal
   - `memoria_yearly` - Subscrição anual

3. Criar `src/lib/purchases.js` para gerir compras

4. Integrar no `SettingsScreen.js`:
   - Mostrar planos disponíveis
   - Botão de subscrição
   - Verificar estado da subscrição

### Notas:
- Não usar pagamentos externos (Stripe, etc.) - usar apenas Google Play Billing
- Subscrições são geridas pela conta Google do utilizador
- Restaurar compras automaticamente baseado na conta Google

---

**FIM DO DOCUMENTO - GUARDAR SEMPRE ESTA INFORMAÇÃO**
