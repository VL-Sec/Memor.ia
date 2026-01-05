'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#2C2C2E] bg-black/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Política de Privacidade</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="prose prose-invert max-w-none">
          <p className="text-[#8E8E93] mb-8">Última atualização: Janeiro 2025</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Introdução</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            A Memor.ia ("nós", "nosso" ou "aplicação") está comprometida em proteger a sua privacidade. 
            Esta Política de Privacidade explica como a nossa aplicação funciona em relação aos seus dados.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Dados que NÃO Recolhemos</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            A Memor.ia foi desenhada com privacidade em primeiro lugar. <strong>Não recolhemos:</strong>
          </p>
          <ul className="list-disc pl-6 text-[#EBEBF5] space-y-2 mb-4">
            <li>Emails ou endereços de correio eletrónico</li>
            <li>Nomes reais ou informações de identificação pessoal</li>
            <li>Números de telefone</li>
            <li>Endereços IP</li>
            <li>Dados de localização</li>
            <li>Identificadores de dispositivos</li>
            <li>O conteúdo que cria na aplicação (links, notas)</li>
            <li>Histórico de navegação ou utilização individual</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Armazenamento de Dados</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Os seus dados (links, notas, preferências) são armazenados:
          </p>
          <ul className="list-disc pl-6 text-[#EBEBF5] space-y-2 mb-4">
            <li><strong>Localmente no seu dispositivo</strong> - Através do armazenamento nativo do sistema</li>
            <li><strong>No backup do sistema operativo</strong> - iCloud (iOS) ou Google Backup (Android)</li>
          </ul>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            A Memor.ia não tem acesso aos seus backups. Estes são geridos exclusivamente pelo seu sistema operativo.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Métricas Anónimas</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Para melhorar a aplicação, recolhemos apenas métricas agregadas e anónimas:
          </p>
          <ul className="list-disc pl-6 text-[#EBEBF5] space-y-2 mb-4">
            <li>Número total de instalações</li>
            <li>Número de utilizadores premium</li>
            <li>Taxa de conversão de trial para premium</li>
          </ul>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Estas métricas são completamente anónimas e não permitem identificar utilizadores individuais.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Códigos de Ativação</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Se utilizar um código de ativação (fornecido por influencers ou parceiros):
          </p>
          <ul className="list-disc pl-6 text-[#EBEBF5] space-y-2 mb-4">
            <li>Registamos apenas que o código foi utilizado</li>
            <li>Não associamos o código a nenhuma informação pessoal sua</li>
            <li>Não guardamos identificadores do seu dispositivo</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Sem Rastreamento</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            A Memor.ia:
          </p>
          <ul className="list-disc pl-6 text-[#EBEBF5] space-y-2 mb-4">
            <li>Não utiliza cookies de rastreamento</li>
            <li>Não partilha dados com terceiros</li>
            <li>Não exibe publicidade</li>
            <li>Não vende informações</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. Segurança</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            A segurança dos seus dados é importante para nós. Como os seus dados são armazenados localmente 
            e nos backups do sistema operativo, a segurança é garantida pelos mecanismos nativos da Apple (iOS) 
            e Google (Android).
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. Os Seus Direitos</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Como não recolhemos dados pessoais, não há dados para:
          </p>
          <ul className="list-disc pl-6 text-[#EBEBF5] space-y-2 mb-4">
            <li>Aceder ou solicitar</li>
            <li>Corrigir ou atualizar</li>
            <li>Eliminar dos nossos servidores</li>
          </ul>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Pode eliminar todos os seus dados a qualquer momento desinstalando a aplicação ou 
            limpando os dados da aplicação nas definições do seu dispositivo.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. Crianças</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            A Memor.ia não se destina a crianças com menos de 13 anos. Não recolhemos intencionalmente 
            informações de crianças.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">10. Alterações a Esta Política</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre alterações 
            significativas através da aplicação.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">11. Contacto</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Para questões sobre esta Política de Privacidade:
          </p>
          <p className="text-[#007AFF] mb-8">
            Email: getmemoria@gmail.com
          </p>

          <div className="border-t border-[#2C2C2E] pt-8 mt-8">
            <p className="text-[#8E8E93] text-sm">
              © 2025 Memor.ia. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
