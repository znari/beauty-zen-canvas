import { messageTemplates, type MessageType } from "./whatsapp";

export interface MessageTemplate {
  id: string;
  nome: string;
  tipo: MessageType;
  conteudo: string;
  isPadrao: boolean;
  criadoEm: string;
}

// Templates mock - em produção, viriam do backend
export const mockTemplates: MessageTemplate[] = [
  {
    id: "1",
    nome: "Confirmação Padrão",
    tipo: "ConfirmacaoAgendamento",
    conteudo: messageTemplates.ConfirmacaoAgendamento,
    isPadrao: true,
    criadoEm: "2025-01-01",
  },
  {
    id: "2",
    nome: "Confirmação com Lembrete de Ficha",
    tipo: "ConfirmacaoAgendamento",
    conteudo: `Oi [nomeCliente]! ✨

Seu agendamento está confirmado para [dataProcedimento] às [horaProcedimento].

🌸 Lembre-se de preencher sua ficha de anamnese antes do atendimento!

Te esperamos com muito carinho 💕
— [nomeStudio]`,
    isPadrao: false,
    criadoEm: "2025-01-02",
  },
  {
    id: "3",
    nome: "Envio de Ficha Padrão",
    tipo: "EnvioFicha",
    conteudo: messageTemplates.EnvioFicha,
    isPadrao: true,
    criadoEm: "2025-01-01",
  },
  {
    id: "4",
    nome: "Envio de Ficha - Urgente",
    tipo: "EnvioFicha",
    conteudo: `Oi [nomeCliente]! 🌸

⏰ IMPORTANTE: Precisamos que você preencha sua ficha de anamnese o quanto antes!

Clique no link abaixo para preencher agora:
[linkFicha]

É super rápido e essencial para seu atendimento 💕

— [nomeStudio]`,
    isPadrao: false,
    criadoEm: "2025-01-02",
  },
  {
    id: "5",
    nome: "Lembrete Padrão",
    tipo: "Lembrete",
    conteudo: messageTemplates.Lembrete,
    isPadrao: true,
    criadoEm: "2025-01-01",
  },
  {
    id: "6",
    nome: "Lembrete Urgente",
    tipo: "Lembrete",
    conteudo: `Oi [nomeCliente]! ⏰

LEMBRETE IMPORTANTE: Seu horário é amanhã às [horaProcedimento]!

Por favor, confirme sua presença 🙏
Se não puder comparecer, avise com antecedência para reagendarmos 💕

— [nomeStudio]`,
    isPadrao: false,
    criadoEm: "2025-01-03",
  },
  {
    id: "7",
    nome: "Agradecimento Padrão",
    tipo: "Agradecimento",
    conteudo: messageTemplates.Agradecimento,
    isPadrao: true,
    criadoEm: "2025-01-01",
  },
  {
    id: "8",
    nome: "Agradecimento + Avaliação",
    tipo: "Agradecimento",
    conteudo: `Obrigada [nomeCliente]! 💖

Foi um prazer te atender hoje!

💬 Sua opinião é muito importante! Se puder, deixe uma avaliação no nosso Instagram 🌟

Até a próxima 🌷
— [nomeStudio]`,
    isPadrao: false,
    criadoEm: "2025-01-02",
  },
  {
    id: "9",
    nome: "Boas-Vindas Padrão",
    tipo: "BoasVindas",
    conteudo: messageTemplates.BoasVindas,
    isPadrao: true,
    criadoEm: "2025-01-01",
  },
  {
    id: "10",
    nome: "Reagendamento Padrão",
    tipo: "Reagendamento",
    conteudo: messageTemplates.Reagendamento,
    isPadrao: true,
    criadoEm: "2025-01-01",
  },
  {
    id: "11",
    nome: "Cancelamento Padrão",
    tipo: "Cancelamento",
    conteudo: messageTemplates.Cancelamento,
    isPadrao: true,
    criadoEm: "2025-01-01",
  },
];
