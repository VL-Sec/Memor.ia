'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const translations = {
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated',
    privacyLink: 'Privacy Policy',
    sections: [
      {
        title: '1. Acceptance of Terms',
        content: 'By downloading, installing, or using Memor.ia ("the App"), you agree to these Terms of Service. If you do not agree, please do not use the App.'
      },
      {
        title: '2. About the Service',
        content: 'Memor.ia is a personal productivity app that helps you save, organize, and manage links, notes, and text snippets on your mobile device.'
      },
      {
        title: '3. Your Account',
        content: 'The App stores your data locally and may sync with cloud services (iCloud or Google Backup) when enabled. You are responsible for keeping your device secure and protecting your data.'
      },
      {
        title: '4. Premium Features',
        content: 'Memor.ia offers a free trial and premium features that may require a purchase. Premium features and pricing may change over time.'
      },
      {
        title: '5. Your Content',
        content: 'You own everything you save in the App. We make no claim to your content. You are responsible for what you save and share.'
      },
      {
        title: '6. Acceptable Use',
        content: 'Do not use the App for illegal purposes or to store illegal content. Respect all applicable laws and regulations.'
      },
      {
        title: '7. Disclaimers',
        content: 'The App is provided "as is" without warranties. We are not responsible for data loss or any issues that may arise from using the App.'
      },
      {
        title: '8. Updates to These Terms',
        content: 'We may update these terms at any time. Continued use of the App means you accept the updated terms.'
      },
      {
        title: '9. Contact Us',
        content: 'Questions? Contact us at support@memoria-app.com'
      }
    ]
  },
  pt: {
    title: 'Termos de Serviço',
    lastUpdated: 'Última atualização',
    privacyLink: 'Política de Privacidade',
    sections: [
      {
        title: '1. Aceitação dos Termos',
        content: 'Ao descarregar, instalar ou utilizar o Memor.ia ("a App"), aceitas estes Termos de Serviço. Se não concordares, não utilizes a App.'
      },
      {
        title: '2. Sobre o Serviço',
        content: 'O Memor.ia é uma aplicação de produtividade pessoal que te ajuda a guardar, organizar e gerir links, notas e snippets de texto no teu dispositivo móvel.'
      },
      {
        title: '3. A Tua Conta',
        content: 'A App guarda os teus dados localmente e pode sincronizar com serviços cloud (iCloud ou Google Backup) quando ativado. És responsável por manter o teu dispositivo seguro e proteger os teus dados.'
      },
      {
        title: '4. Funcionalidades Premium',
        content: 'O Memor.ia oferece um período de teste gratuito e funcionalidades premium que podem requerer uma compra. As funcionalidades e preços podem mudar ao longo do tempo.'
      },
      {
        title: '5. O Teu Conteúdo',
        content: 'És o proprietário de tudo o que guardas na App. Não reivindicamos qualquer direito sobre o teu conteúdo. És responsável pelo que guardas e partilhas.'
      },
      {
        title: '6. Uso Aceitável',
        content: 'Não utilizes a App para fins ilegais ou para guardar conteúdo ilegal. Respeita todas as leis e regulamentos aplicáveis.'
      },
      {
        title: '7. Isenção de Responsabilidade',
        content: 'A App é fornecida "tal como está" sem garantias. Não somos responsáveis por perda de dados ou quaisquer problemas que possam surgir da utilização da App.'
      },
      {
        title: '8. Atualizações a Estes Termos',
        content: 'Podemos atualizar estes termos a qualquer momento. A continuação do uso da App significa que aceitas os termos atualizados.'
      },
      {
        title: '9. Contacta-nos',
        content: 'Dúvidas? Contacta-nos em support@memoria-app.com'
      }
    ]
  },
  es: {
    title: 'Términos de Servicio',
    lastUpdated: 'Última actualización',
    privacyLink: 'Política de Privacidad',
    sections: [
      {
        title: '1. Aceptación de los Términos',
        content: 'Al descargar, instalar o usar Memor.ia ("la App"), aceptas estos Términos de Servicio. Si no estás de acuerdo, no uses la App.'
      },
      {
        title: '2. Sobre el Servicio',
        content: 'Memor.ia es una aplicación de productividad personal que te ayuda a guardar, organizar y gestionar enlaces, notas y fragmentos de texto en tu dispositivo móvil.'
      },
      {
        title: '3. Tu Cuenta',
        content: 'La App almacena tus datos localmente y puede sincronizar con servicios en la nube (iCloud o Google Backup) cuando está activado. Eres responsable de mantener tu dispositivo seguro y proteger tus datos.'
      },
      {
        title: '4. Funciones Premium',
        content: 'Memor.ia ofrece una prueba gratuita y funciones premium que pueden requerir una compra. Las funciones y precios pueden cambiar con el tiempo.'
      },
      {
        title: '5. Tu Contenido',
        content: 'Eres el propietario de todo lo que guardas en la App. No reclamamos ningún derecho sobre tu contenido. Eres responsable de lo que guardas y compartes.'
      },
      {
        title: '6. Uso Aceptable',
        content: 'No uses la App para fines ilegales ni para almacenar contenido ilegal. Respeta todas las leyes y regulaciones aplicables.'
      },
      {
        title: '7. Exención de Responsabilidad',
        content: 'La App se proporciona "tal cual" sin garantías. No somos responsables de la pérdida de datos ni de cualquier problema que pueda surgir del uso de la App.'
      },
      {
        title: '8. Actualizaciones de Estos Términos',
        content: 'Podemos actualizar estos términos en cualquier momento. El uso continuado de la App significa que aceptas los términos actualizados.'
      },
      {
        title: '9. Contáctanos',
        content: '¿Preguntas? Contáctanos en support@memoria-app.com'
      }
    ]
  },
  fr: {
    title: 'Conditions d\'Utilisation',
    lastUpdated: 'Dernière mise à jour',
    privacyLink: 'Politique de Confidentialité',
    sections: [
      {
        title: '1. Acceptation des Conditions',
        content: 'En téléchargeant, installant ou utilisant Memor.ia ("l\'Application"), vous acceptez ces Conditions d\'Utilisation. Si vous n\'êtes pas d\'accord, n\'utilisez pas l\'Application.'
      },
      {
        title: '2. À Propos du Service',
        content: 'Memor.ia est une application de productivité personnelle qui vous aide à enregistrer, organiser et gérer des liens, des notes et des extraits de texte sur votre appareil mobile.'
      },
      {
        title: '3. Votre Compte',
        content: 'L\'Application stocke vos données localement et peut les synchroniser avec les services cloud (iCloud ou Google Backup) lorsque cette option est activée. Vous êtes responsable de la sécurité de votre appareil et de la protection de vos données.'
      },
      {
        title: '4. Fonctionnalités Premium',
        content: 'Memor.ia propose un essai gratuit et des fonctionnalités premium qui peuvent nécessiter un achat. Les fonctionnalités et les prix peuvent évoluer.'
      },
      {
        title: '5. Votre Contenu',
        content: 'Vous êtes propriétaire de tout ce que vous enregistrez dans l\'Application. Nous ne revendiquons aucun droit sur votre contenu. Vous êtes responsable de ce que vous enregistrez et partagez.'
      },
      {
        title: '6. Utilisation Acceptable',
        content: 'N\'utilisez pas l\'Application à des fins illégales ni pour stocker du contenu illégal. Respectez toutes les lois et réglementations applicables.'
      },
      {
        title: '7. Avertissement',
        content: 'L\'Application est fournie "telle quelle" sans garantie. Nous ne sommes pas responsables de la perte de données ou de tout problème pouvant résulter de l\'utilisation de l\'Application.'
      },
      {
        title: '8. Mises à Jour de Ces Conditions',
        content: 'Nous pouvons mettre à jour ces conditions à tout moment. L\'utilisation continue de l\'Application signifie que vous acceptez les conditions mises à jour.'
      },
      {
        title: '9. Nous Contacter',
        content: 'Des questions ? Contactez-nous à support@memoria-app.com'
      }
    ]
  },
  de: {
    title: 'Nutzungsbedingungen',
    lastUpdated: 'Letzte Aktualisierung',
    privacyLink: 'Datenschutzrichtlinie',
    sections: [
      {
        title: '1. Annahme der Bedingungen',
        content: 'Durch das Herunterladen, Installieren oder Verwenden von Memor.ia ("die App") stimmst du diesen Nutzungsbedingungen zu. Wenn du nicht einverstanden bist, nutze die App nicht.'
      },
      {
        title: '2. Über den Dienst',
        content: 'Memor.ia ist eine persönliche Produktivitäts-App, die dir hilft, Links, Notizen und Textausschnitte auf deinem Mobilgerät zu speichern, zu organisieren und zu verwalten.'
      },
      {
        title: '3. Dein Konto',
        content: 'Die App speichert deine Daten lokal und kann mit Cloud-Diensten (iCloud oder Google Backup) synchronisieren, wenn diese aktiviert sind. Du bist für die Sicherheit deines Geräts und den Schutz deiner Daten verantwortlich.'
      },
      {
        title: '4. Premium-Funktionen',
        content: 'Memor.ia bietet eine kostenlose Testversion und Premium-Funktionen, die einen Kauf erfordern können. Funktionen und Preise können sich ändern.'
      },
      {
        title: '5. Deine Inhalte',
        content: 'Du bist Eigentümer von allem, was du in der App speicherst. Wir erheben keinen Anspruch auf deine Inhalte. Du bist für das verantwortlich, was du speicherst und teilst.'
      },
      {
        title: '6. Akzeptable Nutzung',
        content: 'Verwende die App nicht für illegale Zwecke oder um illegale Inhalte zu speichern. Halte dich an alle geltenden Gesetze und Vorschriften.'
      },
      {
        title: '7. Haftungsausschluss',
        content: 'Die App wird "wie besehen" ohne Garantien bereitgestellt. Wir sind nicht verantwortlich für Datenverlust oder Probleme, die durch die Nutzung der App entstehen können.'
      },
      {
        title: '8. Aktualisierungen dieser Bedingungen',
        content: 'Wir können diese Bedingungen jederzeit aktualisieren. Die fortgesetzte Nutzung der App bedeutet, dass du die aktualisierten Bedingungen akzeptierst.'
      },
      {
        title: '9. Kontaktiere uns',
        content: 'Fragen? Kontaktiere uns unter support@memoria-app.com'
      }
    ]
  },
  it: {
    title: 'Termini di Servizio',
    lastUpdated: 'Ultimo aggiornamento',
    privacyLink: 'Informativa sulla Privacy',
    sections: [
      {
        title: '1. Accettazione dei Termini',
        content: 'Scaricando, installando o utilizzando Memor.ia ("l\'App"), accetti questi Termini di Servizio. Se non sei d\'accordo, non utilizzare l\'App.'
      },
      {
        title: '2. Informazioni sul Servizio',
        content: 'Memor.ia è un\'app di produttività personale che ti aiuta a salvare, organizzare e gestire link, note e frammenti di testo sul tuo dispositivo mobile.'
      },
      {
        title: '3. Il Tuo Account',
        content: 'L\'App memorizza i tuoi dati localmente e può sincronizzarsi con i servizi cloud (iCloud o Google Backup) quando abilitato. Sei responsabile della sicurezza del tuo dispositivo e della protezione dei tuoi dati.'
      },
      {
        title: '4. Funzionalità Premium',
        content: 'Memor.ia offre una prova gratuita e funzionalità premium che potrebbero richiedere un acquisto. Le funzionalità e i prezzi possono cambiare nel tempo.'
      },
      {
        title: '5. I Tuoi Contenuti',
        content: 'Sei proprietario di tutto ciò che salvi nell\'App. Non rivendichiamo alcun diritto sui tuoi contenuti. Sei responsabile di ciò che salvi e condividi.'
      },
      {
        title: '6. Uso Accettabile',
        content: 'Non utilizzare l\'App per scopi illegali o per memorizzare contenuti illegali. Rispetta tutte le leggi e i regolamenti applicabili.'
      },
      {
        title: '7. Esclusione di Responsabilità',
        content: 'L\'App viene fornita "così com\'è" senza garanzie. Non siamo responsabili per la perdita di dati o per eventuali problemi derivanti dall\'uso dell\'App.'
      },
      {
        title: '8. Aggiornamenti di Questi Termini',
        content: 'Possiamo aggiornare questi termini in qualsiasi momento. L\'uso continuato dell\'App significa che accetti i termini aggiornati.'
      },
      {
        title: '9. Contattaci',
        content: 'Domande? Contattaci a support@memoria-app.com'
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

export default function TermsPage() {
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
          <Link href={`/privacy?lang=${lang}`} className="text-blue-400 hover:text-blue-300 transition-colors">
            {t.privacyLink}
          </Link>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span className="text-gray-400">© 2025 Memor.ia</span>
        </div>
      </div>
    </div>
  );
}
