import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Rocket, 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Camera, 
  DollarSign, 
  UserCog, 
  CreditCard, 
  Settings,
  LifeBuoy
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SUPPORT_WHATSAPP } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { HelpSearch } from "@/components/help/HelpSearch";
import { HelpCategory } from "@/components/help/HelpCategory";
import { HelpArticle, Article } from "@/components/help/HelpArticle";

// Dados das categorias e artigos
const helpCategories = [
  {
    id: "primeiros-passos",
    icon: Rocket,
    title: "Primeiros Passos",
    description: "Como criar sua conta, configurar perfil e começar a usar o FichaZen",
    articles: [
      {
        id: "criar-conta",
        title: "Como criar sua conta",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Acesse <strong>fichazen.com.br</strong></li>
            <li>Clique em <strong>"Começar Grátis"</strong></li>
            <li>Preencha seu nome, e-mail e crie uma senha</li>
            <li>Confirme seu e-mail clicando no link enviado</li>
            <li>Pronto! Você já pode acessar o sistema</li>
          </ol>
        `
      },
      {
        id: "configurar-perfil",
        title: "Configurando seu perfil",
        content: `
          <p>Após criar sua conta, configure seu perfil:</p>
          <ol class="list-decimal pl-4 space-y-2 mt-2">
            <li>Acesse <strong>Configurações → Perfil</strong></li>
            <li>Adicione o nome do seu estúdio</li>
            <li>Preencha seu telefone e endereço</li>
            <li>Faça upload da sua foto de perfil</li>
            <li>Clique em <strong>"Salvar Alterações"</strong></li>
          </ol>
        `
      },
      {
        id: "entendendo-dashboard",
        title: "Entendendo o dashboard",
        content: `
          <p>O dashboard é sua central de controle com:</p>
          <ul class="list-disc pl-4 space-y-2 mt-2">
            <li><strong>KPIs:</strong> Total de clientes, fichas pendentes e visitas da semana</li>
            <li><strong>Agenda Semanal:</strong> Visualize seus agendamentos por dia</li>
            <li><strong>Cores dos agendamentos:</strong>
              <ul class="list-disc pl-4 mt-1">
                <li>🟡 Amarelo: Ficha de anamnese pendente</li>
                <li>🟢 Verde: Confirmado/concluído</li>
                <li>🔴 Vermelho: Cancelado</li>
              </ul>
            </li>
          </ul>
        `
      }
    ]
  },
  {
    id: "gestao-clientes",
    icon: Users,
    title: "Gestão de Clientes",
    description: "Cadastrar, pesquisar e gerenciar seus clientes",
    articles: [
      {
        id: "cadastrar-cliente",
        title: "Como cadastrar um novo cliente",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>No dashboard, clique em <strong>"+ Novo Cliente"</strong></li>
            <li>Preencha nome completo e WhatsApp</li>
            <li>Opcionalmente, adicione data de nascimento e notas</li>
            <li>Selecione procedimentos e agende a primeira visita</li>
            <li>Clique em <strong>"Cadastrar Cliente"</strong></li>
          </ol>
        `
      },
      {
        id: "pesquisar-clientes",
        title: "Pesquisando clientes",
        content: `
          <p>Use a barra de busca no dashboard ou acesse <strong>Clientes</strong> no menu:</p>
          <ul class="list-disc pl-4 space-y-2 mt-2">
            <li>Pesquise por nome ou telefone</li>
            <li>Filtre por status (ativos, inativos)</li>
            <li>Clique no cliente para ver seu perfil completo</li>
          </ul>
        `
      },
      {
        id: "perfil-cliente",
        title: "Visualizando o perfil do cliente",
        content: `
          <p>No perfil do cliente você encontra:</p>
          <ul class="list-disc pl-4 space-y-2 mt-2">
            <li><strong>Dados pessoais:</strong> Nome, telefone, data de nascimento</li>
            <li><strong>Histórico de visitas:</strong> Todos os atendimentos realizados</li>
            <li><strong>Ficha de anamnese:</strong> Respostas do questionário de saúde</li>
            <li><strong>Galeria de fotos:</strong> Fotos antes/depois dos procedimentos</li>
          </ul>
        `
      }
    ]
  },
  {
    id: "agendamentos",
    icon: Calendar,
    title: "Agendamentos",
    description: "Criar, reagendar e gerenciar visitas",
    articles: [
      {
        id: "criar-agendamento",
        title: "Criando um novo agendamento",
        content: `
          <p>Existem duas formas de agendar:</p>
          <ol class="list-decimal pl-4 space-y-2 mt-2">
            <li><strong>Novo cliente:</strong> Ao cadastrar, já defina data e hora da primeira visita</li>
            <li><strong>Cliente existente:</strong> No perfil do cliente, clique em <strong>"Nova Visita"</strong></li>
          </ol>
          <p class="mt-2">Selecione procedimentos, defina valores e atribua um profissional responsável.</p>
        `
      },
      {
        id: "status-visuais",
        title: "Entendendo os status visuais",
        content: `
          <p>Cada agendamento tem uma cor que indica seu status:</p>
          <ul class="list-disc pl-4 space-y-2 mt-2">
            <li><strong class="text-yellow-600">🟡 Amarelo:</strong> Ficha de anamnese ainda não preenchida</li>
            <li><strong class="text-green-600">🟢 Verde:</strong> Ficha preenchida ou procedimento concluído</li>
            <li><strong class="text-red-600">🔴 Vermelho:</strong> Agendamento cancelado</li>
          </ul>
        `
      },
      {
        id: "reagendar-visita",
        title: "Como reagendar uma visita",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Clique no agendamento na agenda</li>
            <li>No modal, clique em <strong>"Reagendar"</strong></li>
            <li>Selecione a nova data e horário</li>
            <li>Opcionalmente, altere o profissional responsável</li>
            <li>Confirme o reagendamento</li>
          </ol>
        `
      },
      {
        id: "cancelar-agendamento",
        title: "Cancelando agendamentos",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Clique no agendamento desejado</li>
            <li>Clique em <strong>"Cancelar"</strong></li>
            <li>O agendamento ficará com borda vermelha</li>
            <li>Você pode reagendá-lo ou excluí-lo permanentemente</li>
          </ol>
        `
      },
      {
        id: "atribuir-profissional",
        title: "Atribuindo profissional responsável",
        content: `
          <p>Cada visita pode ter um profissional responsável:</p>
          <ol class="list-decimal pl-4 space-y-2 mt-2">
            <li>Ao criar ou reagendar, selecione no campo <strong>"Profissional"</strong></li>
            <li>O nome aparecerá nos detalhes da visita</li>
            <li>Use o filtro no Faturamento para ver rendimento por profissional</li>
          </ol>
        `
      }
    ]
  },
  {
    id: "ficha-anamnese",
    icon: FileText,
    title: "Ficha de Anamnese",
    description: "Enviar e personalizar fichas de saúde",
    articles: [
      {
        id: "enviar-ficha",
        title: "Como enviar a ficha para o cliente",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Clique no agendamento com borda amarela</li>
            <li>Clique em <strong>"Enviar Ficha de Anamnese"</strong></li>
            <li>O WhatsApp abrirá com a mensagem e link prontos</li>
            <li>Envie para o cliente</li>
            <li>Quando preenchida, a borda ficará verde</li>
          </ol>
        `
      },
      {
        id: "personalizar-perguntas",
        title: "Personalizando perguntas da ficha",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Acesse <strong>Configurações → Ficha de Anamnese</strong></li>
            <li>Adicione, edite ou remova perguntas</li>
            <li>Defina se são obrigatórias ou opcionais</li>
            <li>Escolha o tipo: texto, sim/não, múltipla escolha</li>
            <li>Salve as alterações</li>
          </ol>
          <p class="mt-2 text-sm">As novas perguntas valerão para próximas fichas enviadas.</p>
        `
      },
      {
        id: "cliente-preenche",
        title: "O que o cliente vê ao preencher",
        content: `
          <p>O cliente recebe um link que abre uma página com:</p>
          <ul class="list-disc pl-4 space-y-2 mt-2">
            <li>Nome do seu estúdio/clínica</li>
            <li>Perguntas configuradas por você</li>
            <li>Checkbox de consentimento (LGPD)</li>
            <li>Botão para enviar as respostas</li>
          </ul>
          <p class="mt-2 text-sm">O link expira após 7 dias por segurança.</p>
        `
      },
      {
        id: "verificar-preenchimento",
        title: "Verificando se a ficha foi preenchida",
        content: `
          <ul class="list-disc pl-4 space-y-2">
            <li><strong>Na agenda:</strong> Borda verde indica ficha preenchida</li>
            <li><strong>No perfil do cliente:</strong> Seção "Ficha de Anamnese" mostra respostas</li>
            <li><strong>Notificações:</strong> Você recebe alerta quando o cliente preenche</li>
          </ul>
        `
      }
    ]
  },
  {
    id: "mensagens-whatsapp",
    icon: MessageSquare,
    title: "Mensagens WhatsApp",
    description: "Templates e automação de mensagens",
    articles: [
      {
        id: "templates-prontos",
        title: "Usando templates prontos",
        content: `
          <p>O FichaZen oferece 11 templates prontos:</p>
          <ul class="list-disc pl-4 space-y-1 mt-2">
            <li>Confirmação de agendamento</li>
            <li>Envio de ficha de anamnese</li>
            <li>Lembretes (normal e urgente)</li>
            <li>Agradecimento pós-atendimento</li>
            <li>Boas-vindas</li>
            <li>Reagendamento</li>
            <li>Cancelamento</li>
          </ul>
          <p class="mt-2">Acesse em <strong>Configurações → Mensagens do WhatsApp</strong></p>
        `
      },
      {
        id: "criar-template",
        title: "Criando templates personalizados",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Acesse <strong>Configurações → Mensagens do WhatsApp</strong></li>
            <li>Clique em <strong>"Nova Mensagem"</strong></li>
            <li>Dê um nome e selecione o tipo</li>
            <li>Escreva a mensagem usando variáveis</li>
            <li>Salve o template</li>
          </ol>
        `
      },
      {
        id: "variaveis-disponiveis",
        title: "Variáveis disponíveis",
        content: `
          <p>Use estas variáveis que serão substituídas automaticamente:</p>
          <ul class="list-disc pl-4 space-y-1 mt-2">
            <li><code>[nomeCliente]</code> - Nome do cliente</li>
            <li><code>[dataVisita]</code> - Data da visita</li>
            <li><code>[horaVisita]</code> - Horário da visita</li>
            <li><code>[procedimento]</code> - Nome do procedimento</li>
            <li><code>[nomeStudio]</code> - Nome do seu estúdio</li>
            <li><code>[linkFicha]</code> - Link da ficha de anamnese</li>
          </ul>
        `
      },
      {
        id: "copiar-mensagem",
        title: "Copiando mensagens",
        content: `
          <p>Se o WhatsApp não abrir automaticamente:</p>
          <ol class="list-decimal pl-4 space-y-2 mt-2">
            <li>Selecione o template desejado</li>
            <li>Clique em <strong>"Copiar Mensagem"</strong></li>
            <li>Abra o WhatsApp manualmente</li>
            <li>Cole a mensagem na conversa do cliente</li>
          </ol>
        `
      }
    ]
  },
  {
    id: "galeria-fotos",
    icon: Camera,
    title: "Galeria de Fotos",
    description: "Upload e gerenciamento de fotos antes/depois",
    articles: [
      {
        id: "upload-fotos",
        title: "Fazendo upload de fotos",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Acesse o perfil do cliente</li>
            <li>Na tabela de visitas, clique no ícone de câmera</li>
            <li>Selecione as fotos do seu dispositivo</li>
            <li>As fotos serão salvas automaticamente</li>
          </ol>
          <p class="mt-2 text-sm">Formatos aceitos: JPG, PNG, WEBP (máx. 5MB cada)</p>
        `
      },
      {
        id: "seguranca-fotos",
        title: "Segurança e privacidade das fotos",
        content: `
          <p>Suas fotos são protegidas:</p>
          <ul class="list-disc pl-4 space-y-2 mt-2">
            <li>✅ Armazenamento privado (não público)</li>
            <li>✅ URLs assinadas com expiração</li>
            <li>✅ Apenas você pode acessar</li>
            <li>✅ Criptografia em trânsito e em repouso</li>
          </ul>
        `
      },
      {
        id: "visualizar-galeria",
        title: "Visualizando a galeria",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>No perfil do cliente, veja a seção <strong>"Galeria de Fotos"</strong></li>
            <li>Clique em uma foto para ampliar</li>
            <li>Use as setas para navegar entre fotos</li>
            <li>As fotos são organizadas por visita</li>
          </ol>
        `
      }
    ]
  },
  {
    id: "faturamento",
    icon: DollarSign,
    title: "Faturamento e Relatórios",
    description: "Acompanhar receitas e exportar relatórios",
    articles: [
      {
        id: "entendendo-kpis",
        title: "Entendendo os KPIs",
        content: `
          <p>A página de faturamento mostra:</p>
          <ul class="list-disc pl-4 space-y-2 mt-2">
            <li><strong>Total Faturado:</strong> Soma dos procedimentos confirmados</li>
            <li><strong>Crescimento:</strong> Comparação com o mês anterior</li>
            <li><strong>Procedimentos:</strong> Quantidade realizada no mês</li>
            <li><strong>Ticket Médio:</strong> Valor médio por atendimento</li>
          </ul>
        `
      },
      {
        id: "navegando-meses",
        title: "Navegando entre meses",
        content: `
          <p>Use as setas no topo da página para:</p>
          <ul class="list-disc pl-4 space-y-2 mt-2">
            <li>← Voltar para meses anteriores</li>
            <li>→ Avançar para meses futuros</li>
            <li>Comparar faturamento entre períodos</li>
          </ul>
        `
      },
      {
        id: "filtrar-profissional",
        title: "Filtrando por profissional",
        content: `
          <p>Para ver o faturamento individual:</p>
          <ol class="list-decimal pl-4 space-y-2 mt-2">
            <li>Use o seletor <strong>"Filtrar por profissional"</strong></li>
            <li>Selecione um membro da equipe</li>
            <li>Os KPIs e gráficos mostrarão apenas dados dele</li>
            <li>Útil para comissionamento e análise de produtividade</li>
          </ol>
        `
      },
      {
        id: "exportar-pdf",
        title: "Exportando relatório em PDF",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Navegue até o mês desejado</li>
            <li>Opcionalmente, filtre por profissional</li>
            <li>Clique em <strong>"Exportar PDF"</strong></li>
            <li>O relatório inclui KPIs, gráficos e análises</li>
          </ol>
        `
      }
    ]
  },
  {
    id: "gestao-equipe",
    icon: UserCog,
    title: "Gestão de Equipe",
    description: "Adicionar e gerenciar profissionais",
    articles: [
      {
        id: "adicionar-profissional",
        title: "Adicionando profissionais",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Acesse <strong>Configurações → Minha Equipe</strong></li>
            <li>Clique em <strong>"Adicionar Profissional"</strong></li>
            <li>Preencha nome, especialidade e contato</li>
            <li>Clique em <strong>"Salvar"</strong></li>
          </ol>
        `
      },
      {
        id: "limites-plano",
        title: "Limites por plano",
        content: `
          <p>Cada plano permite um número diferente de profissionais:</p>
          <ul class="list-disc pl-4 space-y-2 mt-2">
            <li><strong>Zen Essencial:</strong> 1 profissional (você)</li>
            <li><strong>Zen Pro:</strong> Até 5 profissionais</li>
            <li><strong>Zen Ultimate:</strong> Profissionais ilimitados</li>
          </ul>
        `
      },
      {
        id: "atribuir-visitas",
        title: "Atribuindo visitas à equipe",
        content: `
          <p>Ao criar ou reagendar uma visita:</p>
          <ol class="list-decimal pl-4 space-y-2 mt-2">
            <li>Selecione o profissional responsável no dropdown</li>
            <li>O nome aparecerá na agenda e no histórico</li>
            <li>Use os filtros do faturamento para análise individual</li>
          </ol>
        `
      }
    ]
  },
  {
    id: "planos-pagamentos",
    icon: CreditCard,
    title: "Planos e Pagamentos",
    description: "Assinaturas, renovação e histórico",
    articles: [
      {
        id: "diferencas-planos",
        title: "Diferenças entre planos",
        content: `
          <table class="w-full text-sm mt-2">
            <tr class="border-b"><th class="text-left py-2">Recurso</th><th>Essencial</th><th>Pro</th><th>Ultimate</th></tr>
            <tr class="border-b"><td class="py-2">Clientes</td><td>50</td><td>500</td><td>Ilimitado</td></tr>
            <tr class="border-b"><td class="py-2">Profissionais</td><td>1</td><td>5</td><td>Ilimitado</td></tr>
            <tr class="border-b"><td class="py-2">Armazenamento</td><td>1GB</td><td>10GB</td><td>50GB</td></tr>
            <tr><td class="py-2">Exportar PDF</td><td>❌</td><td>✅</td><td>✅</td></tr>
          </table>
        `
      },
      {
        id: "assinar-renovar",
        title: "Como assinar ou renovar",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Acesse seu perfil ou a página de planos</li>
            <li>Escolha o plano desejado</li>
            <li>Selecione <strong>Mensal</strong> ou <strong>Anual</strong> (30% desconto)</li>
            <li>Finalize o pagamento via PIX ou cartão</li>
            <li>Seu plano é ativado automaticamente</li>
          </ol>
        `
      },
      {
        id: "desconto-anual",
        title: "Desconto anual de 30%",
        content: `
          <p>Ao escolher o pagamento anual, você economiza:</p>
          <ul class="list-disc pl-4 space-y-2 mt-2">
            <li><strong>Zen Essencial:</strong> R$ 143,64/ano</li>
            <li><strong>Zen Pro:</strong> R$ 323,64/ano</li>
            <li><strong>Zen Ultimate:</strong> R$ 467,64/ano</li>
          </ul>
        `
      },
      {
        id: "historico-pagamentos",
        title: "Histórico de pagamentos",
        content: `
          <p>Acesse seu histórico completo em:</p>
          <ol class="list-decimal pl-4 space-y-2 mt-2">
            <li>Vá em <strong>Configurações → Perfil</strong></li>
            <li>Clique em <strong>"Ver histórico de pagamentos"</strong></li>
            <li>Veja todas as transações, status e datas</li>
          </ol>
        `
      }
    ]
  },
  {
    id: "configuracoes",
    icon: Settings,
    title: "Configurações",
    description: "Personalizar perfil, procedimentos e mais",
    articles: [
      {
        id: "editar-studio",
        title: "Editando dados do estúdio",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Acesse <strong>Configurações → Perfil</strong></li>
            <li>Edite nome do estúdio, telefone e endereço</li>
            <li>Clique em <strong>"Salvar Alterações"</strong></li>
          </ol>
        `
      },
      {
        id: "foto-perfil",
        title: "Alterando foto de perfil",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Em <strong>Configurações → Perfil</strong>, passe o mouse na foto</li>
            <li>Clique no ícone de edição</li>
            <li>Selecione uma nova foto</li>
            <li>Ajuste o zoom e recorte se necessário</li>
            <li>Confirme para salvar</li>
          </ol>
        `
      },
      {
        id: "gerenciar-procedimentos",
        title: "Gerenciando procedimentos",
        content: `
          <ol class="list-decimal pl-4 space-y-2">
            <li>Acesse <strong>Configurações → Procedimentos</strong></li>
            <li>Adicione novos procedimentos com nome, preço e descrição</li>
            <li>Edite ou desative procedimentos existentes</li>
            <li>Os procedimentos aparecem ao agendar visitas</li>
          </ol>
        `
      }
    ]
  }
];

