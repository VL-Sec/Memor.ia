# 📱 Memor.ia - Estado do Projeto (Janeiro 2025)

## ⚠️ IMPORTANTE PARA PRÓXIMAS SESSÕES
**NÃO REVERTER NADA! O projeto está funcional e estável.**

---

## 🏗️ Arquitetura de Navegação (DEFINITIVA)

```
Stack.Navigator (raiz)
├── MainTabs (Tab.Navigator) - 4 tabs APENAS
│   ├── Links (LinksScreen)
│   ├── Clipboard (ClipboardScreen)
│   ├── Notas (NotesScreen)
│   └── Favoritos (FavoritesScreen)
│
└── Settings (SettingsScreen) - FORA do Tab.Navigator
    └── Acessível via ícone ⚙️ no header (CustomHeader)
```

### ❌ NÃO FAZER:
- Adicionar Settings como 5º tab
- Criar CustomTabBar
- Usar DEMO_USER
- Adicionar tabs vazios ou ocultos

---

## 🖼️ Assets (ATUALIZADOS)
Localização: `/app/mobile/assets/`
- `icon.png` - Ícone principal (novo logo)
- `adaptive-icon.png` - Ícone Android (novo logo)
- `splash.png` - Tela de splash (novo logo)
- `favicon.ico` - Favicon
- `favicon.png` - Favicon PNG

**NOTA:** Para ver novos assets, é necessária NOVA BUILD (não muda com hot reload)

---

## ✅ Funcionalidades Implementadas

### 1. Sistema de Autenticação
- **SEM login/password** - Usa ID único do dispositivo
- Gerado em `/app/mobile/src/lib/userManager.js`
- Armazenado em AsyncStorage como `@memoria_user_id`
- NUNCA usar `DEMO_USER`

### 2. Links (LinksScreen.js)
- ✅ Adicionar links (abre modal completo)
- ✅ Editar, eliminar, copiar
- ✅ Favoritos e Pin (fixar no topo)
- ✅ Pastas (criar, mover, eliminar)
- ✅ Criar pasta diretamente no modal "Mover para" (auto-seleciona)
- ✅ Lembretes com notificações locais
- ✅ Pesquisa
- ✅ Teclado desaparece ao tocar fora

### 3. Clipboard (ClipboardScreen.js)
- ✅ Colar texto manual
- ✅ Captura Inteligente (2 minutos)
- ✅ Favoritos e Pin
- ✅ Pastas (criar, mover)
- ✅ Criar pasta diretamente no modal "Mover para" (auto-seleciona)
- ✅ Pesquisa
- ✅ Teclado desaparece ao tocar fora

### 4. Notas (NotesScreen.js)
- ✅ Criar, editar, eliminar notas
- ✅ Cores personalizadas
- ✅ Favoritos e Pin
- ✅ Lembretes com notificações locais
- ✅ Armazenamento LOCAL (AsyncStorage)
- ✅ Pesquisa
- ✅ Teclado desaparece ao tocar fora

### 5. Favoritos (FavoritesScreen.js)
- ✅ Mostra todos os itens favoritos (links, notas, clipboard)
- ✅ Filtros por tipo
- ✅ Pesquisa
- ✅ Teclado desaparece ao tocar fora

### 6. Definições (SettingsScreen.js)
- ✅ Seleção de idioma (6 idiomas)
- ✅ Premium / Código de ativação
- ✅ Resumo semanal (notificação)
- ✅ Backup Cloud simplificado (switch + abrir definições sistema)
- ✅ Links legais (Termos, Privacidade)
- ❌ REMOVIDO: Backup manual (exportar/importar JSON)

### 7. Notificações
- ✅ Lembretes em Links
- ✅ Lembretes em Notas
- ✅ Resumo Semanal
- **Formato trigger:** `{ seconds: X, repeats: false }`
- **NOTA:** Não funciona no Expo Go, apenas em development build

---

## 🌐 Traduções (6 idiomas)
Ficheiro: `/app/mobile/src/lib/i18n.js`
- 🇬🇧 Inglês (en)
- 🇵🇹 Português (pt)
- 🇪🇸 Espanhol (es)
- 🇫🇷 Francês (fr)
- 🇩🇪 Alemão (de)
- 🇮🇹 Italiano (it)

---

## 💾 Armazenamento

### Supabase (Cloud)
- `links` - Links E itens de Clipboard (campo `contentType`)
  - **IMPORTANTE:** Campo `reminderAt` (string ISO date) para lembretes
  - NÃO usar campo `reminder` (objeto) - não existe na tabela
- `folders` - Pastas

### AsyncStorage (Local)
- `@memoria_user_id` - ID único do dispositivo
- `memoria-notes-{userId}` - Notas do utilizador
- `memoria-link-notifications` - IDs de notificações de links (JSON)
- `memoria-weekly-summary` - Config do resumo semanal
- `memoria-cloud-backup-enabled` - Preferência de backup
- `memoria-premium` - Status premium
- `memoria-language` - Idioma selecionado

---

## 📦 Dependências Principais
- Expo SDK 54
- React 19
- React Navigation 7
- expo-notifications
- @react-native-async-storage/async-storage
- @react-native-community/datetimepicker
- react-native-toast-message

**Package manager:** YARN (nunca usar npm)

---

## 🔧 Comandos Úteis

```bash
# Iniciar desenvolvimento
cd mobile
npx expo start --dev-client --clear

# Build Android (standalone para testar)
eas build --platform android --profile preview

# Build Android (development com hot reload)
eas build --platform android --profile development

# Build iOS
eas build --platform ios --profile preview
```

---

## 📋 Tarefas Pendentes

1. **Bug Tab Bar** - Ícones não distribuídos uniformemente (investigar)
2. **URLs de Políticas** - Adicionar URLs reais quando disponíveis
3. **Publicação nas Stores** - Configurar quando pronto

---

## 🚫 Problemas Resolvidos (NÃO REINTRODUZIR)

1. ~~DEMO_USER~~ → Usa userId único
2. ~~CustomTabBar~~ → Tab bar padrão do React Navigation
3. ~~Settings no Tab.Navigator~~ → Settings está no Stack
4. ~~Badge "Geral" nos itens~~ → Removida
5. ~~Backup manual~~ → Apenas backup cloud simplificado
6. ~~expo-crypto~~ → Substituído por UUID puro JS
7. ~~Teclado não desaparece~~ → TouchableWithoutFeedback + Keyboard.dismiss

---

**Última atualização:** Janeiro 2025
**Estado:** ✅ Funcional e Estável
