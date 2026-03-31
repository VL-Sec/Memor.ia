# Memor.ia - React Native App

Aplicação de gestão de links e notas com design premium.

## 📱 Funcionalidades

- ✅ Gestão de Links com preview
- ✅ Clipboard/Notas com emojis
- ✅ Smart Clipboard (guarda automaticamente)
- ✅ Sistema de Pastas
- ✅ Favoritos
- ✅ Multi-idioma (PT, EN, ES, FR)
- ✅ Trial 15 dias + Códigos de Ativação
- ✅ Backup automático (iCloud/Google)

## 🚀 Setup

### Pré-requisitos
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

### Instalação

```bash
cd mobile
yarn install
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
yarn start

# Android
yarn android

# iOS (requer Mac)
yarn ios
```

## 📦 Build para Publicação

### Android (Google Play Store)

```bash
# Login no EAS
eas login

# Configurar projeto
eas build:configure

# Build APK para teste
eas build --platform android --profile preview

# Build AAB para Play Store
eas build --platform android --profile production

# Submeter para Play Store
eas submit --platform android
```

### iOS (App Store)

```bash
# Build para App Store
eas build --platform ios --profile production

# Submeter para App Store
eas submit --platform ios
```

## ☁️ Backup Automático

### Android
- Dados guardados em AsyncStorage
- Backup automático via Google Backup
- `allowBackup: true` no app.json

### iOS
- Dados guardados em AsyncStorage
- Backup automático via iCloud
- `usesIcloudStorage: true` no app.json

## 🔑 Sistema de Premium

### Trial
- 15 dias de acesso total
- Automático na primeira instalação

### Códigos de Ativação
- Gerados no Admin Dashboard
- Formato: XXXX-XXXX-XXXX
- Uso único

### Admin Dashboard
- URL: https://memsub-system.preview.emergentagent.com/admin
- Criar e gerir códigos de influencers

## 📁 Estrutura

```
mobile/
├── App.js              # Entry point
├── app.json            # Expo config
├── eas.json            # EAS Build config
├── package.json
└── src/
    ├── screens/        # Screens
    │   ├── LinksScreen.js
    │   ├── ClipboardScreen.js
    │   ├── FavoritesScreen.js
    │   └── SettingsScreen.js
    ├── lib/            # Utilities
    │   ├── supabase.js
    │   ├── premium.js
    │   └── i18n.js
    └── assets/         # Images
```

## 🎨 Design

- Tema escuro premium
- Cores principais: #007AFF (azul), #000000 (fundo)
- Bordas arredondadas
- Animações suaves

## 📋 Checklist Publicação

### Google Play Store
- [ ] Conta Google Play Developer ($25)
- [ ] Screenshots (phone + tablet)
- [ ] Ícone 512x512
- [ ] Feature graphic 1024x500
- [ ] Descrição em português
- [ ] Política de Privacidade
- [ ] Classificação etária

### App Store
- [ ] Conta Apple Developer ($99/ano)
- [ ] Screenshots iPhone + iPad
- [ ] Ícone 1024x1024
- [ ] Descrição
- [ ] Política de Privacidade
- [ ] Review Guidelines compliance
