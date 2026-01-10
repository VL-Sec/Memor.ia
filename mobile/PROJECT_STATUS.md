# 📱 Memor.ia - ESTADO COMPLETO DO PROJETO
## Última Atualização: Junho 2025

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
- ✅ Pesquisa (limpa ao perder foco)
- ✅ Datas só aparecem para Notas (Links e Clipboard sem data)

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
