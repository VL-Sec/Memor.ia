import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Memor.ia Translations
 * 
 * Languages supported: 6
 * - English (US)
 * - Português (Portugal)
 * - Español (España)
 * - Français (France)
 * - Deutsch (Deutschland)
 * - Italiano (Italia)
 */

export const translations = {
  // ============================================
  // ENGLISH (US)
  // ============================================
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
    done: 'Done',
    confirm: 'Confirm',
    loading: 'Loading...',
    
    // Folders
    allLinks: 'All Links',
    allNotes: 'All Notes',
    allClipboards: 'All Clips',
    folders: 'Folders',
    newFolder: 'New Folder',
    editFolder: 'Edit Folder',
    generalFolder: 'General',
    folderName: 'Folder Name',
    folderNamePlaceholder: 'Folder name',
    selectFolder: 'Choose a folder',
    manageFolders: 'Manage Folders',
    folderCreated: 'Folder created',
    folderCreatedAndSelected: 'Folder created and selected',
    deleteFolder: 'Delete folder',
    deleteFolderConfirm: 'Are you sure? Items will be moved to the General folder.',
    cannotDeleteDefault: 'Cannot delete the default folder',
    start: 'Start',
    stop: 'Stop',
    autoSaved: 'Auto-saved',
    smartClipboardDeactivated: 'Smart Capture deactivated',
    deleteFolderConfirmSimple: 'Are you sure you want to delete this folder?',
    
    // Links
    addLink: 'Add Link',
    pasteLink: 'Paste a link...',
    noLinks: 'No links saved yet',
    openInBrowser: 'Open in browser',
    copyLink: 'Copy link',
    
    // Clipboard
    clipboardPlaceholder: 'Paste your text here...',
    noClipboardItems: 'Nothing here yet',
    chars: 'characters',
    smartClipboard: 'Smart Capture',
    smartClipboardInfo: 'Automatically saves everything you copy for 2 minutes.',
    smartClipboardActivated: 'Smart Capture is now active',
    activate: 'Activate',
    deactivate: 'Deactivate',
    timeRemaining: 'left',
    
    // Links
    linkTitle: 'Title',
    linkTitlePlaceholder: 'Link name',
    
    // Notes
    notesPlaceholder: 'Start writing...',
    noteTitle: 'Title',
    noteTitlePlaceholder: 'Give your note a title (optional)',
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
    addFavoritesHint: 'Tap the heart icon to save items here',
    addedToFavorites: 'Added to favorites',
    removedFromFavorites: 'Removed from favorites',
    
    // Drag & Drop
    dragToReorder: 'Hold and drag to reorder',
    
    // Folders
    createNewFolder: 'Create new folder',
    
    // Premium
    premium: 'Premium',
    premiumActive: 'Premium Active',
    trialActive: 'Free Trial',
    trialDaysLeft: 'days remaining',
    trialExpired: 'Trial Ended',
    activationCode: 'Activation Code',
    enterActivationCode: 'Enter your code',
    codeActivated: 'Code activated successfully!',
    invalidCode: 'Invalid code',
    codeAlreadyUsed: 'This code has already been used',
    getPremium: 'Get Premium',
    restorePurchase: 'Restore Purchase',
    
    // Reminders
    setReminder: 'Reminder',
    reminderHint: 'You will receive a notification at this date and time',
    notificationPermissionDenied: 'Notification permission denied',
    reminderBody: 'You have a link to check!',
    noteReminderBody: 'You have a note to review!',
    reminderSet: 'Reminder set',
    reminderInPast: 'Date must be in the future',
    errorSchedulingReminder: 'Error creating reminder',
    
    // Validation
    titleOrUrlRequired: 'Title or URL is required',
    titleOrContentRequired: 'Title or content is required',
    
    // Links
    addLink: 'Add Link',
    urlRequired: 'URL is required',
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    backup: 'Cloud Backup',
    backupInfo: 'Your data is backed up automatically',
    version: 'Version',
    about: 'About',
    help: 'Help & Support',
    feedback: 'Send Feedback',
    rateApp: 'Rate the App',
    shareApp: 'Share with Friends',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    
    // Cloud Backup - Simple
    backup: 'Backup',
    cloudBackupInfo: 'Automatically save your data to the cloud',
    cloudBackupActivated: 'Cloud backup enabled',
    cloudBackupDeactivated: 'Cloud backup disabled',
    iCloudBackup: 'iCloud Backup',
    googleBackup: 'Google Backup',
    iCloudBackupConfirm: 'Do you accept saving your data to iCloud? This allows restoring your data when reinstalling the app or switching devices.',
    googleBackupConfirm: 'Do you accept saving your data to Google Backup? This allows restoring your data when reinstalling the app or switching devices.',
    iCloudBackupActive: 'Your data is being saved to iCloud',
    googleBackupActive: 'Your data is being saved to Google Backup',
    accept: 'Accept',
    openBackupSettings: 'Enable Backup',
    openICloudSettings: 'To ensure your data is saved, enable iCloud backup in iPhone Settings.',
    openGoogleSettings: 'To ensure your data is saved, enable backup in Android Settings.',
    later: 'Later',
    openSettings: 'Open Settings',
    general: 'General',
    
    // Notifications
    notifications: 'Notifications',
    weeklySummary: 'Weekly Digest',
    weeklySummaryInfo: 'Get a weekly reminder to review your saved content',
    dayOfWeek: 'Day',
    time: 'Time',
    selectDay: 'Select day',
    selectTime: 'Select time',
    weeklySummaryEnabled: 'Weekly digest enabled',
    weeklySummaryDisabled: 'Weekly digest disabled',
    weeklySummaryTitle: 'Memor.ia - Weekly Summary',
    weeklySummaryBody: 'You have saved links and notes to review!',
    daySaved: 'Day saved',
    notificationPermissionRequired: 'Please enable notifications in your device settings to receive weekly summaries.',
    expoGoNotSupported: 'Notifications are not supported in Expo Go. Please use the published app to enable this feature.',
    notificationError: 'Could not enable notifications. Please try again later.',
    
    // Days of week
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    
    // Messages
    copied: 'Copied!',
    saved: 'Saved!',
    deleted: 'Deleted!',
    error: 'Something went wrong',
    success: 'Success',
    pinned: 'Pinned to top',
    unpinned: 'Unpinned',
    pinToTop: 'Pin to top',
    timeSaved: 'Time saved',
    
    // Local Backup
    exportBackup: 'Export Backup',
    exportBackupInfo: 'Save all your data to a JSON file',
    importBackup: 'Import Backup',
    importBackupInfo: 'Restore data from a backup file',
    backupExported: 'Backup exported successfully!',
    backupImported: 'Backup imported successfully!',
    exportError: 'Error exporting backup',
    importError: 'Error importing backup',
    importWarning: 'This will replace all your current data. Do you want to continue?',
    invalidBackupFile: 'Invalid backup file',
    continue: 'Continue',
    sharingNotAvailable: 'Sharing not available',
    
    // Reminders
    reminder: 'Reminder',
    setReminder: 'Set Reminder',
    reminderDate: 'Date',
    reminderTime: 'Time',
    reminderLocation: 'Location',
    reminderLocationPlaceholder: 'Add a location (optional)',
    reminderEnabled: 'Reminder set',
    noDate: 'No date selected',
    noTime: 'No time selected',
    clearReminder: 'Remove Reminder',
    editItem: 'Edit',
    moveToFolder: 'Move to folder',
    
    // Empty States
    emptyLinksTitle: 'Save your first link',
    emptyLinksSubtitle: 'Paste any URL to get started',
    emptyNotesTitle: 'Create your first note',
    emptyNotesSubtitle: 'Tap the + button to start writing',
    emptyClipboardTitle: 'Your clipboard is empty',
    emptyClipboardSubtitle: 'Paste text or activate Smart Clipboard',
    emptyFavoritesTitle: 'No favorites yet',
    emptyFavoritesSubtitle: 'Tap the heart on any item to add it here',
    
    // Premium & Subscription
    subscribePremium: 'Subscribe Premium',
    subscribeToUnlock: 'Subscribe to unlock all features',
  },

  // ============================================
  // PORTUGUÊS (Portugal)
  // ============================================
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
    delete: 'Eliminar',
    edit: 'Editar',
    copy: 'Copiar',
    open: 'Abrir',
    search: 'Pesquisar...',
    all: 'Todos',
    done: 'Concluído',
    confirm: 'Confirmar',
    loading: 'A carregar...',
    
    // Folders
    allLinks: 'Todos os Links',
    allNotes: 'Todas as Notas',
    allClipboards: 'Todos',
    folders: 'Pastas',
    newFolder: 'Nova Pasta',
    editFolder: 'Editar Pasta',
    generalFolder: 'Geral',
    folderName: 'Nome da Pasta',
    folderNamePlaceholder: 'Nome da pasta',
    selectFolder: 'Escolher pasta',
    manageFolders: 'Gerir Pastas',
    folderCreated: 'Pasta criada',
    folderCreatedAndSelected: 'Pasta criada e selecionada',
    deleteFolder: 'Eliminar pasta',
    deleteFolderConfirm: 'Tens a certeza? Os itens serão movidos para a pasta Geral.',
    cannotDeleteDefault: 'Não podes eliminar a pasta padrão',
    start: 'Iniciar',
    stop: 'Parar',
    autoSaved: 'Guardado automaticamente',
    smartClipboardDeactivated: 'Captura inteligente desativada',
    deleteFolderConfirmSimple: 'Tens a certeza que queres eliminar esta pasta?',
    
    // Links
    addLink: 'Adicionar Link',
    pasteLink: 'Cola um link...',
    noLinks: 'Ainda não guardaste nenhum link',
    openInBrowser: 'Abrir no navegador',
    copyLink: 'Copiar link',
    
    // Clipboard
    clipboardPlaceholder: 'Cola o texto aqui...',
    noClipboardItems: 'Ainda não há nada aqui',
    chars: 'caracteres',
    smartClipboard: 'Captura Inteligente',
    smartClipboardInfo: 'Guarda automaticamente tudo o que copiares durante 2 minutos.',
    smartClipboardActivated: 'Captura inteligente ativada',
    activate: 'Ativar',
    deactivate: 'Desativar',
    timeRemaining: 'restante',
    
    // Links
    linkTitle: 'Título',
    linkTitlePlaceholder: 'Nome do link',
    
    // Notes
    notesPlaceholder: 'Começa a escrever...',
    noteTitle: 'Título',
    noteTitlePlaceholder: 'Dá um título à tua nota (opcional)',
    noNotes: 'Ainda não tens notas',
    newNote: 'Nova Nota',
    editNote: 'Editar Nota',
    noteColor: 'Cor',
    pinNote: 'Fixar',
    unpinNote: 'Desafixar',
    pinnedNotes: 'Fixadas',
    otherNotes: 'Notas',
    
    // Favorites
    noFavorites: 'Ainda não tens favoritos',
    addFavoritesHint: 'Toca no coração para guardar itens aqui',
    addedToFavorites: 'Adicionado aos favoritos',
    removedFromFavorites: 'Removido dos favoritos',
    
    // Drag & Drop
    dragToReorder: 'Mantém premido e arrasta para reorganizar',
    
    // Folders
    createNewFolder: 'Criar nova pasta',
    
    // Premium
    premium: 'Premium',
    premiumActive: 'Premium Ativo',
    trialActive: 'Período de Teste',
    trialDaysLeft: 'dias restantes',
    trialExpired: 'Período de Teste Terminado',
    activationCode: 'Código de Ativação',
    enterActivationCode: 'Introduz o teu código',
    codeActivated: 'Código ativado com sucesso!',
    invalidCode: 'Código inválido',
    codeAlreadyUsed: 'Este código já foi utilizado',
    getPremium: 'Obter Premium',
    restorePurchase: 'Restaurar Compra',
    
    // Reminders
    setReminder: 'Lembrete',
    reminderHint: 'Vais receber uma notificação nesta data e hora',
    notificationPermissionDenied: 'Permissão de notificações negada',
    reminderBody: 'Tens um link para ver!',
    noteReminderBody: 'Tens uma nota para rever!',
    reminderSet: 'Lembrete definido',
    reminderInPast: 'A data deve ser no futuro',
    errorSchedulingReminder: 'Erro ao criar lembrete',
    
    // Validation
    titleOrUrlRequired: 'Título ou URL é obrigatório',
    titleOrContentRequired: 'Título ou conteúdo é obrigatório',
    
    // Links
    addLink: 'Adicionar Link',
    urlRequired: 'URL é obrigatório',
    
    // Settings
    settings: 'Definições',
    language: 'Idioma',
    backup: 'Cópia de Segurança',
    backupInfo: 'Os teus dados são guardados automaticamente',
    version: 'Versão',
    about: 'Sobre',
    help: 'Ajuda e Suporte',
    feedback: 'Enviar Feedback',
    rateApp: 'Avaliar a App',
    shareApp: 'Partilhar com Amigos',
    termsOfService: 'Termos de Serviço',
    privacyPolicy: 'Política de Privacidade',
    
    // Cloud Backup - Simple
    backup: 'Cópia de Segurança',
    cloudBackupInfo: 'Guarda automaticamente os teus dados na cloud',
    cloudBackupActivated: 'Backup cloud ativado',
    cloudBackupDeactivated: 'Backup cloud desativado',
    iCloudBackup: 'Backup iCloud',
    googleBackup: 'Backup Google',
    iCloudBackupConfirm: 'Aceitas que os teus dados sejam guardados no iCloud? Isto permite restaurar os dados ao reinstalar a app ou trocar de dispositivo.',
    googleBackupConfirm: 'Aceitas que os teus dados sejam guardados no Google Backup? Isto permite restaurar os dados ao reinstalar a app ou trocar de dispositivo.',
    iCloudBackupActive: 'Os teus dados estão a ser guardados no iCloud',
    googleBackupActive: 'Os teus dados estão a ser guardados no Google Backup',
    accept: 'Aceitar',
    openBackupSettings: 'Ativar Backup',
    openICloudSettings: 'Para garantir que os teus dados são guardados, ativa o backup do iCloud nas Definições do iPhone.',
    openGoogleSettings: 'Para garantir que os teus dados são guardados, ativa o backup nas Definições do Android.',
    later: 'Mais tarde',
    openSettings: 'Abrir Definições',
    general: 'Geral',
    
    // Notifications
    notifications: 'Notificações',
    weeklySummary: 'Resumo Semanal',
    weeklySummaryInfo: 'Recebe um lembrete semanal para rever o que guardaste',
    dayOfWeek: 'Dia',
    time: 'Hora',
    selectDay: 'Selecionar dia',
    selectTime: 'Selecionar hora',
    weeklySummaryEnabled: 'Resumo semanal ativado',
    weeklySummaryDisabled: 'Resumo semanal desativado',
    weeklySummaryTitle: 'Memor.ia - Resumo Semanal',
    weeklySummaryBody: 'Tens links e notas guardados para rever!',
    daySaved: 'Dia guardado',
    notificationPermissionRequired: 'Ativa as notificações nas definições do dispositivo para receberes resumos semanais.',
    expoGoNotSupported: 'As notificações não estão disponíveis no Expo Go. Por favor, usa a app publicada para ativar esta funcionalidade.',
    notificationError: 'Não foi possível ativar as notificações. Tenta novamente mais tarde.',
    
    // Days of week
    sunday: 'Domingo',
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    
    // Messages
    copied: 'Copiado!',
    saved: 'Guardado!',
    deleted: 'Eliminado!',
    error: 'Algo correu mal',
    success: 'Sucesso',
    pinned: 'Fixado no topo',
    unpinned: 'Desafixado',
    pinToTop: 'Fixar no topo',
    timeSaved: 'Hora guardada',
    
    // Local Backup
    exportBackup: 'Exportar Backup',
    exportBackupInfo: 'Guardar todos os dados num ficheiro JSON',
    importBackup: 'Importar Backup',
    importBackupInfo: 'Restaurar dados de um ficheiro de backup',
    backupExported: 'Backup exportado com sucesso!',
    backupImported: 'Backup importado com sucesso!',
    exportError: 'Erro ao exportar backup',
    importError: 'Erro ao importar backup',
    importWarning: 'Isto irá substituir todos os seus dados atuais. Deseja continuar?',
    invalidBackupFile: 'Ficheiro de backup inválido',
    continue: 'Continuar',
    sharingNotAvailable: 'Partilha não disponível',
    
    // Reminders
    reminder: 'Lembrete',
    setReminder: 'Definir Lembrete',
    reminderDate: 'Data',
    reminderTime: 'Hora',
    reminderLocation: 'Localização',
    reminderLocationPlaceholder: 'Adicionar localização (opcional)',
    reminderEnabled: 'Lembrete definido',
    noDate: 'Sem data selecionada',
    noTime: 'Sem hora selecionada',
    clearReminder: 'Remover Lembrete',
    editItem: 'Editar',
    moveToFolder: 'Mover para pasta',
    
    // Empty States
    emptyLinksTitle: 'Guarda o teu primeiro link',
    emptyLinksSubtitle: 'Cola qualquer URL para começar',
    emptyNotesTitle: 'Cria a tua primeira nota',
    emptyNotesSubtitle: 'Toca no + para começar a escrever',
    emptyClipboardTitle: 'A área de transferência está vazia',
    emptyClipboardSubtitle: 'Cola texto ou ativa a área de transferência inteligente',
    emptyFavoritesTitle: 'Ainda não tens favoritos',
    emptyFavoritesSubtitle: 'Toca no coração em qualquer item para o adicionar aqui',
    
    // Premium & Subscription
    subscribePremium: 'Subscrever Premium',
    subscribeToUnlock: 'Subscreve para desbloquear todas as funcionalidades',
  },

  // ============================================
  // ESPAÑOL (España)
  // ============================================
  es: {
    // Tabs
    tabLinks: 'Enlaces',
    tabNotes: 'Notas',
    tabClipboard: 'Portapapeles',
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
    all: 'Todo',
    done: 'Hecho',
    confirm: 'Confirmar',
    loading: 'Cargando...',
    
    // Folders
    allLinks: 'Todos los Enlaces',
    allNotes: 'Todas las Notas',
    allClipboards: 'Todos',
    folders: 'Carpetas',
    newFolder: 'Nueva Carpeta',
    editFolder: 'Editar Carpeta',
    generalFolder: 'General',
    folderName: 'Nombre de la Carpeta',
    folderNamePlaceholder: 'Nombre de la carpeta',
    selectFolder: 'Elegir carpeta',
    manageFolders: 'Gestionar Carpetas',
    folderCreated: 'Carpeta creada',
    folderCreatedAndSelected: 'Carpeta creada y seleccionada',
    deleteFolder: 'Eliminar carpeta',
    deleteFolderConfirm: '¿Estás seguro? Los elementos se moverán a la carpeta General.',
    cannotDeleteDefault: 'No puedes eliminar la carpeta predeterminada',
    start: 'Iniciar',
    stop: 'Detener',
    autoSaved: 'Guardado automáticamente',
    smartClipboardDeactivated: 'Portapapeles inteligente desactivado',
    deleteFolderConfirmSimple: '¿Estás seguro de que quieres eliminar esta carpeta?',
    
    // Links
    addLink: 'Añadir Enlace',
    pasteLink: 'Pega un enlace...',
    noLinks: 'Aún no has guardado ningún enlace',
    openInBrowser: 'Abrir en el navegador',
    copyLink: 'Copiar enlace',
    
    // Clipboard
    clipboardPlaceholder: 'Pega tu texto aquí...',
    noClipboardItems: 'Todavía no hay nada aquí',
    chars: 'caracteres',
    smartClipboard: 'Portapapeles Inteligente',
    smartClipboardInfo: 'Guarda automáticamente todo lo que copies mientras esté activo.',
    smartClipboardActivated: 'Portapapeles inteligente activado',
    activate: 'Iniciar',
    deactivate: 'Detener',
    timeRemaining: 'restante',
    
    // Links
    linkTitle: 'Título',
    linkTitlePlaceholder: 'Nombre del enlace',
    
    // Notes
    notesPlaceholder: 'Empieza a escribir...',
    noteTitle: 'Título',
    noteTitlePlaceholder: 'Ponle un título a tu nota (opcional)',
    noNotes: 'Aún no tienes notas',
    newNote: 'Nueva Nota',
    editNote: 'Editar Nota',
    noteColor: 'Color',
    pinNote: 'Fijar',
    unpinNote: 'Desfijar',
    pinnedNotes: 'Fijadas',
    otherNotes: 'Notas',
    
    // Favorites
    noFavorites: 'Aún no tienes favoritos',
    addFavoritesHint: 'Toca el corazón para guardar elementos aquí',
    addedToFavorites: 'Añadido a favoritos',
    removedFromFavorites: 'Eliminado de favoritos',
    
    // Drag & Drop
    dragToReorder: 'Mantén pulsado y arrastra para reorganizar',
    
    // Premium
    premium: 'Premium',
    premiumActive: 'Premium Activo',
    trialActive: 'Prueba Gratuita',
    trialDaysLeft: 'días restantes',
    trialExpired: 'Prueba Finalizada',
    activationCode: 'Código de Activación',
    enterActivationCode: 'Introduce tu código',
    codeActivated: '¡Código activado con éxito!',
    invalidCode: 'Código inválido',
    codeAlreadyUsed: 'Este código ya ha sido utilizado',
    getPremium: 'Obtener Premium',
    restorePurchase: 'Restaurar Compra',
    
    // Settings
    settings: 'Ajustes',
    language: 'Idioma',
    backup: 'Copia de Seguridad',
    backupInfo: 'Tus datos se guardan automáticamente',
    version: 'Versión',
    about: 'Acerca de',
    help: 'Ayuda y Soporte',
    feedback: 'Enviar Comentarios',
    rateApp: 'Valorar la App',
    shareApp: 'Compartir con Amigos',
    termsOfService: 'Términos de Servicio',
    privacyPolicy: 'Política de Privacidad',
    
    // Cloud Backup - Simple
    backup: 'Copia de Seguridad',
    cloudBackupInfo: 'Guarda automáticamente tus datos en la nube',
    cloudBackupActivated: 'Backup en la nube activado',
    cloudBackupDeactivated: 'Backup en la nube desactivado',
    iCloudBackup: 'Backup iCloud',
    googleBackup: 'Backup Google',
    iCloudBackupConfirm: '¿Aceptas que tus datos se guarden en iCloud? Esto permite restaurar los datos al reinstalar la app o cambiar de dispositivo.',
    googleBackupConfirm: '¿Aceptas que tus datos se guarden en Google Backup? Esto permite restaurar los datos al reinstalar la app o cambiar de dispositivo.',
    iCloudBackupActive: 'Tus datos se están guardando en iCloud',
    googleBackupActive: 'Tus datos se están guardando en Google Backup',
    accept: 'Aceptar',
    openBackupSettings: 'Activar Backup',
    openICloudSettings: 'Para asegurar que tus datos se guarden, activa el backup de iCloud en los Ajustes del iPhone.',
    openGoogleSettings: 'Para asegurar que tus datos se guarden, activa el backup en los Ajustes de Android.',
    later: 'Más tarde',
    openSettings: 'Abrir Ajustes',
    general: 'General',
    
    // Notifications
    notifications: 'Notificaciones',
    weeklySummary: 'Resumen Semanal',
    weeklySummaryInfo: 'Recibe un recordatorio semanal para revisar lo que has guardado',
    dayOfWeek: 'Día',
    time: 'Hora',
    selectDay: 'Seleccionar día',
    selectTime: 'Seleccionar hora',
    weeklySummaryEnabled: 'Resumen semanal activado',
    weeklySummaryDisabled: 'Resumen semanal desactivado',
    notificationPermissionRequired: 'Activa las notificaciones en los ajustes del dispositivo para recibir resúmenes semanales.',
    expoGoNotSupported: 'Las notificaciones no están disponibles en Expo Go. Por favor, usa la app publicada para activar esta función.',
    notificationError: 'No se pudieron activar las notificaciones. Inténtalo de nuevo más tarde.',
    
    // Days of week
    sunday: 'Domingo',
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    
    // Messages
    copied: '¡Copiado!',
    saved: '¡Guardado!',
    deleted: '¡Eliminado!',
    error: 'Algo salió mal',
    success: 'Éxito',
    pinned: 'Fijado arriba',
    unpinned: 'Desfijado',
    pinToTop: 'Fijar arriba',
    
    // Reminders
    reminder: 'Recordatorio',
    setReminder: 'Crear Recordatorio',
    reminderDate: 'Fecha',
    reminderTime: 'Hora',
    reminderLocation: 'Ubicación',
    reminderLocationPlaceholder: 'Añadir ubicación (opcional)',
    reminderEnabled: 'Recordatorio creado',
    noDate: 'Sin fecha seleccionada',
    noTime: 'Sin hora seleccionada',
    clearReminder: 'Eliminar Recordatorio',
    editItem: 'Editar',
    moveToFolder: 'Mover a carpeta',
    
    // Empty States
    emptyLinksTitle: 'Guarda tu primer enlace',
    emptyLinksSubtitle: 'Pega cualquier URL para empezar',
    emptyNotesTitle: 'Crea tu primera nota',
    emptyNotesSubtitle: 'Toca el + para empezar a escribir',
    emptyClipboardTitle: 'El portapapeles está vacío',
    emptyClipboardSubtitle: 'Pega texto o activa el portapapeles inteligente',
    emptyFavoritesTitle: 'Aún no tienes favoritos',
    emptyFavoritesSubtitle: 'Toca el corazón en cualquier elemento para añadirlo aquí',
  },

  // ============================================
  // FRANÇAIS (France)
  // ============================================
  fr: {
    // Tabs
    tabLinks: 'Liens',
    tabNotes: 'Notes',
    tabClipboard: 'Presse-papiers',
    tabFavorites: 'Favoris',
    tabSettings: 'Réglages',
    
    // General
    appName: 'Memor.ia',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    copy: 'Copier',
    open: 'Ouvrir',
    search: 'Rechercher...',
    all: 'Tout',
    done: 'Terminé',
    confirm: 'Confirmer',
    loading: 'Chargement...',
    
    // Folders
    allLinks: 'Tous les Liens',
    allNotes: 'Toutes les Notes',
    allClipboards: 'Tous',
    folders: 'Dossiers',
    newFolder: 'Nouveau Dossier',
    editFolder: 'Modifier le Dossier',
    generalFolder: 'Général',
    folderName: 'Nom du Dossier',
    folderNamePlaceholder: 'Nom du dossier',
    selectFolder: 'Choisir un dossier',
    manageFolders: 'Gérer les Dossiers',
    folderCreated: 'Dossier créé',
    folderCreatedAndSelected: 'Dossier créé et sélectionné',
    deleteFolder: 'Supprimer le dossier',
    deleteFolderConfirm: 'Êtes-vous sûr ? Les éléments seront déplacés vers le dossier Général.',
    cannotDeleteDefault: 'Impossible de supprimer le dossier par défaut',
    start: 'Démarrer',
    stop: 'Arrêter',
    autoSaved: 'Sauvegardé automatiquement',
    smartClipboardDeactivated: 'Presse-papiers intelligent désactivé',
    deleteFolderConfirmSimple: 'Êtes-vous sûr de vouloir supprimer ce dossier ?',
    
    // Links
    addLink: 'Ajouter un Lien',
    pasteLink: 'Collez un lien...',
    noLinks: 'Aucun lien enregistré',
    openInBrowser: 'Ouvrir dans le navigateur',
    copyLink: 'Copier le lien',
    
    // Clipboard
    clipboardPlaceholder: 'Collez votre texte ici...',
    noClipboardItems: 'Rien ici pour le moment',
    chars: 'caractères',
    smartClipboard: 'Presse-papiers Intelligent',
    smartClipboardInfo: 'Enregistre automatiquement tout ce que vous copiez tant qu\'il est actif.',
    smartClipboardActivated: 'Presse-papiers intelligent activé',
    activate: 'Démarrer',
    deactivate: 'Arrêter',
    timeRemaining: 'restant',
    
    // Links
    linkTitle: 'Titre',
    linkTitlePlaceholder: 'Nom du lien',
    
    // Notes
    notesPlaceholder: 'Commencez à écrire...',
    noteTitle: 'Titre',
    noteTitlePlaceholder: 'Donnez un titre à votre note (facultatif)',
    noNotes: 'Aucune note pour le moment',
    newNote: 'Nouvelle Note',
    editNote: 'Modifier la Note',
    noteColor: 'Couleur',
    pinNote: 'Épingler',
    unpinNote: 'Désépingler',
    pinnedNotes: 'Épinglées',
    otherNotes: 'Notes',
    
    // Favorites
    noFavorites: 'Pas encore de favoris',
    addFavoritesHint: 'Appuyez sur le cœur pour enregistrer des éléments ici',
    addedToFavorites: 'Ajouté aux favoris',
    removedFromFavorites: 'Retiré des favoris',
    
    // Drag & Drop
    dragToReorder: 'Maintenez et glissez pour réorganiser',
    
    // Premium
    premium: 'Premium',
    premiumActive: 'Premium Actif',
    trialActive: 'Essai Gratuit',
    trialDaysLeft: 'jours restants',
    trialExpired: 'Essai Terminé',
    activationCode: 'Code d\'Activation',
    enterActivationCode: 'Entrez votre code',
    codeActivated: 'Code activé avec succès !',
    invalidCode: 'Code invalide',
    codeAlreadyUsed: 'Ce code a déjà été utilisé',
    getPremium: 'Passer Premium',
    restorePurchase: 'Restaurer l\'Achat',
    
    // Settings
    settings: 'Réglages',
    language: 'Langue',
    backup: 'Sauvegarde Cloud',
    backupInfo: 'Vos données sont sauvegardées automatiquement',
    version: 'Version',
    about: 'À propos',
    help: 'Aide et Support',
    feedback: 'Envoyer un Avis',
    rateApp: 'Noter l\'App',
    shareApp: 'Partager avec des Amis',
    termsOfService: 'Conditions d\'Utilisation',
    privacyPolicy: 'Politique de Confidentialité',
    
    // Cloud Backup - Simple
    backup: 'Sauvegarde',
    cloudBackupInfo: 'Sauvegarde automatique de vos données dans le cloud',
    cloudBackupActivated: 'Sauvegarde cloud activée',
    cloudBackupDeactivated: 'Sauvegarde cloud désactivée',
    iCloudBackup: 'Sauvegarde iCloud',
    googleBackup: 'Sauvegarde Google',
    iCloudBackupConfirm: 'Acceptez-vous que vos données soient sauvegardées sur iCloud ? Cela permet de restaurer vos données lors de la réinstallation de l\'app ou du changement d\'appareil.',
    googleBackupConfirm: 'Acceptez-vous que vos données soient sauvegardées sur Google Backup ? Cela permet de restaurer vos données lors de la réinstallation de l\'app ou du changement d\'appareil.',
    iCloudBackupActive: 'Vos données sont sauvegardées sur iCloud',
    googleBackupActive: 'Vos données sont sauvegardées sur Google Backup',
    accept: 'Accepter',
    openBackupSettings: 'Activer la Sauvegarde',
    openICloudSettings: 'Pour garantir la sauvegarde de vos données, activez la sauvegarde iCloud dans les Réglages de l\'iPhone.',
    openGoogleSettings: 'Pour garantir la sauvegarde de vos données, activez la sauvegarde dans les Paramètres Android.',
    later: 'Plus tard',
    openSettings: 'Ouvrir les Réglages',
    general: 'Général',
    
    // Notifications
    notifications: 'Notifications',
    weeklySummary: 'Récapitulatif Hebdomadaire',
    weeklySummaryInfo: 'Recevez un rappel hebdomadaire pour revoir ce que vous avez enregistré',
    dayOfWeek: 'Jour',
    time: 'Heure',
    selectDay: 'Choisir le jour',
    selectTime: 'Choisir l\'heure',
    weeklySummaryEnabled: 'Récapitulatif hebdomadaire activé',
    weeklySummaryDisabled: 'Récapitulatif hebdomadaire désactivé',
    notificationPermissionRequired: 'Veuillez activer les notifications dans les réglages de votre appareil pour recevoir les récapitulatifs hebdomadaires.',
    expoGoNotSupported: 'Les notifications ne sont pas disponibles dans Expo Go. Veuillez utiliser l\'application publiée pour activer cette fonctionnalité.',
    notificationError: 'Impossible d\'activer les notifications. Veuillez réessayer plus tard.',
    
    // Days of week
    sunday: 'Dimanche',
    monday: 'Lundi',
    tuesday: 'Mardi',
    wednesday: 'Mercredi',
    thursday: 'Jeudi',
    friday: 'Vendredi',
    saturday: 'Samedi',
    
    // Messages
    copied: 'Copié !',
    saved: 'Enregistré !',
    deleted: 'Supprimé !',
    error: 'Une erreur s\'est produite',
    success: 'Succès',
    pinned: 'Épinglé en haut',
    unpinned: 'Désépinglé',
    pinToTop: 'Épingler en haut',
    
    // Reminders
    reminder: 'Rappel',
    setReminder: 'Créer un Rappel',
    reminderDate: 'Date',
    reminderTime: 'Heure',
    reminderLocation: 'Lieu',
    reminderLocationPlaceholder: 'Ajouter un lieu (facultatif)',
    reminderEnabled: 'Rappel créé',
    noDate: 'Aucune date sélectionnée',
    noTime: 'Aucune heure sélectionnée',
    clearReminder: 'Supprimer le Rappel',
    editItem: 'Modifier',
    moveToFolder: 'Déplacer vers un dossier',
    
    // Empty States
    emptyLinksTitle: 'Enregistrez votre premier lien',
    emptyLinksSubtitle: 'Collez n\'importe quelle URL pour commencer',
    emptyNotesTitle: 'Créez votre première note',
    emptyNotesSubtitle: 'Appuyez sur + pour commencer à écrire',
    emptyClipboardTitle: 'Le presse-papiers est vide',
    emptyClipboardSubtitle: 'Collez du texte ou activez le presse-papiers intelligent',
    emptyFavoritesTitle: 'Pas encore de favoris',
    emptyFavoritesSubtitle: 'Appuyez sur le cœur sur n\'importe quel élément pour l\'ajouter ici',
  },

  // ============================================
  // DEUTSCH (Deutschland)
  // ============================================
  de: {
    // Tabs
    tabLinks: 'Links',
    tabNotes: 'Notizen',
    tabClipboard: 'Zwischenablage',
    tabFavorites: 'Favoriten',
    tabSettings: 'Einstellungen',
    
    // General
    appName: 'Memor.ia',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    copy: 'Kopieren',
    open: 'Öffnen',
    search: 'Suchen...',
    all: 'Alle',
    done: 'Fertig',
    confirm: 'Bestätigen',
    loading: 'Wird geladen...',
    
    // Folders
    allLinks: 'Alle Links',
    allNotes: 'Alle Notizen',
    allClipboards: 'Alle',
    folders: 'Ordner',
    newFolder: 'Neuer Ordner',
    editFolder: 'Ordner bearbeiten',
    generalFolder: 'Allgemein',
    folderName: 'Ordnername',
    folderNamePlaceholder: 'Ordnername',
    selectFolder: 'Ordner wählen',
    manageFolders: 'Ordner verwalten',
    folderCreated: 'Ordner erstellt',
    folderCreatedAndSelected: 'Ordner erstellt und ausgewählt',
    deleteFolder: 'Ordner löschen',
    deleteFolderConfirm: 'Bist du sicher? Elemente werden in den Ordner Allgemein verschoben.',
    cannotDeleteDefault: 'Standardordner kann nicht gelöscht werden',
    start: 'Starten',
    stop: 'Stoppen',
    autoSaved: 'Automatisch gespeichert',
    smartClipboardDeactivated: 'Intelligente Zwischenablage deaktiviert',
    deleteFolderConfirmSimple: 'Bist du sicher, dass du diesen Ordner löschen möchtest?',
    
    // Links
    addLink: 'Link hinzufügen',
    pasteLink: 'Link einfügen...',
    noLinks: 'Noch keine Links gespeichert',
    openInBrowser: 'Im Browser öffnen',
    copyLink: 'Link kopieren',
    
    // Clipboard
    clipboardPlaceholder: 'Text hier einfügen...',
    noClipboardItems: 'Noch nichts hier',
    chars: 'Zeichen',
    smartClipboard: 'Intelligente Zwischenablage',
    smartClipboardInfo: 'Speichert automatisch alles, was du kopierst, solange sie aktiv ist.',
    smartClipboardActivated: 'Intelligente Zwischenablage aktiviert',
    activate: 'Starten',
    deactivate: 'Stoppen',
    timeRemaining: 'verbleibend',
    
    // Links
    linkTitle: 'Titel',
    linkTitlePlaceholder: 'Linkname',
    
    // Notes
    notesPlaceholder: 'Beginne zu schreiben...',
    noteTitle: 'Titel',
    noteTitlePlaceholder: 'Gib deiner Notiz einen Titel (optional)',
    noNotes: 'Noch keine Notizen',
    newNote: 'Neue Notiz',
    editNote: 'Notiz bearbeiten',
    noteColor: 'Farbe',
    pinNote: 'Anheften',
    unpinNote: 'Lösen',
    pinnedNotes: 'Angeheftet',
    otherNotes: 'Notizen',
    
    // Favorites
    noFavorites: 'Noch keine Favoriten',
    addFavoritesHint: 'Tippe auf das Herz, um Elemente hier zu speichern',
    addedToFavorites: 'Zu Favoriten hinzugefügt',
    removedFromFavorites: 'Aus Favoriten entfernt',
    
    // Drag & Drop
    dragToReorder: 'Gedrückt halten und ziehen zum Neuanordnen',
    
    // Premium
    premium: 'Premium',
    premiumActive: 'Premium Aktiv',
    trialActive: 'Kostenlose Testversion',
    trialDaysLeft: 'Tage verbleibend',
    trialExpired: 'Testversion abgelaufen',
    activationCode: 'Aktivierungscode',
    enterActivationCode: 'Code eingeben',
    codeActivated: 'Code erfolgreich aktiviert!',
    invalidCode: 'Ungültiger Code',
    codeAlreadyUsed: 'Dieser Code wurde bereits verwendet',
    getPremium: 'Premium holen',
    restorePurchase: 'Kauf wiederherstellen',
    
    // Settings
    settings: 'Einstellungen',
    language: 'Sprache',
    backup: 'Cloud-Backup',
    backupInfo: 'Deine Daten werden automatisch gesichert',
    version: 'Version',
    about: 'Über',
    help: 'Hilfe & Support',
    feedback: 'Feedback senden',
    rateApp: 'App bewerten',
    shareApp: 'Mit Freunden teilen',
    termsOfService: 'Nutzungsbedingungen',
    privacyPolicy: 'Datenschutzrichtlinie',
    
    // Cloud Backup - Simple
    backup: 'Sicherung',
    cloudBackupInfo: 'Speichert deine Daten automatisch in der Cloud',
    cloudBackupActivated: 'Cloud-Backup aktiviert',
    cloudBackupDeactivated: 'Cloud-Backup deaktiviert',
    iCloudBackup: 'iCloud Backup',
    googleBackup: 'Google Backup',
    iCloudBackupConfirm: 'Akzeptierst du, dass deine Daten in iCloud gespeichert werden? Dies ermöglicht die Wiederherstellung deiner Daten bei Neuinstallation der App oder Gerätewechsel.',
    googleBackupConfirm: 'Akzeptierst du, dass deine Daten in Google Backup gespeichert werden? Dies ermöglicht die Wiederherstellung deiner Daten bei Neuinstallation der App oder Gerätewechsel.',
    iCloudBackupActive: 'Deine Daten werden in iCloud gespeichert',
    googleBackupActive: 'Deine Daten werden in Google Backup gespeichert',
    accept: 'Akzeptieren',
    openBackupSettings: 'Backup aktivieren',
    openICloudSettings: 'Um sicherzustellen, dass deine Daten gespeichert werden, aktiviere iCloud-Backup in den iPhone-Einstellungen.',
    openGoogleSettings: 'Um sicherzustellen, dass deine Daten gespeichert werden, aktiviere Backup in den Android-Einstellungen.',
    later: 'Später',
    openSettings: 'Einstellungen öffnen',
    general: 'Allgemein',
    
    // Notifications
    notifications: 'Benachrichtigungen',
    weeklySummary: 'Wöchentliche Zusammenfassung',
    weeklySummaryInfo: 'Erhalte eine wöchentliche Erinnerung, um deine gespeicherten Inhalte zu überprüfen',
    dayOfWeek: 'Tag',
    time: 'Uhrzeit',
    selectDay: 'Tag wählen',
    selectTime: 'Uhrzeit wählen',
    weeklySummaryEnabled: 'Wöchentliche Zusammenfassung aktiviert',
    weeklySummaryDisabled: 'Wöchentliche Zusammenfassung deaktiviert',
    notificationPermissionRequired: 'Bitte aktiviere Benachrichtigungen in deinen Geräteeinstellungen, um wöchentliche Zusammenfassungen zu erhalten.',
    expoGoNotSupported: 'Benachrichtigungen sind in Expo Go nicht verfügbar. Bitte verwende die veröffentlichte App, um diese Funktion zu aktivieren.',
    notificationError: 'Benachrichtigungen konnten nicht aktiviert werden. Bitte versuche es später erneut.',
    
    // Days of week
    sunday: 'Sonntag',
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    
    // Messages
    copied: 'Kopiert!',
    saved: 'Gespeichert!',
    deleted: 'Gelöscht!',
    error: 'Etwas ist schiefgelaufen',
    success: 'Erfolg',
    pinned: 'Oben angeheftet',
    unpinned: 'Losgelöst',
    pinToTop: 'Oben anheften',
    
    // Reminders
    reminder: 'Erinnerung',
    setReminder: 'Erinnerung erstellen',
    reminderDate: 'Datum',
    reminderTime: 'Uhrzeit',
    reminderLocation: 'Ort',
    reminderLocationPlaceholder: 'Ort hinzufügen (optional)',
    reminderEnabled: 'Erinnerung erstellt',
    noDate: 'Kein Datum ausgewählt',
    noTime: 'Keine Uhrzeit ausgewählt',
    clearReminder: 'Erinnerung entfernen',
    editItem: 'Bearbeiten',
    moveToFolder: 'In Ordner verschieben',
    
    // Empty States
    emptyLinksTitle: 'Speichere deinen ersten Link',
    emptyLinksSubtitle: 'Füge eine URL ein, um loszulegen',
    emptyNotesTitle: 'Erstelle deine erste Notiz',
    emptyNotesSubtitle: 'Tippe auf +, um zu schreiben',
    emptyClipboardTitle: 'Die Zwischenablage ist leer',
    emptyClipboardSubtitle: 'Füge Text ein oder aktiviere die intelligente Zwischenablage',
    emptyFavoritesTitle: 'Noch keine Favoriten',
    emptyFavoritesSubtitle: 'Tippe auf das Herz bei einem Element, um es hier hinzuzufügen',
  },

  // ============================================
  // ITALIANO (Italia)
  // ============================================
  it: {
    // Tabs
    tabLinks: 'Link',
    tabNotes: 'Note',
    tabClipboard: 'Appunti',
    tabFavorites: 'Preferiti',
    tabSettings: 'Impostazioni',
    
    // General
    appName: 'Memor.ia',
    save: 'Salva',
    cancel: 'Annulla',
    delete: 'Elimina',
    edit: 'Modifica',
    copy: 'Copia',
    open: 'Apri',
    search: 'Cerca...',
    all: 'Tutto',
    done: 'Fatto',
    confirm: 'Conferma',
    loading: 'Caricamento...',
    
    // Folders
    allLinks: 'Tutti i Link',
    allNotes: 'Tutte le Note',
    allClipboards: 'Tutti',
    folders: 'Cartelle',
    newFolder: 'Nuova Cartella',
    editFolder: 'Modifica Cartella',
    generalFolder: 'Generale',
    folderName: 'Nome della Cartella',
    folderNamePlaceholder: 'Nome della cartella',
    selectFolder: 'Scegli una cartella',
    manageFolders: 'Gestisci Cartelle',
    folderCreated: 'Cartella creata',
    folderCreatedAndSelected: 'Cartella creata e selezionata',
    deleteFolder: 'Elimina cartella',
    deleteFolderConfirm: 'Sei sicuro? Gli elementi verranno spostati nella cartella Generale.',
    cannotDeleteDefault: 'Impossibile eliminare la cartella predefinita',
    start: 'Avvia',
    stop: 'Ferma',
    autoSaved: 'Salvato automaticamente',
    smartClipboardDeactivated: 'Appunti intelligenti disattivati',
    deleteFolderConfirmSimple: 'Sei sicuro di voler eliminare questa cartella?',
    
    // Links
    addLink: 'Aggiungi Link',
    pasteLink: 'Incolla un link...',
    noLinks: 'Nessun link salvato ancora',
    openInBrowser: 'Apri nel browser',
    copyLink: 'Copia link',
    
    // Clipboard
    clipboardPlaceholder: 'Incolla il testo qui...',
    noClipboardItems: 'Ancora niente qui',
    chars: 'caratteri',
    smartClipboard: 'Appunti Intelligenti',
    smartClipboardInfo: 'Salva automaticamente tutto ciò che copi mentre è attivo.',
    smartClipboardActivated: 'Appunti intelligenti attivati',
    activate: 'Avvia',
    deactivate: 'Ferma',
    timeRemaining: 'rimanente',
    
    // Links
    linkTitle: 'Titolo',
    linkTitlePlaceholder: 'Nome del link',
    
    // Notes
    notesPlaceholder: 'Inizia a scrivere...',
    noteTitle: 'Titolo',
    noteTitlePlaceholder: 'Dai un titolo alla tua nota (opzionale)',
    noNotes: 'Nessuna nota ancora',
    newNote: 'Nuova Nota',
    editNote: 'Modifica Nota',
    noteColor: 'Colore',
    pinNote: 'Fissa',
    unpinNote: 'Rimuovi fissaggio',
    pinnedNotes: 'Fissate',
    otherNotes: 'Note',
    
    // Favorites
    noFavorites: 'Nessun preferito ancora',
    addFavoritesHint: 'Tocca il cuore per salvare elementi qui',
    addedToFavorites: 'Aggiunto ai preferiti',
    removedFromFavorites: 'Rimosso dai preferiti',
    
    // Drag & Drop
    dragToReorder: 'Tieni premuto e trascina per riordinare',
    
    // Premium
    premium: 'Premium',
    premiumActive: 'Premium Attivo',
    trialActive: 'Prova Gratuita',
    trialDaysLeft: 'giorni rimanenti',
    trialExpired: 'Prova Terminata',
    activationCode: 'Codice di Attivazione',
    enterActivationCode: 'Inserisci il tuo codice',
    codeActivated: 'Codice attivato con successo!',
    invalidCode: 'Codice non valido',
    codeAlreadyUsed: 'Questo codice è già stato utilizzato',
    getPremium: 'Passa a Premium',
    restorePurchase: 'Ripristina Acquisto',
    
    // Settings
    settings: 'Impostazioni',
    language: 'Lingua',
    backup: 'Backup Cloud',
    backupInfo: 'I tuoi dati vengono salvati automaticamente',
    version: 'Versione',
    about: 'Informazioni',
    help: 'Aiuto e Supporto',
    feedback: 'Invia Feedback',
    rateApp: 'Valuta l\'App',
    shareApp: 'Condividi con gli Amici',
    termsOfService: 'Termini di Servizio',
    privacyPolicy: 'Informativa sulla Privacy',
    
    // Cloud Backup - Simple
    backup: 'Backup',
    cloudBackupInfo: 'Salva automaticamente i tuoi dati nel cloud',
    cloudBackupActivated: 'Backup cloud attivato',
    cloudBackupDeactivated: 'Backup cloud disattivato',
    iCloudBackup: 'Backup iCloud',
    googleBackup: 'Backup Google',
    iCloudBackupConfirm: 'Accetti che i tuoi dati vengano salvati su iCloud? Questo permette di ripristinare i dati quando reinstalli l\'app o cambi dispositivo.',
    googleBackupConfirm: 'Accetti che i tuoi dati vengano salvati su Google Backup? Questo permette di ripristinare i dati quando reinstalli l\'app o cambi dispositivo.',
    iCloudBackupActive: 'I tuoi dati vengono salvati su iCloud',
    googleBackupActive: 'I tuoi dati vengono salvati su Google Backup',
    accept: 'Accetta',
    openBackupSettings: 'Attiva Backup',
    openICloudSettings: 'Per garantire che i tuoi dati vengano salvati, attiva il backup iCloud nelle Impostazioni dell\'iPhone.',
    openGoogleSettings: 'Per garantire che i tuoi dati vengano salvati, attiva il backup nelle Impostazioni Android.',
    later: 'Più tardi',
    openSettings: 'Apri Impostazioni',
    general: 'Generale',
    
    // Notifications
    notifications: 'Notifiche',
    weeklySummary: 'Riepilogo Settimanale',
    weeklySummaryInfo: 'Ricevi un promemoria settimanale per rivedere i contenuti salvati',
    dayOfWeek: 'Giorno',
    time: 'Ora',
    selectDay: 'Seleziona giorno',
    selectTime: 'Seleziona ora',
    weeklySummaryEnabled: 'Riepilogo settimanale attivato',
    weeklySummaryDisabled: 'Riepilogo settimanale disattivato',
    notificationPermissionRequired: 'Attiva le notifiche nelle impostazioni del dispositivo per ricevere i riepiloghi settimanali.',
    expoGoNotSupported: 'Le notifiche non sono disponibili in Expo Go. Per favore, usa l\'app pubblicata per attivare questa funzionalità.',
    notificationError: 'Impossibile attivare le notifiche. Riprova più tardi.',
    
    // Days of week
    sunday: 'Domenica',
    monday: 'Lunedì',
    tuesday: 'Martedì',
    wednesday: 'Mercoledì',
    thursday: 'Giovedì',
    friday: 'Venerdì',
    saturday: 'Sabato',
    
    // Messages
    copied: 'Copiato!',
    saved: 'Salvato!',
    deleted: 'Eliminato!',
    error: 'Qualcosa è andato storto',
    success: 'Successo',
    pinned: 'Fissato in alto',
    unpinned: 'Rimosso dai fissati',
    pinToTop: 'Fissa in alto',
    
    // Reminders
    reminder: 'Promemoria',
    setReminder: 'Crea Promemoria',
    reminderDate: 'Data',
    reminderTime: 'Ora',
    reminderLocation: 'Luogo',
    reminderLocationPlaceholder: 'Aggiungi un luogo (opzionale)',
    reminderEnabled: 'Promemoria creato',
    noDate: 'Nessuna data selezionata',
    noTime: 'Nessun orario selezionato',
    clearReminder: 'Rimuovi Promemoria',
    editItem: 'Modifica',
    moveToFolder: 'Sposta nella cartella',
    
    // Empty States
    emptyLinksTitle: 'Salva il tuo primo link',
    emptyLinksSubtitle: 'Incolla un URL per iniziare',
    emptyNotesTitle: 'Crea la tua prima nota',
    emptyNotesSubtitle: 'Tocca + per iniziare a scrivere',
    emptyClipboardTitle: 'Gli appunti sono vuoti',
    emptyClipboardSubtitle: 'Incolla del testo o attiva gli appunti intelligenti',
    emptyFavoritesTitle: 'Nessun preferito ancora',
    emptyFavoritesSubtitle: 'Tocca il cuore su qualsiasi elemento per aggiungerlo qui',
  },
};

