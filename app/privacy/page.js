'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const translations = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated',
    termsLink: 'Terms of Service',
    sections: [
      {
        title: '1. What We Collect',
        content: 'Memor.ia stores the following data locally on your device: links you save, notes and clipboard content, folder organization, and app settings. This data may be backed up through your device\'s native cloud service (iCloud or Google Backup).'
      },
      {
        title: '2. How We Use Your Data',
        content: 'Your data is used only to provide the app\'s core features: displaying and organizing your saved content, enabling search, managing your preferences, and syncing across devices when cloud backup is enabled.'
      },
      {
        title: '3. Where Your Data Lives',
        content: 'All your content stays on your device. We cannot access your saved links, notes, or clipboard items. If you enable cloud backup, your data may also be stored on Apple\'s or Google\'s servers per their privacy policies.'
      },
      {
        title: '4. Data Sharing',
        content: 'We do not sell, trade, or share your personal information. Your data stays on your device and under your control.'
      },
      {
        title: '5. Analytics',
        content: 'We may collect anonymous usage data to improve the app, such as crash reports and general performance metrics. Your personal content is never included.'
      },
      {
        title: '6. Third-Party Services',
        content: 'The app may use third-party services for features like link previews. These services only receive the minimum data needed to work.'
      },
      {
        title: '7. Security',
        content: 'We use industry-standard security practices to protect your data. However, no system is 100% secure.'
      },
      {
        title: '8. Your Rights',
        content: 'You have full control over your data. Export, delete, or modify your content anytime through the app. Uninstalling removes all local data.'
      },
      {
        title: '9. Children',
        content: 'This app is not intended for children under 13. We do not knowingly collect data from children.'
      },
      {
        title: '10. Policy Updates',
        content: 'We may update this policy occasionally. Check this page for the latest version.'
      },
      {
        title: '11. Contact',
        content: 'Questions about privacy? Email us at privacy@memoria-app.com'
      }
    ]
  },
  pt: {
    title: 'Política de Privacidade',
    lastUpdated: 'Última atualização',
    termsLink: 'Termos de Serviço',
    sections: [
      {
        title: '1. O Que Recolhemos',
        content: 'O Memor.ia guarda os seguintes dados localmente no teu dispositivo: links que guardas, notas e conteúdo da área de transferência, organização de pastas e definições da app. Estes dados podem ser guardados através do serviço de cloud nativo do teu dispositivo (iCloud ou Google Backup).'
      },
      {
        title: '2. Como Usamos os Teus Dados',
        content: 'Os teus dados são usados apenas para fornecer as funcionalidades principais da app: mostrar e organizar o teu conteúdo guardado, permitir pesquisa, gerir as tuas preferências e sincronizar entre dispositivos quando a cópia de segurança na cloud está ativada.'
      },
      {
        title: '3. Onde os Teus Dados Estão',
        content: 'Todo o teu conteúdo permanece no teu dispositivo. Não conseguimos aceder aos teus links guardados, notas ou itens da área de transferência. Se ativares a cópia de segurança na cloud, os teus dados também podem ser armazenados nos servidores da Apple ou da Google conforme as suas políticas de privacidade.'
      },
      {
        title: '4. Partilha de Dados',
        content: 'Não vendemos, trocamos ou partilhamos as tuas informações pessoais. Os teus dados permanecem no teu dispositivo e sob o teu controlo.'
      },
      {
        title: '5. Análises',
        content: 'Podemos recolher dados de utilização anónimos para melhorar a app, como relatórios de falhas e métricas gerais de desempenho. O teu conteúdo pessoal nunca é incluído.'
      },
      {
        title: '6. Serviços de Terceiros',
        content: 'A app pode usar serviços de terceiros para funcionalidades como pré-visualizações de links. Estes serviços recebem apenas os dados mínimos necessários para funcionar.'
      },
      {
        title: '7. Segurança',
        content: 'Usamos práticas de segurança padrão da indústria para proteger os teus dados. No entanto, nenhum sistema é 100% seguro.'
      },
      {
        title: '8. Os Teus Direitos',
        content: 'Tens controlo total sobre os teus dados. Exporta, elimina ou modifica o teu conteúdo a qualquer momento através da app. Desinstalar remove todos os dados locais.'
      },
      {
        title: '9. Crianças',
        content: 'Esta app não se destina a crianças com menos de 13 anos. Não recolhemos conscientemente dados de crianças.'
      },
      {
        title: '10. Atualizações da Política',
        content: 'Podemos atualizar esta política ocasionalmente. Consulta esta página para a versão mais recente.'
      },
      {
        title: '11. Contacto',
        content: 'Dúvidas sobre privacidade? Envia-nos um email para privacy@memoria-app.com'
      }
    ]
  },
  es: {
    title: 'Política de Privacidad',
    lastUpdated: 'Última actualización',
    termsLink: 'Términos de Servicio',
    sections: [
      {
        title: '1. Qué Recopilamos',
        content: 'Memor.ia almacena los siguientes datos localmente en tu dispositivo: enlaces que guardas, notas y contenido del portapapeles, organización de carpetas y ajustes de la app. Estos datos pueden respaldarse a través del servicio de nube nativo de tu dispositivo (iCloud o Google Backup).'
      },
      {
        title: '2. Cómo Usamos Tus Datos',
        content: 'Tus datos se usan solo para proporcionar las funciones principales de la app: mostrar y organizar tu contenido guardado, habilitar la búsqueda, gestionar tus preferencias y sincronizar entre dispositivos cuando la copia de seguridad en la nube está activada.'
      },
      {
        title: '3. Dónde Están Tus Datos',
        content: 'Todo tu contenido permanece en tu dispositivo. No podemos acceder a tus enlaces guardados, notas o elementos del portapapeles. Si activas la copia de seguridad en la nube, tus datos también pueden almacenarse en los servidores de Apple o Google según sus políticas de privacidad.'
      },
      {
        title: '4. Compartir Datos',
        content: 'No vendemos, intercambiamos ni compartimos tu información personal. Tus datos permanecen en tu dispositivo y bajo tu control.'
      },
      {
        title: '5. Análisis',
        content: 'Podemos recopilar datos de uso anónimos para mejorar la app, como informes de fallos y métricas generales de rendimiento. Tu contenido personal nunca se incluye.'
      },
      {
        title: '6. Servicios de Terceros',
        content: 'La app puede usar servicios de terceros para funciones como vistas previas de enlaces. Estos servicios solo reciben los datos mínimos necesarios para funcionar.'
      },
      {
        title: '7. Seguridad',
        content: 'Usamos prácticas de seguridad estándar de la industria para proteger tus datos. Sin embargo, ningún sistema es 100% seguro.'
      },
      {
        title: '8. Tus Derechos',
        content: 'Tienes control total sobre tus datos. Exporta, elimina o modifica tu contenido en cualquier momento a través de la app. Desinstalar elimina todos los datos locales.'
      },
      {
        title: '9. Niños',
        content: 'Esta app no está destinada a niños menores de 13 años. No recopilamos conscientemente datos de niños.'
      },
      {
        title: '10. Actualizaciones de la Política',
        content: 'Podemos actualizar esta política ocasionalmente. Consulta esta página para la versión más reciente.'
      },
      {
        title: '11. Contacto',
        content: '¿Preguntas sobre privacidad? Envíanos un email a privacy@memoria-app.com'
      }
    ]
  },
  fr: {
    title: 'Politique de Confidentialité',
    lastUpdated: 'Dernière mise à jour',
    termsLink: 'Conditions d\'Utilisation',
    sections: [
      {
        title: '1. Ce Que Nous Collectons',
        content: 'Memor.ia stocke les données suivantes localement sur votre appareil : liens enregistrés, notes et contenu du presse-papiers, organisation des dossiers et paramètres de l\'app. Ces données peuvent être sauvegardées via le service cloud natif de votre appareil (iCloud ou Google Backup).'
      },
      {
        title: '2. Comment Nous Utilisons Vos Données',
        content: 'Vos données sont utilisées uniquement pour fournir les fonctionnalités principales de l\'app : afficher et organiser votre contenu enregistré, activer la recherche, gérer vos préférences et synchroniser entre appareils lorsque la sauvegarde cloud est activée.'
      },
      {
        title: '3. Où Se Trouvent Vos Données',
        content: 'Tout votre contenu reste sur votre appareil. Nous ne pouvons pas accéder à vos liens enregistrés, notes ou éléments du presse-papiers. Si vous activez la sauvegarde cloud, vos données peuvent également être stockées sur les serveurs d\'Apple ou de Google selon leurs politiques de confidentialité.'
      },
      {
        title: '4. Partage des Données',
        content: 'Nous ne vendons, n\'échangeons ni ne partageons vos informations personnelles. Vos données restent sur votre appareil et sous votre contrôle.'
      },
      {
        title: '5. Analyses',
        content: 'Nous pouvons collecter des données d\'utilisation anonymes pour améliorer l\'app, comme des rapports de plantage et des métriques générales de performance. Votre contenu personnel n\'est jamais inclus.'
      },
      {
        title: '6. Services Tiers',
        content: 'L\'app peut utiliser des services tiers pour des fonctionnalités comme les aperçus de liens. Ces services ne reçoivent que les données minimales nécessaires à leur fonctionnement.'
      },
      {
        title: '7. Sécurité',
        content: 'Nous utilisons des pratiques de sécurité standard de l\'industrie pour protéger vos données. Cependant, aucun système n\'est sécurisé à 100%.'
      },
      {
        title: '8. Vos Droits',
        content: 'Vous avez un contrôle total sur vos données. Exportez, supprimez ou modifiez votre contenu à tout moment via l\'app. La désinstallation supprime toutes les données locales.'
      },
      {
        title: '9. Enfants',
        content: 'Cette app n\'est pas destinée aux enfants de moins de 13 ans. Nous ne collectons pas sciemment de données d\'enfants.'
      },
      {
        title: '10. Mises à Jour de la Politique',
        content: 'Nous pouvons mettre à jour cette politique occasionnellement. Consultez cette page pour la version la plus récente.'
      },
      {
        title: '11. Contact',
        content: 'Des questions sur la confidentialité ? Envoyez-nous un email à privacy@memoria-app.com'
      }
    ]
  },
  de: {
    title: 'Datenschutzrichtlinie',
    lastUpdated: 'Letzte Aktualisierung',
    termsLink: 'Nutzungsbedingungen',
    sections: [
      {
        title: '1. Was Wir Erheben',
        content: 'Memor.ia speichert die folgenden Daten lokal auf deinem Gerät: gespeicherte Links, Notizen und Zwischenablage-Inhalte, Ordnerorganisation und App-Einstellungen. Diese Daten können über den nativen Cloud-Dienst deines Geräts (iCloud oder Google Backup) gesichert werden.'
      },
      {
        title: '2. Wie Wir Deine Daten Nutzen',
        content: 'Deine Daten werden nur verwendet, um die Kernfunktionen der App bereitzustellen: Anzeigen und Organisieren deiner gespeicherten Inhalte, Ermöglichen der Suche, Verwalten deiner Einstellungen und Synchronisieren zwischen Geräten, wenn Cloud-Backup aktiviert ist.'
      },
      {
        title: '3. Wo Deine Daten Sind',
        content: 'Alle deine Inhalte bleiben auf deinem Gerät. Wir können nicht auf deine gespeicherten Links, Notizen oder Zwischenablage-Elemente zugreifen. Wenn du Cloud-Backup aktivierst, können deine Daten auch auf Servern von Apple oder Google gemäß deren Datenschutzrichtlinien gespeichert werden.'
      },
      {
        title: '4. Datenweitergabe',
        content: 'Wir verkaufen, tauschen oder teilen deine persönlichen Informationen nicht. Deine Daten bleiben auf deinem Gerät und unter deiner Kontrolle.'
      },
      {
        title: '5. Analysen',
        content: 'Wir können anonyme Nutzungsdaten erheben, um die App zu verbessern, wie Absturzberichte und allgemeine Leistungsmetriken. Deine persönlichen Inhalte sind niemals enthalten.'
      },
      {
        title: '6. Drittanbieter-Dienste',
        content: 'Die App kann Drittanbieter-Dienste für Funktionen wie Link-Vorschauen nutzen. Diese Dienste erhalten nur die minimal notwendigen Daten.'
      },
      {
        title: '7. Sicherheit',
        content: 'Wir verwenden branchenübliche Sicherheitspraktiken zum Schutz deiner Daten. Allerdings ist kein System zu 100% sicher.'
      },
      {
        title: '8. Deine Rechte',
        content: 'Du hast die volle Kontrolle über deine Daten. Exportiere, lösche oder bearbeite deine Inhalte jederzeit über die App. Eine Deinstallation entfernt alle lokalen Daten.'
      },
      {
        title: '9. Kinder',
        content: 'Diese App ist nicht für Kinder unter 13 Jahren bestimmt. Wir erheben wissentlich keine Daten von Kindern.'
      },
      {
        title: '10. Richtlinien-Updates',
        content: 'Wir können diese Richtlinie gelegentlich aktualisieren. Prüfe diese Seite für die neueste Version.'
      },
      {
        title: '11. Kontakt',
        content: 'Fragen zum Datenschutz? Schreib uns eine E-Mail an privacy@memoria-app.com'
      }
    ]
  },
  it: {
    title: 'Informativa sulla Privacy',
    lastUpdated: 'Ultimo aggiornamento',
    termsLink: 'Termini di Servizio',
    sections: [
      {
        title: '1. Cosa Raccogliamo',
        content: 'Memor.ia memorizza i seguenti dati localmente sul tuo dispositivo: link salvati, note e contenuto degli appunti, organizzazione delle cartelle e impostazioni dell\'app. Questi dati possono essere sottoposti a backup tramite il servizio cloud nativo del tuo dispositivo (iCloud o Google Backup).'
      },
      {
        title: '2. Come Usiamo i Tuoi Dati',
        content: 'I tuoi dati vengono utilizzati solo per fornire le funzionalità principali dell\'app: visualizzare e organizzare i contenuti salvati, abilitare la ricerca, gestire le tue preferenze e sincronizzare tra dispositivi quando il backup cloud è abilitato.'
      },
      {
        title: '3. Dove Sono i Tuoi Dati',
        content: 'Tutti i tuoi contenuti rimangono sul tuo dispositivo. Non possiamo accedere ai tuoi link salvati, note o elementi degli appunti. Se abiliti il backup cloud, i tuoi dati potrebbero anche essere memorizzati sui server di Apple o Google secondo le loro politiche sulla privacy.'
      },
      {
        title: '4. Condivisione dei Dati',
        content: 'Non vendiamo, scambiamo o condividiamo le tue informazioni personali. I tuoi dati rimangono sul tuo dispositivo e sotto il tuo controllo.'
      },
      {
        title: '5. Analisi',
        content: 'Potremmo raccogliere dati di utilizzo anonimi per migliorare l\'app, come rapporti di crash e metriche generali di prestazione. I tuoi contenuti personali non sono mai inclusi.'
      },
      {
        title: '6. Servizi di Terze Parti',
        content: 'L\'app potrebbe utilizzare servizi di terze parti per funzionalità come le anteprime dei link. Questi servizi ricevono solo i dati minimi necessari per funzionare.'
      },
      {
        title: '7. Sicurezza',
        content: 'Utilizziamo pratiche di sicurezza standard del settore per proteggere i tuoi dati. Tuttavia, nessun sistema è sicuro al 100%.'
      },
      {
        title: '8. I Tuoi Diritti',
        content: 'Hai il pieno controllo sui tuoi dati. Esporta, elimina o modifica i tuoi contenuti in qualsiasi momento tramite l\'app. La disinstallazione rimuove tutti i dati locali.'
      },
      {
        title: '9. Bambini',
        content: 'Questa app non è destinata ai bambini di età inferiore ai 13 anni. Non raccogliamo consapevolmente dati dai bambini.'
      },
      {
        title: '10. Aggiornamenti della Policy',
        content: 'Potremmo aggiornare questa policy occasionalmente. Controlla questa pagina per la versione più recente.'
      },
      {
        title: '11. Contatti',
        content: 'Domande sulla privacy? Scrivici a privacy@memoria-app.com'
      }
    ]
  }
};

const langNames = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano'
};

export default function PrivacyPage() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam && translations[langParam]) {
      setLang(langParam);
    } else {
      const browserLang = navigator.language?.split('-')[0];
      if (browserLang && translations[browserLang]) {
        setLang(browserLang);
      }
    }
  }, [searchParams]);

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Language Selector */}
        <div className="flex flex-wrap justify-end gap-2 mb-8">
          {Object.keys(translations).map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                lang === code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {langNames[code]}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold">M</span>
            </div>
            <h1 className="text-4xl font-bold">{t.title}</h1>
          </div>
          <p className="text-gray-400">{t.lastUpdated}: January 7, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {t.sections.map((section, index) => (
            <div key={index} className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-3 text-blue-400">{section.title}</h2>
              <p className="text-gray-300 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link href={`/terms?lang=${lang}`} className="text-blue-400 hover:text-blue-300 transition-colors">
            {t.termsLink}
          </Link>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span className="text-gray-400">© 2025 Memor.ia</span>
        </div>
      </div>
    </div>
  );
}
