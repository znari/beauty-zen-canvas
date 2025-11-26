import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/constants";

const TermsOfUse = () => {
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
              Termos de Uso
            </h1>
            <p className="text-muted-foreground">
              Última atualização: 26 de novembro de 2025
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10">
            {/* Aceitação */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                1. Aceitação dos Termos
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Ao acessar e utilizar o FichaZen ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar a Plataforma.
                </p>
                <p>
                  Estes Termos constituem um acordo legal entre você e o FichaZen. Ao se cadastrar, você declara ter lido, compreendido e aceito integralmente estes Termos.
                </p>
              </div>
            </section>

            {/* Descrição do Serviço */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                2. Descrição do Serviço
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  O FichaZen é uma plataforma SaaS (Software as a Service) de gestão para profissionais de estética que oferece:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Gestão de clientes e agendamentos</li>
                  <li>Fichas de anamnese digitais</li>
                  <li>Galeria de fotos de antes/depois</li>
                  <li>Modelos de mensagens para WhatsApp</li>
                  <li>Relatórios de faturamento</li>
                  <li>Gestão de equipe (conforme o plano)</li>
                </ul>
              </div>
            </section>

            {/* Cadastro */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                3. Cadastro e Conta
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Para utilizar o FichaZen, você deve:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ter pelo menos 18 anos de idade</li>
                  <li>Fornecer informações verdadeiras, completas e atualizadas</li>
                  <li>Manter a confidencialidade de suas credenciais de acesso</li>
                  <li>Notificar imediatamente sobre uso não autorizado da sua conta</li>
                </ul>
                <p>
                  Você é responsável por todas as atividades realizadas em sua conta. O FichaZen não se responsabiliza por perdas decorrentes de uso não autorizado de sua conta.
                </p>
              </div>
            </section>

            {/* Planos e Pagamentos */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                4. Planos e Pagamentos
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  O FichaZen oferece diferentes planos de assinatura:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Período de teste:</strong> 15 dias gratuitos para novos usuários
                  </li>
                  <li>
                    <strong>Assinaturas:</strong> cobrança mensal ou anual via Mercado Pago
                  </li>
                  <li>
                    <strong>Renovação:</strong> automática ao final de cada período
                  </li>
                </ul>
                <p>
                  Os preços podem ser alterados mediante aviso prévio de 30 dias. A alteração não afetará períodos já pagos.
                </p>
              </div>
            </section>

            {/* Uso Adequado */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                5. Uso Adequado
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Ao utilizar o FichaZen, você concorda em:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Não usar a Plataforma para fins ilegais ou não autorizados</li>
                  <li>Não tentar acessar áreas restritas ou sistemas não autorizados</li>
                  <li>Não transmitir vírus, malware ou código malicioso</li>
                  <li>Não fazer engenharia reversa do software</li>
                  <li>Não compartilhar suas credenciais de acesso</li>
                  <li>Obter consentimento dos seus clientes antes de cadastrar seus dados</li>
                  <li>Cumprir a LGPD e demais leis de proteção de dados</li>
                </ul>
              </div>
            </section>

            {/* Responsabilidades do Usuário */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                6. Suas Responsabilidades
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Você é responsável por:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>A veracidade dos dados cadastrados</li>
                  <li>Obter consentimento adequado dos seus clientes</li>
                  <li>Manter backups dos seus dados importantes</li>
                  <li>Informar seus clientes sobre o uso de sistemas digitais</li>
                  <li>Cumprir regulamentações profissionais aplicáveis à sua área</li>
                </ul>
              </div>
            </section>

            {/* Propriedade Intelectual */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                7. Propriedade Intelectual
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Todo o conteúdo do FichaZen, incluindo mas não limitado a textos, gráficos, logos, ícones, imagens, código e software, é propriedade do FichaZen e está protegido por leis de direitos autorais e propriedade intelectual.
                </p>
                <p>
                  Você mantém a propriedade dos dados que insere na Plataforma (informações de clientes, fotos, etc.), concedendo ao FichaZen licença limitada para armazenar e processar esses dados conforme necessário para fornecer os serviços.
                </p>
              </div>
            </section>

            {/* Limitação de Responsabilidade */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                8. Limitação de Responsabilidade
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  O FichaZen é fornecido "como está" e "conforme disponível". Não garantimos que:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>O serviço será ininterrupto ou livre de erros</li>
                  <li>Os resultados obtidos serão precisos ou confiáveis</li>
                  <li>Quaisquer defeitos serão corrigidos</li>
                </ul>
                <p>
                  Em nenhuma circunstância o FichaZen será responsável por danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou impossibilidade de uso da Plataforma.
                </p>
              </div>
            </section>

            {/* Disponibilidade */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                9. Disponibilidade e Manutenção
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Nos esforçamos para manter a Plataforma disponível 24/7, mas pode haver interrupções para:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Manutenção programada (com aviso prévio quando possível)</li>
                  <li>Atualizações de segurança urgentes</li>
                  <li>Circunstâncias fora do nosso controle</li>
                </ul>
              </div>
            </section>

            {/* Cancelamento */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                10. Cancelamento e Rescisão
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  <strong>Por você:</strong> Você pode cancelar sua assinatura a qualquer momento. O acesso continuará até o final do período pago. Não há reembolso proporcional para cancelamentos antecipados.
                </p>
                <p>
                  <strong>Por nós:</strong> Podemos suspender ou encerrar sua conta por violação destes Termos, após notificação quando possível.
                </p>
                <p>
                  Após o cancelamento, você terá 30 dias para exportar seus dados. Após esse período, os dados serão permanentemente excluídos.
                </p>
              </div>
            </section>

            {/* Modificações */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                11. Modificações dos Termos
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Reservamos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas por e-mail ou aviso na Plataforma com antecedência mínima de 30 dias.
                </p>
                <p>
                  O uso continuado da Plataforma após as alterações constitui aceitação dos novos Termos.
                </p>
              </div>
            </section>

            {/* Legislação */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                12. Legislação Aplicável
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Estes Termos são regidos pelas leis da República Federativa do Brasil. Quaisquer disputas decorrentes destes Termos serão submetidas ao foro da Comarca de Cuiabá, Estado de Mato Grosso, Brasil, com renúncia a qualquer outro, por mais privilegiado que seja.
                </p>
              </div>
            </section>

            {/* Contato */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                13. Contato
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Para dúvidas sobre estes Termos de Uso, entre em contato:
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

export default TermsOfUse;
