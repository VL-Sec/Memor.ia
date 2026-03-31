# 📱 Memor.ia - ESTADO COMPLETO DO PROJETO
## Última Atualização: 21 Janeiro 2026 - Versão 1.0.7 (versionCode 7)

---

# ✅ ESTADO ATUAL

**Versão:** 1.0.7 (versionCode: 7)
**Package:** com.getmemoria.app
**Estado:** ✅ Pronto para Play Store
**RevenueCat SDK:** 9.7.1

---

# 🔑 CREDENCIAIS E API KEYS

## Supabase
- **URL:** https://vczmygfrsmxzkyzzckfu.supabase.co
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjem15Z2Zyc214emt5enpja2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MTA5ODQsImV4cCI6MjA4MzE4Njk4NH0.qj0kSBcZpdLYxCLWY-fKchxLKJeBhUBoOAe13Sk4I2Q

## RevenueCat
- **API Key (Android):** goog_grtYQITtVshRaRcrqCNRQMcmdgO
- **Entitlement ID:** Memor.ia Pro
- **Produtos:** premium_mensal, premium_anual (15 dias trial)

## EAS Project
- **Project ID:** 5859e410-54f0-4917-bfc6-ae55b8968dd3

---

# 🆕 FUNCIONALIDADES v1.0.7

## 1. Trial de 3 Dias ✅ NOVO
- App 100% funcional nos primeiros 3 dias
- No 4º dia: ecrã de bloqueio + paywall automático
- Quem tem código de ativação **NÃO é bloqueado**
- Quem tem subscrição **NÃO é bloqueado**
- **Modal de código de ativação no ecrã de bloqueio** ✅ CORRIGIDO
- **Botão para colar código do clipboard** ✅ NOVO

### Lógica de Acesso:
```
hasFullAccess = hasPremium OR trialActive

Se hasPremium (código ou subscrição) → Acesso total sempre
Se trialActive (primeiros 3 dias) → Acesso total
Se trial expirado E não premium → BLOQUEIO + Paywall
```

### AsyncStorage Keys:
- `memoria_first_open_date` - Data da primeira abertura
- `memoria_premium` - Estado premium local
- `memoria_activated_code` - Código usado

## 2. Sistema de Subscrições RevenueCat ✅
- SDK `react-native-purchases` v9.7.1
- SDK `react-native-purchases-ui` v9.7.1
- Paywall nativo configurado no RevenueCat Dashboard
- Preços dinâmicos da Google Play
- **NÃO funciona no Expo Go** - precisa Development/Preview Build

## 3. Sistema de Códigos de Ativação ✅
- Validação contra tabela `activation_codes` no Supabase
- Marca código como `is_used: true` após uso
- Atualiza métricas automaticamente
- Formato: XXXX-XXXX-XXXX
- **Bypass do trial** - quem usa código tem acesso permanente
- **Pode colar código do clipboard** com botão dedicado

## 4. Debug Mode ✅ ATUALIZADO
- Ativar: **5 taps na versão "1.0.7"**
- Botões disponíveis:
  - 🔴 **Simular Trial Expirado** - Testa bloqueio sem esperar 3 dias
  - 🟢 **Reset Trial (Novo 3 dias)** - Começa trial de novo
  - ⚪ **Fechar Debug Mode** - Esconde secção

### Como testar bloqueio:
1. Definições → 5 taps na versão
2. "Simular Trial Expirado"
3. Fecha e abre a app
4. Vês ecrã de bloqueio!

## 5. Ecrã de Bloqueio (Trial Expirado) ✅ ATUALIZADO
- Ícone de relógio
- Título: "Trial Expirado"
- Mensagem explicativa
- Botão verde "Assinar Memor.ia Pro" (abre paywall)
- Link "Tenho código de ativação" → **Abre modal para inserir código** ✅ CORRIGIDO
- **Botão de colar código do clipboard** ✅ NOVO

## 6. Backup Cloud Simplificado ✅ ALTERADO
- Removido toggle on/off
- Apenas texto informativo: "Backup automático na cloud ativo"
- Dados salvos automaticamente no Supabase

