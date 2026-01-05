import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const translations = {
  en: {
    // Tabs
    tabLinks: 'Links',
    tabFavorites: 'Favorites',
    tabClipboard: 'Clipboard',
    tabSettings: 'Settings',
    
    // General
    appName: 'Memor.ia',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    copy: 'Copy',
    open: 'Open',
    search: 'Search...',
    
    // Folders
    allLinks: 'All Links',
    allClipboards: 'All Notes',
    folders: 'Folders',
    newFolder: 'New Folder',
    generalFolder: 'General',
    folderName: 'Folder Name',
    selectFolder: 'Select folder',
    
    // Clipboard
    clipboardPlaceholder: 'Paste text or emojis here... 📋✨',
    noClipboardItems: 'No notes yet',
    chars: 'chars',
    smartClipboard: 'Smart Clipboard',
    smartClipboardInfo: 'While active, saves everything you copy.',
    smartClipboardActivated: 'Smart Clipboard active for 2 minutes',
    activate: 'Activate',
    deactivate: 'Stop',
    timeRemaining: 'remaining',
    
    // Premium
    premium: 'Premium',
    premiumActive: 'Premium Active',
    trialActive: 'Trial Active',
    trialDaysLeft: 'days left',
    trialExpired: 'Trial Expired',
    activationCode: 'Activation Code',
    enterActivationCode: 'Enter activation code',
    codeActivated: 'Code activated!',
    invalidCode: 'Invalid code',
    codeAlreadyUsed: 'Code already used',
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    backup: 'Cloud Backup',
    backupInfo: 'Your data is automatically backed up',
    version: 'Version',
    
    // Cloud Backup Card
    cloudBackupTitle: 'Automatic Backup',
    cloudBackupSubtitle: 'Your data is safe',
    cloudBackupDescription: 'All your links, notes and settings are automatically synced with your device\'s cloud backup.',
    cloudBackupIOS: 'iCloud Backup',
    cloudBackupAndroid: 'Google Backup',
    cloudBackupEnabled: 'Enabled',
    cloudBackupTip: 'Make sure cloud backup is enabled in your device settings.',
    
    // Notifications - Weekly Summary
    notifications: 'Notifications',
    weeklySummary: 'Weekly Summary',
    weeklySummaryInfo: 'Receive a reminder to review your saved content',
    dayOfWeek: 'Day',
    time: 'Time',
    selectDay: 'Select day',
    selectTime: 'Select time',
    weeklySummaryEnabled: 'Weekly summary enabled',
    weeklySummaryDisabled: 'Weekly summary disabled',
    permissionRequired: 'Permission required',
    permissionMessage: 'Please enable notifications in settings',
    
    // Messages
    copied: 'Copied!',
    saved: 'Saved!',
    deleted: 'Deleted!',
    error: 'Error',
  },
  
  pt: {
    // Tabs
    tabLinks: 'Links',
    tabFavorites: 'Favoritos',
    tabClipboard: 'Clipboard',
    tabSettings: 'Definições',
    
    // General
    appName: 'Memor.ia',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Apagar',
    edit: 'Editar',
    copy: 'Copiar',
    open: 'Abrir',
    search: 'Pesquisar...',
    
    // Folders
    allLinks: 'Todos os Links',
    allClipboards: 'Todas as Notas',
    folders: 'Pastas',
    newFolder: 'Nova Pasta',
    generalFolder: 'Geral',
    folderName: 'Nome da Pasta',
    selectFolder: 'Selecionar pasta',
    
    // Clipboard
    clipboardPlaceholder: 'Cola texto ou emojis aqui... 📋✨',
    noClipboardItems: 'Ainda não tens notas',
    chars: 'caracteres',
    smartClipboard: 'Smart Clipboard',
    smartClipboardInfo: 'Enquanto ativo, guarda tudo o que copiares.',
    smartClipboardActivated: 'Smart Clipboard ativo por 2 minutos',
    activate: 'Ativar',
    deactivate: 'Parar',
    timeRemaining: 'restantes',
    
    // Premium
    premium: 'Premium',
    premiumActive: 'Premium Ativo',
    trialActive: 'Período de Teste',
    trialDaysLeft: 'dias restantes',
    trialExpired: 'Período de Teste Expirado',
    activationCode: 'Código de Ativação',
    enterActivationCode: 'Inserir código de ativação',
    codeActivated: 'Código ativado!',
    invalidCode: 'Código inválido',
    codeAlreadyUsed: 'Código já utilizado',
    
    // Settings
    settings: 'Definições',
    language: 'Idioma',
    backup: 'Backup',
    backupInfo: 'Os teus dados são guardados automaticamente',
    version: 'Versão',
    
    // Notifications - Weekly Summary
    notifications: 'Notificações',
    weeklySummary: 'Resumo Semanal',
    weeklySummaryInfo: 'Recebe um lembrete para rever o conteúdo guardado',
    dayOfWeek: 'Dia',
    time: 'Hora',
    selectDay: 'Selecionar dia',
    selectTime: 'Selecionar hora',
    weeklySummaryEnabled: 'Resumo semanal ativado',
    weeklySummaryDisabled: 'Resumo semanal desativado',
    permissionRequired: 'Permissão necessária',
    permissionMessage: 'Ativa as notificações nas definições',
    
    // Messages
    copied: 'Copiado!',
    saved: 'Guardado!',
    deleted: 'Apagado!',
    error: 'Erro',
  },
  
  es: {
    // Tabs
    tabLinks: 'Enlaces',
    tabFavorites: 'Favoritos',
    tabClipboard: 'Clipboard',
    tabSettings: 'Ajustes',
    
    // General
    appName: 'Memor.ia',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    copy: 'Copiar',
    open: 'Abrir',
    search: 'Buscar...',
    
    // Folders
    allLinks: 'Todos los Enlaces',
    allClipboards: 'Todas las Notas',
    folders: 'Carpetas',
    newFolder: 'Nueva Carpeta',
    generalFolder: 'General',
    folderName: 'Nombre de la Carpeta',
    selectFolder: 'Seleccionar carpeta',
    
    // Clipboard
    clipboardPlaceholder: 'Pega texto o emojis aquí... 📋✨',
    noClipboardItems: 'Aún no hay notas',
    chars: 'caracteres',
    smartClipboard: 'Smart Clipboard',
    smartClipboardInfo: 'Mientras está activo, guarda todo lo que copies.',
    smartClipboardActivated: 'Smart Clipboard activo por 2 minutos',
    activate: 'Activar',
    deactivate: 'Parar',
    timeRemaining: 'restantes',
    
    // Premium
    premium: 'Premium',
    premiumActive: 'Premium Activo',
    trialActive: 'Período de Prueba',
    trialDaysLeft: 'días restantes',
    trialExpired: 'Período de Prueba Expirado',
    activationCode: 'Código de Activación',
    enterActivationCode: 'Introducir código',
    codeActivated: '¡Código activado!',
    invalidCode: 'Código inválido',
    codeAlreadyUsed: 'Código ya utilizado',
    
    // Settings
    settings: 'Ajustes',
    language: 'Idioma',
    backup: 'Copia de Seguridad',
    backupInfo: 'Tus datos se guardan automáticamente',
    version: 'Versión',
    
    // Notifications - Weekly Summary
    notifications: 'Notificaciones',
    weeklySummary: 'Resumen Semanal',
    weeklySummaryInfo: 'Recibe un recordatorio para revisar tu contenido guardado',
    dayOfWeek: 'Día',
    time: 'Hora',
    selectDay: 'Seleccionar día',
    selectTime: 'Seleccionar hora',
    weeklySummaryEnabled: 'Resumen semanal activado',
    weeklySummaryDisabled: 'Resumen semanal desactivado',
    permissionRequired: 'Permiso requerido',
    permissionMessage: 'Activa las notificaciones en ajustes',
    
    // Messages
    copied: '¡Copiado!',
    saved: '¡Guardado!',
    deleted: '¡Eliminado!',
    error: 'Error',
  },
  
  fr: {
    // Tabs
    tabLinks: 'Liens',
    tabFavorites: 'Favoris',
    tabClipboard: 'Clipboard',
    tabSettings: 'Paramètres',
    
    // General
    appName: 'Memor.ia',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    copy: 'Copier',
    open: 'Ouvrir',
    search: 'Rechercher...',
    
    // Folders
    allLinks: 'Tous les Liens',
    allClipboards: 'Toutes les Notes',
    folders: 'Dossiers',
    newFolder: 'Nouveau Dossier',
    generalFolder: 'Général',
    folderName: 'Nom du Dossier',
    selectFolder: 'Sélectionner dossier',
    
    // Clipboard
    clipboardPlaceholder: 'Collez du texte ou des emojis ici... 📋✨',
    noClipboardItems: 'Pas encore de notes',
    chars: 'caractères',
    smartClipboard: 'Smart Clipboard',
    smartClipboardInfo: 'Pendant qu\'il est actif, enregistre tout ce que vous copiez.',
    smartClipboardActivated: 'Smart Clipboard actif pendant 2 minutes',
    activate: 'Activer',
    deactivate: 'Arrêter',
    timeRemaining: 'restantes',
    
    // Premium
    premium: 'Premium',
    premiumActive: 'Premium Actif',
    trialActive: 'Période d\'Essai',
    trialDaysLeft: 'jours restants',
    trialExpired: 'Période d\'Essai Expirée',
    activationCode: 'Code d\'Activation',
    enterActivationCode: 'Entrer le code',
    codeActivated: 'Code activé!',
    invalidCode: 'Code invalide',
    codeAlreadyUsed: 'Code déjà utilisé',
    
    // Settings
    settings: 'Paramètres',
    language: 'Langue',
    backup: 'Sauvegarde',
    backupInfo: 'Vos données sont sauvegardées automatiquement',
    version: 'Version',
    
    // Notifications - Weekly Summary
    notifications: 'Notifications',
    weeklySummary: 'Résumé Hebdomadaire',
    weeklySummaryInfo: 'Recevez un rappel pour revoir votre contenu enregistré',
    dayOfWeek: 'Jour',
    time: 'Heure',
    selectDay: 'Sélectionner le jour',
    selectTime: 'Sélectionner l\'heure',
    weeklySummaryEnabled: 'Résumé hebdomadaire activé',
    weeklySummaryDisabled: 'Résumé hebdomadaire désactivé',
    permissionRequired: 'Permission requise',
    permissionMessage: 'Activez les notifications dans les paramètres',
    
    // Messages
    copied: 'Copié!',
    saved: 'Enregistré!',
    deleted: 'Supprimé!',
    error: 'Erreur',
  },
};

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export const detectLanguage = () => {
  const locale = Localization.locale.split('-')[0];
  if (['en', 'pt', 'es', 'fr'].includes(locale)) {
    return locale;
  }
  return 'en';
};

export const getStoredLanguage = async () => {
  try {
    const lang = await AsyncStorage.getItem('memoria-language');
    return lang || detectLanguage();
  } catch (error) {
    return detectLanguage();
  }
};

export const setLanguage = async (lang) => {
  try {
    await AsyncStorage.setItem('memoria-language', lang);
  } catch (error) {
    console.error('Error setting language:', error);
  }
};