/**
 * Available languages with display info
 * Total: 6 languages
 */
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'es', name: 'Spanish', nativeName: 'Español (España)', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français (France)', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch (Deutschland)', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano (Italia)', flag: '🇮🇹' },
];

/**
 * Supported language codes
 */
const SUPPORTED_LANGUAGES = ['en', 'pt', 'es', 'fr', 'de', 'it'];

/**
 * Detects the user's language from device settings
 * Falls back to English if not supported
 */
export const detectLanguage = () => {
  try {
    const locale = Localization.locale || Localization.getLocales()?.[0]?.languageCode || 'en';
    const langCode = typeof locale === 'string' ? locale.split('-')[0] : 'en';
    return SUPPORTED_LANGUAGES.includes(langCode) ? langCode : 'en';
  } catch (error) {
    console.warn('Error detecting language:', error);
    return 'en';
  }
};

/**
 * Gets the stored language preference or detects from device
 */
export const getStoredLanguage = async () => {
  try {
    const lang = await AsyncStorage.getItem('memoria-language');
    if (lang && SUPPORTED_LANGUAGES.includes(lang)) {
      return lang;
    }
    return detectLanguage();
  } catch (error) {
    return detectLanguage();
  }
};

/**
 * Saves the language preference
 */
export const setLanguage = async (lang) => {
  try {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      await AsyncStorage.setItem('memoria-language', lang);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting language:', error);
    return false;
  }
};

/**
 * Gets translation for a key with fallback
 */
export const t = (key, lang = 'en') => {
  const translation = translations[lang]?.[key];
  if (translation) return translation;
  
  // Fallback to English
  const fallback = translations.en?.[key];
  if (fallback) return fallback;
  
  // Return key as last resort
  return key;
};