## 7. Layout Tablet ✅ CORRIGIDO
- Alterado `orientation` de "portrait" para "default" no app.json
- App agora suporta todas as orientações (portrait e landscape)
- Conteúdo deve usar 100% da largura do ecrã em tablets

---

# 🔗 URLS OFICIAIS

| Tipo | URL |
|------|-----|
| **Terms of Service** | https://candy-snowshoe-1a9.notion.site/Terms-of-Service-Memor-ia-2ed8acbb1c8c805a8615da477c589dc4 |
| **Privacy Policy** | https://candy-snowshoe-1a9.notion.site/Privacy-Policy-Memor-ia-2ed8acbb1c8c807ca2d5caa43af9c4dc |
| **GitHub** | https://github.com/VL-Sec/Memor.ia |
| **Admin Dashboard** | https://memsub-system.preview.emergentagent.com/admin |
| **RevenueCat Dashboard** | https://app.revenuecat.com |

---

# 🏗️ ARQUITETURA DA APP

## Navegação
```
Stack.Navigator (raiz)
│
├── TrialExpiredScreen (se bloqueado)
│
├── MainTabs (Tab.Navigator) ─── 4 TABS
│   ├── Links      → LinksScreen.js
│   ├── Clipboard  → ClipboardScreen.js
│   ├── Notas      → NotesScreen.js
│   └── Favoritos  → FavoritesScreen.js
│
└── Settings → SettingsScreen.js (via ícone ⚙️)
```

## Sistema de Acesso
```
┌─────────────────────────────────────────────────────┐
│                   VERIFICAÇÃO DE ACESSO              │
├─────────────────────────────────────────────────────┤
│                                                      │
│   1. Tem código de ativação válido?                 │
│      └── SIM → Acesso total permanente ✅            │
│                                                      │
│   2. Tem subscrição RevenueCat ativa?               │
│      └── SIM → Acesso total ✅                       │
│                                                      │
│   3. Está nos primeiros 3 dias (trial)?             │
│      └── SIM → Acesso total ✅                       │
│      └── NÃO → BLOQUEIO + Paywall ❌                 │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

# 📊 BASE DE DADOS SUPABASE

## Tabelas

### `activation_codes`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | text | Primary Key |
| code | text | Código (XXXX-XXXX-XXXX) |
| influencer_name | text | Nome do influencer |
| is_used | boolean | Se já foi usado |
| used_at | timestamp | Data de uso |
| created_at | timestamp | Data criação |
| notes | text | Notas do admin |

### `app_metrics` (id = 'global')
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| total_installations | int4 | Total de instalações |
| premium_active | int4 | Utilizadores premium |
| premium_via_code | int4 | Premium via código |
| premium_via_purchase | int4 | Premium via compra |

### `links`, `notes`, `folders`
- Dados dos utilizadores
- Sincronizados automaticamente

### Políticas RLS Necessárias:
```sql
-- Para activation_codes (DELETE)
CREATE POLICY "Anyone can delete codes" ON activation_codes
FOR DELETE TO public USING (true);
```

---

# 🌐 TRADUÇÕES (6 Idiomas)

| Idioma | Código | Trial Traduzido |
|--------|--------|-----------------|
| 🇬🇧 English | en | "Trial Expired" |
| 🇵🇹 Português | pt | "Período de Teste Expirado" |
| 🇪🇸 Español | es | "Prueba Expirada" |
| 🇫🇷 Français | fr | "Essai Expiré" |
| 🇩🇪 Deutsch | de | "Testversion Abgelaufen" |
| 🇮🇹 Italiano | it | "Prova Scaduta" |

Chaves novas: `trialExpired`, `trialExpiredMessage`, `autoCloudBackup`

---

# 🔧 COMANDOS DE BUILD

## Clonar Projeto
```bash
cd C:\Projetos
rmdir /s /q Memoria2
git clone https://github.com/VL-Sec/Memor.ia.git Memoria2
cd Memoria2\mobile
```

## Instalar e Verificar
```bash
yarn install
npx expo install --fix
del package-lock.json
npx expo-doctor
```

## Build APK (Preview/Testes)
```bash
eas build --profile preview --platform android
```

## Build AAB (Produção/Play Store)
```bash
eas build --profile production --platform android
```

---

# 📦 DEPENDÊNCIAS PRINCIPAIS

```json
{
  "expo": "~54.0.31",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-purchases": "^9.7.1",
  "react-native-purchases-ui": "^9.7.1",
  "@supabase/supabase-js": "^2.49.1",
  "@react-navigation/native": "^7.1.6",
  "@react-navigation/bottom-tabs": "^7.3.10",
  "@react-native-async-storage/async-storage": "2.2.0"
}
```

**Package Manager:** YARN (nunca npm para install)

---

# 📋 ESTRUTURA DE FICHEIROS

```
/app/mobile/
├── App.js                     # Navegação + Trial + Bloqueio
├── app.json                   # Config (v1.0.7, versionCode 7)
├── eas.json                   # Configuração EAS Build
├── package.json               # Dependências
├── PROJECT_STATUS.md          # Este ficheiro
└── src/
    ├── lib/
    │   ├── i18n.js            # Traduções (6 idiomas)
    │   ├── premium.js         # Trial + Premium + Códigos
    │   ├── revenueCat.js      # SDK RevenueCat
    │   ├── supabase.js        # Cliente Supabase
    │   └── userManager.js     # ID único dispositivo
    └── screens/
        ├── LinksScreen.js
        ├── ClipboardScreen.js
        ├── NotesScreen.js
        ├── FavoritesScreen.js
        └── SettingsScreen.js  # Debug Mode + Premium UI

