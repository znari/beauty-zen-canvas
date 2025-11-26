import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/constants";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o início
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Política de Privacidade
            </h1>
            <p className="text-muted-foreground">
              Última atualização: 26 de novembro de 2025
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10">
            {/* Introdução */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                1. Introdução
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  O FichaZen ("nós", "nosso" ou "Plataforma") está comprometido em proteger sua privacidade e seus dados pessoais. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações quando você utiliza nossa plataforma de gestão para profissionais de estética.
                </p>
                <p>
                  Ao utilizar o FichaZen, você concorda com as práticas descritas nesta política. Recomendamos a leitura atenta deste documento.
                </p>
              </div>
            </section>

            {/* Dados Coletados */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                2. Dados que Coletamos
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>Coletamos os seguintes tipos de informações:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Dados de cadastro:</strong> nome completo, e-mail, telefone, CPF/CNPJ, endereço
                  </li>
                  <li>
                    <strong>Dados do seu negócio:</strong> nome do estúdio, procedimentos oferecidos, preços
                  </li>
                  <li>
                    <strong>Dados dos seus clientes:</strong> informações cadastradas por você sobre seus clientes (nome, telefone, fichas de anamnese, histórico de atendimentos)
                  </li>
                  <li>
                    <strong>Fotos de procedimentos:</strong> imagens de antes/depois armazenadas de forma privada e segura
                  </li>
                  <li>
                    <strong>Dados de pagamento:</strong> informações processadas pelo Mercado Pago para cobrança da assinatura
                  </li>
                  <li>
                    <strong>Dados de uso:</strong> informações sobre como você utiliza a plataforma
                  </li>
                </ul>
              </div>
            </section>

            {/* Uso dos Dados */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                3. Como Usamos seus Dados
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>Utilizamos suas informações para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecer e manter os serviços do FichaZen</li>
                  <li>Processar pagamentos e gerenciar sua assinatura</li>
                  <li>Enviar notificações importantes sobre sua conta</li>
                  <li>Enviar lembretes de agendamentos e renovação</li>
                  <li>Melhorar e personalizar sua experiência na plataforma</li>
                  <li>Responder suas dúvidas e fornecer suporte</li>
                  <li>Cumprir obrigações legais e regulatórias</li>
                </ul>
              </div>
            </section>

            {/* Armazenamento e Segurança */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                4. Armazenamento e Segurança
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Seus dados são armazenados em servidores seguros da Supabase, com criptografia em trânsito e em repouso. Implementamos as seguintes medidas de segurança:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Criptografia SSL/TLS em todas as comunicações</li>
                  <li>Autenticação segura com hash de senhas</li>
                  <li>Controle de acesso baseado em políticas (RLS)</li>
                  <li>Fotos armazenadas em buckets privados com URLs assinadas</li>
                  <li>Backups regulares dos dados</li>
                  <li>Monitoramento contínuo de segurança</li>
                </ul>
              </div>
            </section>

            {/* Compartilhamento */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                5. Compartilhamento de Dados
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Não vendemos seus dados pessoais. Compartilhamos informações apenas com:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Supabase:</strong> infraestrutura de banco de dados e autenticação
                  </li>
                  <li>
                    <strong>Mercado Pago:</strong> processamento de pagamentos
                  </li>
                  <li>
                    <strong>Autoridades:</strong> quando exigido por lei ou ordem judicial
                  </li>
                </ul>
                <p>
                  Todos os nossos parceiros estão sujeitos a acordos de confidencialidade e proteção de dados.
                </p>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                6. Cookies e Tecnologias Similares
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Utilizamos cookies e tecnologias similares para:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Manter você autenticado na plataforma</li>
                  <li>Lembrar suas preferências</li>
                  <li>Analisar o uso da plataforma para melhorias</li>
                </ul>
                <p>
                  Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
                </p>
              </div>
            </section>

            {/* Direitos do Usuário */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                7. Seus Direitos
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Você tem direito a:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos ou incorretos</li>
                  <li>Solicitar a exclusão dos seus dados</li>
                  <li>Exportar seus dados em formato legível</li>
                  <li>Revogar consentimento a qualquer momento</li>
                  <li>Solicitar informações sobre compartilhamento</li>
                </ul>
                <p>
                  Para exercer esses direitos, entre em contato conosco pelos canais indicados abaixo.
                </p>
              </div>
            </section>

            {/* Retenção */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                8. Retenção de Dados
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para fornecer os serviços. Após o cancelamento da conta, seus dados serão retidos por até 90 dias para fins de backup, após os quais serão permanentemente excluídos.
                </p>
                <p>
                  Dados necessários para cumprimento de obrigações legais podem ser retidos por períodos mais longos conforme exigido pela legislação aplicável.
                </p>
              </div>
            </section>

            {/* Alterações */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                9. Alterações nesta Política
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas por e-mail ou através de aviso na plataforma. A data da última atualização será sempre indicada no topo deste documento.
                </p>
              </div>
            </section>

            {/* Contato */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                10. Contato
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Para dúvidas, solicitações ou exercício dos seus direitos relacionados à privacidade, entre em contato:
                </p>
                <ul className="list-none space-y-2">
                  <li>
                    <strong>E-mail:</strong>{" "}
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-secondary hover:underline">
                      {SUPPORT_EMAIL}
                    </a>
                  </li>
                  <li>
                    <strong>WhatsApp:</strong>{" "}
                    <a 
                      href={`https://wa.me/${SUPPORT_WHATSAPP}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline"
                    >
                      +55 65 9337-6413
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* Footer CTA */}
          <div className="mt-12 pt-8 border-t border-border text-center">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o início
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
};

export default PrivacyPolicy;
