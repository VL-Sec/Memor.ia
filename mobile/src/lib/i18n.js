import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const translations = {
  en: {
    // Tabs
    tabLinks: 'Links',
    tabNotes: 'Notes',
    tabClipboard: 'Clipboard',
    tabFavorites: 'Favorites',
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
    all: 'All',
    
    // Folders
    allLinks: 'All Links',
    allNotes: 'All Notes',
    allClipboards: 'All Clips',
    folders: 'Folders',
    newFolder: 'New Folder',
    generalFolder: 'General',
    folderName: 'Folder Name',
    selectFolder: 'Select folder',
    
    // Clipboard
    clipboardPlaceholder: 'Paste text here...',
    noClipboardItems: 'No items yet',
    chars: 'chars',
    smartClipboard: 'Smart Clipboard',
    smartClipboardInfo: 'While active, saves everything you copy.',
    activate: 'Activate',
    deactivate: 'Stop',
    timeRemaining: 'remaining',
    
    // Notes
    notesPlaceholder: 'Write your note...',
    noteTitle: 'Title',
    noteTitlePlaceholder: 'Note title (optional)',
    noNotes: 'No notes yet',
    newNote: 'New Note',
    editNote: 'Edit Note',
    noteColor: 'Color',
    pinNote: 'Pin',
    unpinNote: 'Unpin',
    pinnedNotes: 'Pinned',
    otherNotes: 'Notes',
    
    // Favorites
    noFavorites: 'No favorites yet',
    addFavoritesHint: 'Tap the heart to add favorites',
    addedToFavorites: 'Added to favorites',
    removedFromFavorites: 'Removed from favorites',
    
    // Drag & Drop
    dragToReorder: 'Long press to reorder',
    
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
    cloudBackupDescription: 'All your links, notes and settings are automatically synced.',
    cloudBackupIOS: 'iCloud Backup',
    cloudBackupAndroid: 'Google Backup',
    cloudBackupEnabled: 'Enabled',
    cloudBackupTip: 'Make sure cloud backup is enabled in your device settings.',
    
    // Notifications
    notifications: 'Notifications',
    weeklySummary: 'Weekly Summary',
    weeklySummaryInfo: 'Receive a reminder to review your saved content',
    dayOfWeek: 'Day',
    time: 'Time',
    selectDay: 'Select day',
    selectTime: 'Select time',
    weeklySummaryEnabled: 'Weekly summary enabled',
    weeklySummaryDisabled: 'Weekly summary disabled',
    
    // Messages
    copied: 'Copied!',
    saved: 'Saved!',
    deleted: 'Deleted!',
    error: 'Error',
    
    // Reminders
    reminder: 'Reminder',
    setReminder: 'Set Reminder',
    reminderDate: 'Date',
    reminderTime: 'Time',
    reminderLocation: 'Location',
    reminderLocationPlaceholder: 'Add location (optional)',
    reminderEnabled: 'Reminder enabled',
    noDate: 'No date',
    noTime: 'No time',
    clearReminder: 'Clear Reminder',
    editItem: 'Edit',
    moveToFolder: 'Move to folder',
  },
  
  pt: {
    // Tabs
    tabLinks: 'Links',
    tabNotes: 'Notas',
    tabClipboard: 'Clipboard',
    tabFavorites: 'Favoritos',
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
    all: 'Todos',
    
    // Folders
    allLinks: 'Todos os Links',
    allNotes: 'Todas as Notas',
    allClipboards: 'Todos os Clips',
    folders: 'Pastas',
    newFolder: 'Nova Pasta',
    generalFolder: 'Geral',
    folderName: 'Nome da Pasta',
    selectFolder: 'Selecionar pasta',
    
    // Clipboard
    clipboardPlaceholder: 'Cola o texto aqui...',
    noClipboardItems: 'Ainda sem itens',
    chars: 'caracteres',
    smartClipboard: 'Smart Clipboard',
    smartClipboardInfo: 'Enquanto ativo, guarda tudo o que copiares.',
    activate: 'Ativar',
    deactivate: 'Parar',
    timeRemaining: 'restantes',
    
    // Notes
    notesPlaceholder: 'Escreve a tua nota...',
    noteTitle: 'Título',
    noteTitlePlaceholder: 'Título da nota (opcional)',
    noNotes: 'Ainda sem notas',
    newNote: 'Nova Nota',
    editNote: 'Editar Nota',
    noteColor: 'Cor',
    pinNote: 'Fixar',
    unpinNote: 'Desafixar',
    pinnedNotes: 'Fixadas',
    otherNotes: 'Notas',
    
    // Favorites
    noFavorites: 'Sem favoritos',
    addFavoritesHint: 'Toca no coração para adicionar favoritos',
    addedToFavorites: 'Adicionado aos favoritos',
    removedFromFavorites: 'Removido dos favoritos',
    
    // Drag & Drop
    dragToReorder: 'Pressiona longamente para reorganizar',
    
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
    backup: 'Backup na Cloud',
    backupInfo: 'Os teus dados são guardados automaticamente',
    version: 'Versão',
    
    // Cloud Backup Card
    cloudBackupTitle: 'Backup Automático',
    cloudBackupSubtitle: 'Os teus dados estão seguros',
    cloudBackupDescription: 'Todos os teus links, notas e definições são sincronizados automaticamente.',
    cloudBackupIOS: 'iCloud Backup',
    cloudBackupAndroid: 'Google Backup',
    cloudBackupEnabled: 'Ativado',
    cloudBackupTip: 'Certifica-te que o backup na cloud está ativado nas definições do dispositivo.',
    
    // Notifications
    notifications: 'Notificações',
    weeklySummary: 'Resumo Semanal',
    weeklySummaryInfo: 'Recebe um lembrete para rever o conteúdo guardado',
    dayOfWeek: 'Dia',
    time: 'Hora',
    selectDay: 'Selecionar dia',
    selectTime: 'Selecionar hora',
    weeklySummaryEnabled: 'Resumo semanal ativado',
    weeklySummaryDisabled: 'Resumo semanal desativado',
    
    // Messages
    copied: 'Copiado!',
    saved: 'Guardado!',
    deleted: 'Apagado!',
    error: 'Erro',
    
    // Reminders
    reminder: 'Lembrete',
    setReminder: 'Definir Lembrete',
    reminderDate: 'Data',
    reminderTime: 'Hora',
    reminderLocation: 'Local',
    reminderLocationPlaceholder: 'Adicionar local (opcional)',
    reminderEnabled: 'Lembrete ativado',
    noDate: 'Sem data',
    noTime: 'Sem hora',
    clearReminder: 'Limpar Lembrete',
    editItem: 'Editar',
    moveToFolder: 'Mover para pasta',
  },
  
  es: {
    // Tabs
    tabLinks: 'Enlaces',
    tabNotes: 'Notas',
    tabClipboard: 'Clipboard',
    tabFavorites: 'Favoritos',
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
    all: 'Todos',
    
    // Folders
    allLinks: 'Todos los Enlaces',
    allNotes: 'Todas las Notas',
    allClipboards: 'Todos los Clips',
    folders: 'Carpetas',
    newFolder: 'Nueva Carpeta',
    generalFolder: 'General',
    folderName: 'Nombre',
    selectFolder: 'Seleccionar carpeta',
    
    // Clipboard
    clipboardPlaceholder: 'Pega el texto aquí...',
    noClipboardItems: 'Sin elementos',
    chars: 'caracteres',
    smartClipboard: 'Smart Clipboard',
    smartClipboardInfo: 'Mientras está activo, guarda todo lo que copies.',
    activate: 'Activar',
    deactivate: 'Parar',
    timeRemaining: 'restantes',
    
    // Notes
    notesPlaceholder: 'Escribe tu nota...',
    noteTitle: 'Título',
    noteTitlePlaceholder: 'Título de la nota (opcional)',
    noNotes: 'Sin notas',
    newNote: 'Nueva Nota',
    editNote: 'Editar Nota',
    noteColor: 'Color',
    pinNote: 'Fijar',
    unpinNote: 'Desfijar',
    pinnedNotes: 'Fijadas',
    otherNotes: 'Notas',
    
    // Favorites
    noFavorites: 'Sin favoritos',
    addFavoritesHint: 'Toca el corazón para añadir favoritos',
    addedToFavorites: 'Añadido a favoritos',
    removedFromFavorites: 'Eliminado de favoritos',
    
    // Drag & Drop
    dragToReorder: 'Mantén pulsado para reorganizar',
    
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
    backup: 'Copia en la Nube',
    backupInfo: 'Tus datos se guardan automáticamente',
    version: 'Versión',
    
    // Cloud Backup Card
    cloudBackupTitle: 'Copia de Seguridad',
    cloudBackupSubtitle: 'Tus datos están seguros',
    cloudBackupDescription: 'Todos tus enlaces, notas y ajustes se sincronizan automáticamente.',
    cloudBackupIOS: 'iCloud Backup',
    cloudBackupAndroid: 'Google Backup',
    cloudBackupEnabled: 'Activado',
    cloudBackupTip: 'Asegúrate de que la copia de seguridad esté activada.',
    
    // Notifications
    notifications: 'Notificaciones',
    weeklySummary: 'Resumen Semanal',
    weeklySummaryInfo: 'Recibe un recordatorio para revisar tu contenido',
    dayOfWeek: 'Día',
    time: 'Hora',
    selectDay: 'Seleccionar día',
    selectTime: 'Seleccionar hora',
    weeklySummaryEnabled: 'Resumen semanal activado',
    weeklySummaryDisabled: 'Resumen semanal desactivado',
    
    // Messages
    copied: '¡Copiado!',
    saved: '¡Guardado!',
    deleted: '¡Eliminado!',
    error: 'Error',
    
    // Reminders
    reminder: 'Recordatorio',
    setReminder: 'Definir Recordatorio',
    reminderDate: 'Fecha',
    reminderTime: 'Hora',
    reminderLocation: 'Ubicación',
    reminderLocationPlaceholder: 'Añadir ubicación (opcional)',
    reminderEnabled: 'Recordatorio activado',
    noDate: 'Sin fecha',
    noTime: 'Sin hora',
    clearReminder: 'Borrar Recordatorio',
    editItem: 'Editar',
    moveToFolder: 'Mover a carpeta',
  },
  
  fr: {
    // Tabs
    tabLinks: 'Liens',
    tabNotes: 'Notes',
    tabClipboard: 'Clipboard',
    tabFavorites: 'Favoris',
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
    all: 'Tous',
    
    // Folders
    allLinks: 'Tous les Liens',
    allNotes: 'Toutes les Notes',
    allClipboards: 'Tous les Clips',
    folders: 'Dossiers',
    newFolder: 'Nouveau Dossier',
    generalFolder: 'Général',
    folderName: 'Nom',
    selectFolder: 'Sélectionner dossier',
    
    // Clipboard
    clipboardPlaceholder: 'Collez le texte ici...',
    noClipboardItems: 'Aucun élément',
    chars: 'caractères',
    smartClipboard: 'Smart Clipboard',
    smartClipboardInfo: "Pendant qu'il est actif, enregistre tout ce que vous copiez.",
    activate: 'Activer',
    deactivate: 'Arrêter',
    timeRemaining: 'restantes',
    
    // Notes
    notesPlaceholder: 'Écrivez votre note...',
    noteTitle: 'Titre',
    noteTitlePlaceholder: 'Titre de la note (optionnel)',
    noNotes: 'Aucune note',
    newNote: 'Nouvelle Note',
    editNote: 'Modifier la Note',
    noteColor: 'Couleur',
    pinNote: 'Épingler',
    unpinNote: 'Désépingler',
    pinnedNotes: 'Épinglées',
    otherNotes: 'Notes',
    
    // Favorites
    noFavorites: 'Pas de favoris',
    addFavoritesHint: 'Appuyez sur le cœur pour ajouter des favoris',
    addedToFavorites: 'Ajouté aux favoris',
    removedFromFavorites: 'Retiré des favoris',
    
    // Drag & Drop
    dragToReorder: 'Appuyez longuement pour réorganiser',
    
    // Premium
    premium: 'Premium',
    premiumActive: 'Premium Actif',
    trialActive: "Période d'Essai",
    trialDaysLeft: 'jours restants',
    trialExpired: "Période d'Essai Expirée",
    activationCode: "Code d'Activation",
    enterActivationCode: 'Entrer le code',
    codeActivated: 'Code activé!',
    invalidCode: 'Code invalide',
    codeAlreadyUsed: 'Code déjà utilisé',
    
    // Settings
    settings: 'Paramètres',
    language: 'Langue',
    backup: 'Sauvegarde Cloud',
    backupInfo: 'Vos données sont sauvegardées automatiquement',
    version: 'Version',
    
    // Cloud Backup Card
    cloudBackupTitle: 'Sauvegarde Automatique',
    cloudBackupSubtitle: 'Vos données sont en sécurité',
    cloudBackupDescription: 'Tous vos liens, notes et paramètres sont synchronisés automatiquement.',
    cloudBackupIOS: 'iCloud Backup',
    cloudBackupAndroid: 'Google Backup',
    cloudBackupEnabled: 'Activé',
    cloudBackupTip: 'Assurez-vous que la sauvegarde cloud est activée.',
    
    // Notifications
    notifications: 'Notifications',
    weeklySummary: 'Résumé Hebdomadaire',
    weeklySummaryInfo: 'Recevez un rappel pour revoir votre contenu',
    dayOfWeek: 'Jour',
    time: 'Heure',
    selectDay: 'Sélectionner le jour',
    selectTime: "Sélectionner l'heure",
    weeklySummaryEnabled: 'Résumé hebdomadaire activé',
    weeklySummaryDisabled: 'Résumé hebdomadaire désactivé',
    
    // Messages
    copied: 'Copié!',
    saved: 'Enregistré!',
    deleted: 'Supprimé!',
    error: 'Erreur',
    
    // Reminders
    reminder: 'Rappel',
    setReminder: 'Définir un Rappel',
    reminderDate: 'Date',
    reminderTime: 'Heure',
    reminderLocation: 'Lieu',
    reminderLocationPlaceholder: 'Ajouter un lieu (optionnel)',
    reminderEnabled: 'Rappel activé',
    noDate: 'Pas de date',
    noTime: "Pas d'heure",
    clearReminder: 'Effacer le Rappel',
    editItem: 'Modifier',
    moveToFolder: 'Déplacer vers dossier',
  },
};

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export const detectLanguage = () => {
  try {
    const locale = Localization.locale || Localization.getLocales()?.[0]?.languageCode || 'en';
    const langCode = typeof locale === 'string' ? locale.split('-')[0] : 'en';
    return ['en', 'pt', 'es', 'fr'].includes(langCode) ? langCode : 'en';
  } catch (error) {
    console.warn('Error detecting language:', error);
    return 'en';
  }
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
