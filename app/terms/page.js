'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const translations = {
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated',
    sections: [
      {
        title: '1. Acceptance of Terms',
        content: 'By downloading, installing, or using Memor.ia ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.'
      },
      {
        title: '2. Description of Service',
        content: 'Memor.ia is a personal link and snippet manager application that allows users to save, organize, and manage links, notes, and clipboard content on their mobile devices.'
      },
      {
        title: '3. User Account',
        content: 'The App stores data locally on your device and may sync with cloud services (iCloud/Google Backup) if enabled. You are responsible for maintaining the security of your device and any data stored within the App.'
      },
      {
        title: '4. Premium Features',
        content: 'Memor.ia offers a free trial period and premium features that may require a one-time purchase or subscription. Premium features are subject to availability and may change over time.'
      },
      {
        title: '5. User Content',
        content: 'You retain ownership of all content you save in the App. We do not claim any intellectual property rights over your content. You are solely responsible for the content you save and share.'
      },
      {
        title: '6. Prohibited Uses',
        content: 'You agree not to use the App for any illegal purposes, to store illegal content, or to violate any applicable laws or regulations.'
      },
      {
        title: '7. Limitation of Liability',
        content: 'The App is provided "as is" without warranties of any kind. We are not liable for any data loss, damages, or issues arising from the use of the App.'
      },
      {
        title: '8. Changes to Terms',
        content: 'We reserve the right to modify these terms at any time. Continued use of the App after changes constitutes acceptance of the new terms.'
      },
      {
        title: '9. Contact',
        content: 'For questions about these Terms of Service, please contact us at support@memoria-app.com'
      }
    ]
  },
  pt: {
    title: 'Termos de Serviço',
    lastUpdated: 'Última atualização',
    sections: [
      {
        title: '1. Aceitação dos Termos',
        content: 'Ao descarregar, instalar ou utilizar o Memor.ia ("a App"), concorda em ficar vinculado a estes Termos de Serviço. Se não concordar com estes termos, por favor não utilize a App.'
      },
      {
        title: '2. Descrição do Serviço',
        content: 'O Memor.ia é uma aplicação de gestão pessoal de links e snippets que permite aos utilizadores guardar, organizar e gerir links, notas e conteúdo do clipboard nos seus dispositivos móveis.'
      },
      {
        title: '3. Conta de Utilizador',
        content: 'A App armazena dados localmente no seu dispositivo e pode sincronizar com serviços cloud (iCloud/Google Backup) se ativado. É responsável por manter a segurança do seu dispositivo e quaisquer dados armazenados na App.'
      },
      {
        title: '4. Funcionalidades Premium',
        content: 'O Memor.ia oferece um período de teste gratuito e funcionalidades premium que podem requerer uma compra única ou subscrição. As funcionalidades premium estão sujeitas a disponibilidade e podem mudar ao longo do tempo.'
      },
      {
        title: '5. Conteúdo do Utilizador',
        content: 'Mantém a propriedade de todo o conteúdo que guarda na App. Não reivindicamos quaisquer direitos de propriedade intelectual sobre o seu conteúdo. É o único responsável pelo conteúdo que guarda e partilha.'
      },
      {
        title: '6. Usos Proibidos',
        content: 'Concorda em não utilizar a App para fins ilegais, armazenar conteúdo ilegal ou violar quaisquer leis ou regulamentos aplicáveis.'
      },
      {
        title: '7. Limitação de Responsabilidade',
        content: 'A App é fornecida "como está" sem garantias de qualquer tipo. Não somos responsáveis por qualquer perda de dados, danos ou problemas decorrentes da utilização da App.'
      },
      {
        title: '8. Alterações aos Termos',
        content: 'Reservamo-nos o direito de modificar estes termos a qualquer momento. A utilização continuada da App após alterações constitui aceitação dos novos termos.'
      },
      {
        title: '9. Contacto',
        content: 'Para questões sobre estes Termos de Serviço, contacte-nos em support@memoria-app.com'
      }
    ]
  },
  es: {
    title: 'Términos de Servicio',
    lastUpdated: 'Última actualización',
    sections: [
      {
        title: '1. Aceptación de los Términos',
        content: 'Al descargar, instalar o usar Memor.ia ("la App"), acepta quedar vinculado por estos Términos de Servicio. Si no está de acuerdo con estos términos, por favor no use la App.'
      },
      {
        title: '2. Descripción del Servicio',
        content: 'Memor.ia es una aplicación de gestión personal de enlaces y snippets que permite a los usuarios guardar, organizar y gestionar enlaces, notas y contenido del portapapeles en sus dispositivos móviles.'
      },
      {
        title: '3. Cuenta de Usuario',
        content: 'La App almacena datos localmente en su dispositivo y puede sincronizar con servicios en la nube (iCloud/Google Backup) si está habilitado. Es responsable de mantener la seguridad de su dispositivo y cualquier dato almacenado en la App.'
      },
      {
        title: '4. Funciones Premium',
        content: 'Memor.ia ofrece un período de prueba gratuito y funciones premium que pueden requerir una compra única o suscripción. Las funciones premium están sujetas a disponibilidad y pueden cambiar con el tiempo.'
      },
      {
        title: '5. Contenido del Usuario',
        content: 'Conserva la propiedad de todo el contenido que guarda en la App. No reclamamos ningún derecho de propiedad intelectual sobre su contenido. Es el único responsable del contenido que guarda y comparte.'
      },
      {
        title: '6. Usos Prohibidos',
        content: 'Acepta no usar la App para fines ilegales, almacenar contenido ilegal o violar cualquier ley o regulación aplicable.'
      },
      {
        title: '7. Limitación de Responsabilidad',
        content: 'La App se proporciona "tal cual" sin garantías de ningún tipo. No somos responsables de ninguna pérdida de datos, daños o problemas derivados del uso de la App.'
      },
      {
        title: '8. Cambios en los Términos',
        content: 'Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado de la App después de los cambios constituye la aceptación de los nuevos términos.'
      },
      {
        title: '9. Contacto',
        content: 'Para preguntas sobre estos Términos de Servicio, contáctenos en support@memoria-app.com'
      }
    ]
  },
  fr: {
    title: 'Conditions d\'Utilisation',
    lastUpdated: 'Dernière mise à jour',
    sections: [
      {
        title: '1. Acceptation des Conditions',
        content: 'En téléchargeant, installant ou utilisant Memor.ia ("l\'Application"), vous acceptez d\'être lié par ces Conditions d\'Utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser l\'Application.'
      },
      {
        title: '2. Description du Service',
        content: 'Memor.ia est une application de gestion personnelle de liens et de snippets qui permet aux utilisateurs de sauvegarder, organiser et gérer des liens, des notes et du contenu du presse-papiers sur leurs appareils mobiles.'
      },
      {
        title: '3. Compte Utilisateur',
        content: 'L\'Application stocke les données localement sur votre appareil et peut se synchroniser avec les services cloud (iCloud/Google Backup) si activé. Vous êtes responsable du maintien de la sécurité de votre appareil et de toutes les données stockées dans l\'Application.'
      },
      {
        title: '4. Fonctionnalités Premium',
        content: 'Memor.ia offre une période d\'essai gratuite et des fonctionnalités premium qui peuvent nécessiter un achat unique ou un abonnement. Les fonctionnalités premium sont soumises à disponibilité et peuvent changer au fil du temps.'
      },
      {
        title: '5. Contenu Utilisateur',
        content: 'Vous conservez la propriété de tout le contenu que vous sauvegardez dans l\'Application. Nous ne revendiquons aucun droit de propriété intellectuelle sur votre contenu. Vous êtes seul responsable du contenu que vous sauvegardez et partagez.'
      },
      {
        title: '6. Utilisations Interdites',
        content: 'Vous acceptez de ne pas utiliser l\'Application à des fins illégales, de stocker du contenu illégal ou de violer toute loi ou réglementation applicable.'
      },
      {
        title: '7. Limitation de Responsabilité',
        content: 'L\'Application est fournie "telle quelle" sans garantie d\'aucune sorte. Nous ne sommes pas responsables de toute perte de données, dommages ou problèmes découlant de l\'utilisation de l\'Application.'
      },
      {
        title: '8. Modifications des Conditions',
        content: 'Nous nous réservons le droit de modifier ces conditions à tout moment. L\'utilisation continue de l\'Application après les modifications constitue l\'acceptation des nouvelles conditions.'
      },
      {
        title: '9. Contact',
        content: 'Pour toute question concernant ces Conditions d\'Utilisation, veuillez nous contacter à support@memoria-app.com'
      }
    ]
  }
};

export default function TermsPage() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam && translations[langParam]) {
      setLang(langParam);
    } else {
      // Try to detect browser language
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
        <div className="flex justify-end gap-2 mb-8">
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
              {code.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-gray-400">{t.lastUpdated}: January 7, 2025</p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {t.sections.map((section, index) => (
            <div key={index} className="bg-gray-900 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">{section.title}</h2>
              <p className="text-gray-300 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex justify-center gap-8">
          <Link href={`/privacy?lang=${lang}`} className="text-blue-400 hover:text-blue-300 transition-colors">
            {lang === 'pt' ? 'Política de Privacidade' : lang === 'es' ? 'Política de Privacidad' : lang === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy'}
          </Link>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">© 2025 Memor.ia</span>
        </div>
      </div>
    </div>
  );
}