/app/app/admin/
├── page.js                    # Login admin
└── dashboard/
    └── page.js                # Dashboard códigos + métricas
```

---

# ⚠️ NOTAS IMPORTANTES

## Trial vs Premium
- **Trial:** 3 dias, qualquer utilizador novo
- **Premium por código:** Permanente, não expira
- **Premium por subscrição:** Enquanto subscrição ativa

## Expo Go vs Build
- **Expo Go:** Testa UI, NÃO testa pagamentos
- **Preview Build:** Testa TUDO incluindo trial e bloqueio
- **Production Build:** Para Play Store

## Admin Dashboard
- **URL:** https://memsub-system.preview.emergentagent.com/admin
- Criar/gerir códigos de ativação
- Ver métricas

---

# 🚫 NUNCA FAZER

- ❌ Usar npm install (sempre yarn)
- ❌ Ter package-lock.json E yarn.lock juntos
- ❌ Hardcodar preços
- ❌ Adicionar Settings como 5º tab
- ❌ Usar DEMO_USER

---

# ✅ CHECKLIST v1.0.7

- [x] Versão 1.0.7 (versionCode 7)
- [x] Trial de 3 dias implementado
- [x] Ecrã de bloqueio + paywall
- [x] Códigos bypass trial
- [x] Debug Mode (simular trial)
- [x] Backup toggle removido
- [x] Traduções atualizadas (6 idiomas)
- [x] RevenueCat SDK 9.7.1
- [x] APK Preview gerado
- [ ] Testar trial completo
- [ ] AAB produção
- [ ] Upload Play Store

---

# 📝 TESTE DO TRIAL

## Para testar sem esperar 3 dias:
1. Instala o APK
2. Abre a app
3. Vai a Definições (⚙️)
4. Toca 5x na versão "1.0.7"
5. Clica "Simular Trial Expirado"
6. Fecha a app completamente
7. Abre novamente
8. **Deves ver o ecrã de bloqueio!**

## Para resetar e testar de novo:
1. Debug Mode → "Reset Trial (Novo 3 dias)"
2. Fecha e abre a app
3. Trial recomeça do zero

---

**FIM DO DOCUMENTO - GUARDAR SEMPRE ESTA INFORMAÇÃO**
