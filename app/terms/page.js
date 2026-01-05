'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
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
          <h1 className="text-xl font-bold">Termos de Serviço</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="prose prose-invert max-w-none">
          <p className="text-[#8E8E93] mb-8">Última atualização: Janeiro 2025</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Aceitação dos Termos</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Ao utilizar a Memor.ia, concorda com estes Termos de Serviço. Se não concordar, 
            não utilize a aplicação.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Descrição do Serviço</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            A Memor.ia é uma aplicação de gestão de links e notas que permite:
          </p>
          <ul className="list-disc pl-6 text-[#EBEBF5] space-y-2 mb-4">
            <li>Guardar e organizar links</li>
            <li>Criar e gerir notas de texto</li>
            <li>Organizar conteúdo em pastas</li>
            <li>Marcar itens como favoritos</li>
            <li>Utilizar o Smart Clipboard para guardar cópias automaticamente</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Período de Teste</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Novos utilizadores têm direito a 15 dias de acesso gratuito a todas as funcionalidades. 
            Após este período, algumas funcionalidades podem requerer uma subscrição premium.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Códigos de Ativação</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Códigos de ativação:
          </p>
          <ul className="list-disc pl-6 text-[#EBEBF5] space-y-2 mb-4">
            <li>São de uso único</li>
            <li>Não são transferíveis</li>
            <li>Não podem ser revendidos</li>
            <li>Podem ser desativados se obtidos de forma fraudulenta</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Uso Aceitável</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Concorda em não utilizar a aplicação para:
          </p>
          <ul className="list-disc pl-6 text-[#EBEBF5] space-y-2 mb-4">
            <li>Atividades ilegais</li>
            <li>Armazenar conteúdo ilegal</li>
            <li>Tentar aceder a sistemas não autorizados</li>
            <li>Distribuir malware ou código malicioso</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Propriedade Intelectual</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            A Memor.ia e todo o seu conteúdo, funcionalidades e design são propriedade nossa 
            e estão protegidos por leis de direitos de autor.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. Seus Dados</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Você mantém todos os direitos sobre o conteúdo que cria na aplicação. 
            Os seus dados são armazenados localmente no seu dispositivo e nos backups do sistema operativo.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. Limitação de Responsabilidade</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            A Memor.ia é fornecida "como está". Não garantimos que a aplicação estará sempre 
            disponível ou livre de erros. Não somos responsáveis por perda de dados.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. Alterações aos Termos</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Reservamo-nos o direito de modificar estes termos a qualquer momento. 
            Alterações significativas serão comunicadas através da aplicação.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">10. Lei Aplicável</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Estes termos são regidos pela lei portuguesa.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">11. Contacto</h2>
          <p className="text-[#EBEBF5] leading-relaxed mb-4">
            Para questões sobre estes Termos de Serviço:
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