const Help = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtrar artigos por busca
  const getFilteredArticles = (): Article[] => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results: Article[] = [];
    
    helpCategories.forEach(category => {
      category.articles.forEach(article => {
        if (
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query)
        ) {
          results.push(article);
        }
      });
    });
    
    return results;
  };

  const filteredArticles = getFilteredArticles();
  const currentCategory = helpCategories.find(c => c.id === selectedCategory);

  const handleBack = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  // Conteúdo principal compartilhado
  const HelpContent = () => (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Busca */}
      <div className="mb-8">
        <HelpSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Resultados da busca */}
      {searchQuery.trim() && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-secondary mb-4">
            {filteredArticles.length} resultado{filteredArticles.length !== 1 && "s"} para "{searchQuery}"
          </h2>
          {filteredArticles.length > 0 ? (
            <HelpArticle articles={filteredArticles} />
          ) : (
            <p className="text-muted-foreground">Nenhum artigo encontrado. Tente outras palavras-chave.</p>
          )}
        </div>
      )}

      {/* Categoria selecionada */}
      {selectedCategory && currentCategory && !searchQuery.trim() && (
        <div className="mb-8 animate-fade-in">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedCategory(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para categorias
          </Button>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <currentCategory.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-secondary">{currentCategory.title}</h2>
              <p className="text-sm text-muted-foreground">{currentCategory.description}</p>
            </div>
          </div>
          <HelpArticle articles={currentCategory.articles} />
        </div>
      )}

      {/* Grid de categorias */}
      {!selectedCategory && !searchQuery.trim() && (
        <>
          <h2 className="text-lg font-semibold text-secondary mb-4">Categorias de Ajuda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {helpCategories.map((category) => (
              <HelpCategory
                key={category.id}
                icon={category.icon}
                title={category.title}
                description={category.description}
                articleCount={category.articles.length}
                onClick={() => setSelectedCategory(category.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* CTA Suporte - Adaptado por contexto */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 text-center mt-8">
        <LifeBuoy className="h-10 w-10 text-primary mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-secondary mb-2">Não encontrou o que procura?</h3>
        <p className="text-muted-foreground mb-4">
          {isLoggedIn 
            ? "Nossa equipe está pronta para ajudar você"
            : "Fale conosco ou comece a usar o FichaZen gratuitamente"
          }
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isLoggedIn ? (
            <Button onClick={() => navigate("/suporte")} className="font-semibold">
              Falar com Suporte
            </Button>
          ) : (
            <>
              <Button asChild className="font-semibold">
                <Link to="/registro">Começar Grátis</Link>
              </Button>
              <Button 
                variant="outline" 
                asChild 
                className="font-semibold"
              >
                <a 
                  href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Olá! Tenho uma dúvida sobre o FichaZen`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Falar no WhatsApp
                </a>
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  );

  // Layout para usuários logados (estilo dashboard)
  if (isLoggedIn) {
    return (
      <div className="min-h-screen gradient-hero">
        <header className="bg-white/90 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Central de Ajuda</h1>
              <p className="text-sm text-muted-foreground">Encontre respostas para suas dúvidas</p>
            </div>
          </div>
        </header>
        <HelpContent />
      </div>
    );
  }

  // Layout para visitantes (estilo landing page)
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingHeader />
      
      <div className="flex-1 pt-24">
        {/* Header da página */}
        <div className="bg-gradient-to-b from-primary/5 to-transparent py-12">
          <div className="container mx-auto px-4 text-center">
            <Button variant="ghost" onClick={handleBack} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao início
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-3">Central de Ajuda</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Encontre respostas para suas dúvidas sobre o FichaZen
            </p>
          </div>
        </div>
        
        <HelpContent />
      </div>
      
      <LandingFooter />
    </div>
  );
};

export default Help;
