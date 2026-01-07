'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const translations = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated',
    sections: [
      {
        title: '1. Information We Collect',
        content: 'Memor.ia collects and stores the following information locally on your device: links you save, notes and clipboard content, folder organization preferences, and app settings. This data is stored locally and may be backed up through your device\'s native cloud backup service (iCloud or Google Backup).'
      },
      {
        title: '2. How We Use Your Information',
        content: 'Your information is used solely to provide the core functionality of the App: organizing and displaying your saved content, enabling search functionality, managing your preferences, and syncing across your devices (when cloud backup is enabled).'
      },
      {
        title: '3. Data Storage',
        content: 'All your content is stored locally on your device. We do not have access to your saved links, notes, or clipboard content. If you enable cloud backup through your device settings, your data may be stored on Apple\'s iCloud or Google\'s backup services according to their respective privacy policies.'
      },
      {
        title: '4. Data Sharing',
        content: 'We do not sell, trade, or share your personal information with third parties. Your data remains on your device and under your control.'
      },
      {
        title: '5. Analytics',
        content: 'We may collect anonymous usage statistics to improve the App. This includes app crashes, feature usage frequency, and general performance metrics. No personal content is included in these analytics.'
      },
      {
        title: '6. Third-Party Services',
        content: 'The App may use third-party services for specific features (such as link previews). These services only receive the minimum information necessary to provide their functionality.'
      },
      {
        title: '7. Data Security',
        content: 'We implement industry-standard security measures to protect your data. However, no method of electronic storage is 100% secure, and we cannot guarantee absolute security.'
      },
      {
        title: '8. Your Rights',
        content: 'You have full control over your data. You can export, delete, or modify your content at any time through the App. Uninstalling the App will remove all locally stored data.'
      },
      {
        title: '9. Children\'s Privacy',
        content: 'The App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.'
      },
      {
        title: '10. Changes to This Policy',
        content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.'
      },
      {
        title: '11. Contact Us',
        content: 'If you have any questions about this Privacy Policy, please contact us at privacy@memoria-app.com'
      }
    ]
  },
  pt: {
    title: 'Política de Privacidade',
    lastUpdated: 'Última atualização',
    sections: [
      {
        title: '1. Informações que Recolhemos',
        content: 'O Memor.ia recolhe e armazena as seguintes informações localmente no seu dispositivo: links que guarda, notas e conteúdo do clipboard, preferências de organização de pastas e definições da app. Estes dados são armazenados localmente e podem ser guardados através do serviço de backup nativo do seu dispositivo (iCloud ou Google Backup).'
      },
      {
        title: '2. Como Usamos as Suas Informações',
        content: 'As suas informações são usadas unicamente para fornecer a funcionalidade principal da App: organizar e exibir o seu conteúdo guardado, permitir funcionalidade de pesquisa, gerir as suas preferências e sincronizar entre os seus dispositivos (quando o backup na cloud está ativado).'
      },
      {
        title: '3. Armazenamento de Dados',
        content: 'Todo o seu conteúdo é armazenado localmente no seu dispositivo. Não temos acesso aos seus links guardados, notas ou conteúdo do clipboard. Se ativar o backup na cloud através das definições do seu dispositivo, os seus dados podem ser armazenados nos serviços iCloud da Apple ou backup do Google de acordo com as suas respetivas políticas de privacidade.'
      },
      {
        title: '4. Partilha de Dados',
        content: 'Não vendemos, trocamos ou partilhamos as suas informações pessoais com terceiros. Os seus dados permanecem no seu dispositivo e sob o seu controlo.'
      },
      {
        title: '5. Análises',
        content: 'Podemos recolher estatísticas de uso anónimas para melhorar a App. Isto inclui falhas da app, frequência de uso de funcionalidades e métricas gerais de desempenho. Nenhum conteúdo pessoal é incluído nestas análises.'
      },
      {
        title: '6. Serviços de Terceiros',
        content: 'A App pode usar serviços de terceiros para funcionalidades específicas (como pré-visualizações de links). Estes serviços apenas recebem a informação mínima necessária para fornecer a sua funcionalidade.'
      },
      {
        title: '7. Segurança dos Dados',
        content: 'Implementamos medidas de segurança padrão da indústria para proteger os seus dados. No entanto, nenhum método de armazenamento eletrónico é 100% seguro, e não podemos garantir segurança absoluta.'
      },
      {
        title: '8. Os Seus Direitos',
        content: 'Tem controlo total sobre os seus dados. Pode exportar, eliminar ou modificar o seu conteúdo a qualquer momento através da App. Desinstalar a App removerá todos os dados armazenados localmente.'
      },
      {
        title: '9. Privacidade de Crianças',
        content: 'A App não se destina a crianças com menos de 13 anos de idade. Não recolhemos conscientemente informações pessoais de crianças com menos de 13 anos.'
      },
      {
        title: '10. Alterações a Esta Política',
        content: 'Podemos atualizar esta Política de Privacidade de tempos a tempos. Notificá-lo-emos de quaisquer alterações publicando a nova Política de Privacidade nesta página e atualizando a data de "Última atualização".'
      },
      {
        title: '11. Contacte-nos',
        content: 'Se tiver alguma questão sobre esta Política de Privacidade, por favor contacte-nos em privacy@memoria-app.com'
      }
    ]
  },
  es: {
    title: 'Política de Privacidad',
    lastUpdated: 'Última actualización',
    sections: [
      {
        title: '1. Información que Recopilamos',
        content: 'Memor.ia recopila y almacena la siguiente información localmente en su dispositivo: enlaces que guarda, notas y contenido del portapapeles, preferencias de organización de carpetas y configuración de la app. Estos datos se almacenan localmente y pueden respaldarse a través del servicio de respaldo nativo de su dispositivo (iCloud o Google Backup).'
      },
      {
        title: '2. Cómo Usamos Su Información',
        content: 'Su información se utiliza únicamente para proporcionar la funcionalidad principal de la App: organizar y mostrar su contenido guardado, habilitar la funcionalidad de búsqueda, gestionar sus preferencias y sincronizar entre sus dispositivos (cuando el respaldo en la nube está habilitado).'
      },
      {
        title: '3. Almacenamiento de Datos',
        content: 'Todo su contenido se almacena localmente en su dispositivo. No tenemos acceso a sus enlaces guardados, notas o contenido del portapapeles. Si habilita el respaldo en la nube a través de la configuración de su dispositivo, sus datos pueden almacenarse en los servicios iCloud de Apple o respaldo de Google según sus respectivas políticas de privacidad.'
      },
      {
        title: '4. Compartir Datos',
        content: 'No vendemos, intercambiamos ni compartimos su información personal con terceros. Sus datos permanecen en su dispositivo y bajo su control.'
      },
      {
        title: '5. Análisis',
        content: 'Podemos recopilar estadísticas de uso anónimas para mejorar la App. Esto incluye fallos de la app, frecuencia de uso de funciones y métricas generales de rendimiento. Ningún contenido personal se incluye en estos análisis.'
      },
      {
        title: '6. Servicios de Terceros',
        content: 'La App puede usar servicios de terceros para funciones específicas (como vistas previas de enlaces). Estos servicios solo reciben la información mínima necesaria para proporcionar su funcionalidad.'
      },
      {
        title: '7. Seguridad de Datos',
        content: 'Implementamos medidas de seguridad estándar de la industria para proteger sus datos. Sin embargo, ningún método de almacenamiento electrónico es 100% seguro, y no podemos garantizar seguridad absoluta.'
      },
      {
        title: '8. Sus Derechos',
        content: 'Tiene control total sobre sus datos. Puede exportar, eliminar o modificar su contenido en cualquier momento a través de la App. Desinstalar la App eliminará todos los datos almacenados localmente.'
      },
      {
        title: '9. Privacidad de Niños',
        content: 'La App no está destinada a niños menores de 13 años. No recopilamos conscientemente información personal de niños menores de 13 años.'
      },
      {
        title: '10. Cambios a Esta Política',
        content: 'Podemos actualizar esta Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página y actualizando la fecha de "Última actualización".'
      },
      {
        title: '11. Contáctenos',
        content: 'Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contáctenos en privacy@memoria-app.com'
      }
    ]
  },
  fr: {
    title: 'Politique de Confidentialité',
    lastUpdated: 'Dernière mise à jour',
    sections: [
      {
        title: '1. Informations que Nous Collectons',
        content: 'Memor.ia collecte et stocke les informations suivantes localement sur votre appareil : liens que vous sauvegardez, notes et contenu du presse-papiers, préférences d\'organisation des dossiers et paramètres de l\'application. Ces données sont stockées localement et peuvent être sauvegardées via le service de sauvegarde natif de votre appareil (iCloud ou Google Backup).'
      },
      {
        title: '2. Comment Nous Utilisons Vos Informations',
        content: 'Vos informations sont utilisées uniquement pour fournir les fonctionnalités principales de l\'Application : organiser et afficher votre contenu sauvegardé, permettre la fonctionnalité de recherche, gérer vos préférences et synchroniser entre vos appareils (lorsque la sauvegarde cloud est activée).'
      },
      {
        title: '3. Stockage des Données',
        content: 'Tout votre contenu est stocké localement sur votre appareil. Nous n\'avons pas accès à vos liens sauvegardés, notes ou contenu du presse-papiers. Si vous activez la sauvegarde cloud via les paramètres de votre appareil, vos données peuvent être stockées sur les services iCloud d\'Apple ou de sauvegarde Google selon leurs politiques de confidentialité respectives.'
      },
      {
        title: '4. Partage des Données',
        content: 'Nous ne vendons, n\'échangeons ni ne partageons vos informations personnelles avec des tiers. Vos données restent sur votre appareil et sous votre contrôle.'
      },
      {
        title: '5. Analyses',
        content: 'Nous pouvons collecter des statistiques d\'utilisation anonymes pour améliorer l\'Application. Cela inclut les plantages de l\'application, la fréquence d\'utilisation des fonctionnalités et les métriques de performance générales. Aucun contenu personnel n\'est inclus dans ces analyses.'
      },
      {
        title: '6. Services Tiers',
        content: 'L\'Application peut utiliser des services tiers pour des fonctionnalités spécifiques (comme les aperçus de liens). Ces services ne reçoivent que les informations minimales nécessaires pour fournir leur fonctionnalité.'
      },
      {
        title: '7. Sécurité des Données',
        content: 'Nous mettons en œuvre des mesures de sécurité standard de l\'industrie pour protéger vos données. Cependant, aucune méthode de stockage électronique n\'est sécurisée à 100%, et nous ne pouvons pas garantir une sécurité absolue.'
      },
      {
        title: '8. Vos Droits',
        content: 'Vous avez un contrôle total sur vos données. Vous pouvez exporter, supprimer ou modifier votre contenu à tout moment via l\'Application. La désinstallation de l\'Application supprimera toutes les données stockées localement.'
      },
      {
        title: '9. Confidentialité des Enfants',
        content: 'L\'Application n\'est pas destinée aux enfants de moins de 13 ans. Nous ne collectons pas sciemment d\'informations personnelles auprès d\'enfants de moins de 13 ans.'
      },
      {
        title: '10. Modifications de Cette Politique',
        content: 'Nous pouvons mettre à jour cette Politique de Confidentialité de temps en temps. Nous vous informerons de tout changement en publiant la nouvelle Politique de Confidentialité sur cette page et en mettant à jour la date de "Dernière mise à jour".'
      },
      {
        title: '11. Nous Contacter',
        content: 'Si vous avez des questions concernant cette Politique de Confidentialité, veuillez nous contacter à privacy@memoria-app.com'
      }
    ]
  }
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
          <Link href={`/terms?lang=${lang}`} className="text-blue-400 hover:text-blue-300 transition-colors">
            {lang === 'pt' ? 'Termos de Serviço' : lang === 'es' ? 'Términos de Servicio' : lang === 'fr' ? 'Conditions d\'Utilisation' : 'Terms of Service'}
          </Link>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">© 2025 Memor.ia</span>
        </div>
      </div>
    </div>
  );
}
