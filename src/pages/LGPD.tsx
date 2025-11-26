import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/constants";

const LGPD = () => {
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
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">
                Conformidade LGPD
              </h1>
            </div>
            <p className="text-muted-foreground">
              Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Última atualização: 26 de novembro de 2025
            </p>
          </div>

          {/* Content */}
          <div className="space-y-10">
            {/* O que é a LGPD */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                1. O que é a LGPD?
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  A Lei Geral de Proteção de Dados Pessoais (LGPD) é a legislação brasileira que regula as atividades de tratamento de dados pessoais. Ela estabelece regras sobre coleta, armazenamento, tratamento e compartilhamento de dados pessoais, impondo mais proteção e penalidades para o não cumprimento.
                </p>
                <p>
                  O FichaZen está comprometido com a conformidade total com a LGPD, garantindo que seus dados e os dados dos seus clientes sejam tratados com segurança e transparência.
                </p>
              </div>
            </section>

            {/* Papéis */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                2. Nosso Papel no Tratamento de Dados
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  De acordo com a LGPD:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>FichaZen como Controlador:</strong> Somos controladores dos dados dos profissionais (nossos clientes) que utilizam a plataforma.
                  </li>
                  <li>
                    <strong>FichaZen como Operador:</strong> Atuamos como operadores dos dados dos clientes finais cadastrados por você na plataforma.
                  </li>
                  <li>
                    <strong>Você como Controlador:</strong> Você é controlador dos dados dos seus clientes e deve garantir que possui base legal adequada para o tratamento.
                  </li>
                </ul>
              </div>
            </section>

            {/* Bases Legais */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                3. Bases Legais para Tratamento
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  O FichaZen trata dados pessoais com base nas seguintes hipóteses legais (Art. 7º da LGPD):
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Execução de contrato:</strong> Tratamento necessário para fornecer os serviços contratados
                  </li>
                  <li>
                    <strong>Consentimento:</strong> Para comunicações de marketing e compartilhamento opcional
                  </li>
                  <li>
                    <strong>Obrigação legal:</strong> Para cumprimento de obrigações legais e regulatórias
                  </li>
                  <li>
                    <strong>Legítimo interesse:</strong> Para melhorias na plataforma e prevenção de fraudes
                  </li>
                </ul>
              </div>
            </section>

            {/* Direitos dos Titulares */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                4. Seus Direitos como Titular de Dados
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Conforme o Art. 18 da LGPD, você tem direito a:
                </p>
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">✓ Confirmação</h3>
                      <p className="text-sm">Confirmar a existência de tratamento dos seus dados</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">✓ Acesso</h3>
                      <p className="text-sm">Acessar seus dados pessoais tratados por nós</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">✓ Correção</h3>
                      <p className="text-sm">Corrigir dados incompletos, inexatos ou desatualizados</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">✓ Anonimização</h3>
                      <p className="text-sm">Anonimizar, bloquear ou eliminar dados desnecessários</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">✓ Portabilidade</h3>
                      <p className="text-sm">Portar seus dados para outro fornecedor de serviço</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">✓ Eliminação</h3>
                      <p className="text-sm">Eliminar dados tratados com base em consentimento</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">✓ Informação</h3>
                      <p className="text-sm">Saber com quem seus dados são compartilhados</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">✓ Revogação</h3>
                      <p className="text-sm">Revogar consentimento a qualquer momento</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Dados Sensíveis */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                5. Dados Sensíveis
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  As fichas de anamnese podem conter dados sensíveis sobre saúde. Esses dados são tratados com medidas especiais de segurança:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Armazenamento criptografado</li>
                  <li>Acesso restrito apenas ao profissional responsável</li>
                  <li>Consentimento explícito do cliente final através da ficha</li>
                  <li>Não compartilhamento com terceiros sem autorização</li>
                </ul>
              </div>
            </section>

            {/* Como Exercer Direitos */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                6. Como Exercer Seus Direitos
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Para exercer qualquer dos direitos previstos na LGPD:
                </p>
                <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-6 space-y-4">
                  <p className="font-medium text-foreground">Envie uma solicitação para:</p>
                  <ul className="list-none space-y-3">
                    <li className="flex items-center gap-2">
                      <span className="text-secondary">📧</span>
                      <a href={`mailto:${SUPPORT_EMAIL}?subject=Solicitação LGPD`} className="text-secondary hover:underline">
                        {SUPPORT_EMAIL}
                      </a>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-secondary">💬</span>
                      <a 
                        href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Olá! Gostaria de fazer uma solicitação referente aos meus direitos LGPD.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:underline"
                      >
                        WhatsApp: +55 65 9337-6413
                      </a>
                    </li>
                  </ul>
                  <p className="text-sm">
                    Sua solicitação será respondida em até <strong>15 dias úteis</strong>, conforme determina a LGPD.
                  </p>
                </div>
              </div>
            </section>

            {/* Medidas de Segurança */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                7. Medidas de Segurança
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Implementamos medidas técnicas e organizacionais para proteger seus dados:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Criptografia de dados em trânsito (SSL/TLS) e em repouso</li>
                  <li>Autenticação segura com hash de senhas (bcrypt)</li>
                  <li>Row Level Security (RLS) no banco de dados</li>
                  <li>URLs assinadas para acesso a fotos privadas</li>
                  <li>Logs de auditoria para rastreamento de acessos</li>
                  <li>Backups regulares em servidores seguros</li>
                  <li>Treinamento da equipe em proteção de dados</li>
                </ul>
              </div>
            </section>

            {/* Incidentes */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                8. Incidentes de Segurança
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, o FichaZen irá:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Comunicar a Autoridade Nacional de Proteção de Dados (ANPD) em prazo razoável</li>
                  <li>Comunicar os titulares afetados</li>
                  <li>Descrever a natureza dos dados afetados</li>
                  <li>Indicar as medidas técnicas e de segurança utilizadas</li>
                  <li>Informar os riscos relacionados e as medidas adotadas</li>
                </ul>
              </div>
            </section>

            {/* Suas Obrigações */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                9. Suas Obrigações como Profissional
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Como profissional que utiliza o FichaZen, você também deve:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Obter consentimento válido dos seus clientes antes de cadastrar seus dados</li>
                  <li>Informar seus clientes sobre o uso de sistemas digitais para gestão</li>
                  <li>Atender solicitações de direitos dos seus clientes</li>
                  <li>Manter os dados dos clientes atualizados e corretos</li>
                  <li>Não compartilhar dados sem autorização</li>
                </ul>
              </div>
            </section>

            {/* Encarregado */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                10. Encarregado de Proteção de Dados (DPO)
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Para questões relacionadas à proteção de dados pessoais, entre em contato com nosso Encarregado:
                </p>
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="font-medium text-foreground mb-2">Canais de Contato:</p>
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
              </div>
            </section>

            {/* Atualizações */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                11. Atualizações desta Política
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Esta política pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou na legislação. Alterações significativas serão comunicadas por e-mail ou aviso na plataforma.
                </p>
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

export default LGPD;
