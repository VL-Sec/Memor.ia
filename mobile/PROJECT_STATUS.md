# 📱 Memor.ia - Estado do Projeto (Janeiro 2025)

## ⚠️ IMPORTANTE PARA PRÓXIMAS SESSÕES
**NÃO REVERTER NADA! O projeto está funcional e estável.**
**Sempre fazer git pull do GitHub antes de começar!**

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
- Reverter para código antigo

---

## 🖼️ Assets (ATUALIZADOS - Janeiro 2025)
Localização: `/app/mobile/assets/`
- `icon.png` - Ícone principal (NOVO logo azul)
- `adaptive-icon.png` - Ícone Android (NOVO logo azul)
- `splash.png` - Tela de splash (NOVO logo azul)
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
- ✅ Lembretes com notificações locais (campo `reminderAt` no Supabase)
- ✅ Pesquisa
- ✅ Teclado desaparece ao tocar fora
- ✅ Modais fecham ao tocar fora
- ✅ Permite guardar apenas com título OU apenas com URL
- ❌ NÃO mostra data de criação (apenas lembrete se existir)

### 3. Clipboard (ClipboardScreen.js)
- ✅ Colar texto manual
- ✅ **Captura Inteligente** (2 minutos) - Guarda CADA texto copiado separadamente
- ✅ Favoritos e Pin
- ✅ Pastas (criar, mover)
- ✅ Criar pasta diretamente no modal "Mover para" (auto-seleciona)
- ✅ Pesquisa
- ✅ Teclado desaparece ao tocar fora
- ✅ Cards compactos (sem data)

### 4. Notas (NotesScreen.js)
- ✅ Criar, editar, eliminar notas
- ✅ Cores personalizadas
- ✅ Favoritos e Pin
- ✅ Lembretes com notificações locais
- ✅ Armazenamento LOCAL (AsyncStorage)
- ✅ Pesquisa
- ✅ Teclado desaparece ao tocar fora
- ✅ Permite guardar apenas com título OU apenas com conteúdo
- ✅ Mostra data de criação

### 5. Favoritos (FavoritesScreen.js)
- ✅ Mostra todos os itens favoritos (links, notas, clipboard)
- ✅ Filtros por tipo
- ✅ Pesquisa
- ✅ Teclado desaparece ao tocar fora

### 6. Definições (SettingsScreen.js)
- ✅ Seleção de idioma (6 idiomas)
- ✅ Premium / Código de ativação
- ✅ Resumo semanal (notificação)
- ✅ Backup Cloud simplificado (apenas 1 alerta de confirmação)
- ✅ Links legais (Termos, Privacidade)
- ❌ REMOVIDO: Backup manual (exportar/importar JSON)
- ❌ REMOVIDO: Segundo alerta do backup (abrir definições)

### 7. Notificações
- ✅ Lembretes em Links
- ✅ Lembretes em Notas
- ✅ Resumo Semanal
- **Formato trigger:** `{ seconds: X, repeats: false }`
- **NOTA:** Não funciona no Expo Go, apenas em development/preview build

### 8. UX
- ✅ Teclado desaparece ao tocar fora (todas as telas)
- ✅ Modais fecham ao tocar fora (todas as telas)
- ✅ Teclado desaparece ao tocar dentro dos modais

---

## 🌐 Traduções (6 idiomas)
Ficheiro: `/app/mobile/src/lib/i18n.js`

| Idioma | Tabs | Smart Clipboard |
|--------|------|-----------------|
| 🇬🇧 EN | Links, Clipboard, Notes, Favorites | Smart Capture |
| 🇵🇹 PT | Links, Clipboard, Notas, Favoritos | Captura Inteligente |
| 🇪🇸 ES | Enlaces, Portapapeles, Notas, Favoritos | Captura Inteligente |
| 🇫🇷 FR | Liens, Presse-papiers, Notes, Favoris | Capture Intelligente |
| 🇩🇪 DE | Links, Zwischenablage, Notizen, Favoriten | Intelligente Erfassung |
| 🇮🇹 IT | Link, Appunti, Note, Preferiti | Cattura Intelligente |

**Botões Ativar/Desativar** traduzidos corretamente em todos os idiomas.

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

## 🔧 Comandos de Instalação e Build

### 1. Atualizar código do GitHub
```bash
cd C:\Projetos\Memor.ia
git checkout -- mobile/assets/
git pull
```

### 2. Iniciar desenvolvimento
```bash
cd mobile
npx expo start --dev-client --clear
```

### 3. Build Android Preview (APK standalone)
```bash
cd C:\Projetos\Memor.ia\mobile
eas build --platform android --profile preview
```

### 4. Build Android Development (com hot reload)
```bash
cd C:\Projetos\Memor.ia\mobile
eas build --platform android --profile development
```

### 5. Build iOS
```bash
cd C:\Projetos\Memor.ia\mobile
eas build --platform ios --profile preview
```

---

## 📋 Tarefas Pendentes

1. **Bug Tab Bar** - Verificar distribuição uniforme dos ícones
2. **URLs de Políticas** - Adicionar URLs reais quando disponíveis
3. **Publicação nas Stores** - Configurar quando pronto

---

## 🚫 Problemas Resolvidos (NÃO REINTRODUZIR)

| Problema | Solução |
|----------|---------|
| DEMO_USER | Usa userId único por dispositivo |
| CustomTabBar | Tab bar padrão do React Navigation |
| Settings no Tab.Navigator | Settings está no Stack (acesso via ⚙️) |
| Badge "Geral" nos itens | Removida completamente |
| Backup manual | Apenas backup cloud simplificado |
| expo-crypto | Substituído por UUID puro JS |
| Teclado não desaparece | TouchableWithoutFeedback + Keyboard.dismiss |
| Erro Supabase "reminder" | Usa campo `reminderAt` (string) |
| Smart Clipboard duplica | Usa Set para rastrear conteúdos já salvos |
| Cards Clipboard grandes | Compactados, sem data |

---

## 🔑 Informação Crítica para Builds

### Assets só mudam com nova build
- Ícone, splash, etc. são compilados na build
- Hot reload NÃO atualiza assets

### Notificações só funcionam em builds
- Expo Go não suporta notificações
- Usar `development` ou `preview` build

### Profiles de Build
| Profile | Download? | Precisa PC? | Uso |
|---------|-----------|-------------|-----|
| development | ✅ APK | ✅ Metro | Dev com hot reload |
| preview | ✅ APK | ❌ | Testar standalone |
| production | ✅ AAB | ❌ | Play Store |

---

**Última atualização:** Janeiro 2025
**Estado:** ✅ Funcional e Estável
**GitHub:** https://github.com/VL-Sec/Memor.ia
