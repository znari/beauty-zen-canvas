/**
 * Utilitários para integração com WhatsApp
 * Permite envio de mensagens prontas com variáveis dinâmicas
 */

export type MessageType = "ConfirmacaoAgendamento" | "EnvioFicha" | "Lembrete" | "Agradecimento" | "BoasVindas" | "Reagendamento" | "Cancelamento";

export interface WhatsAppMessageParams {
  nomeCliente: string;
  telefone: string;
  dataProcedimento?: string;
  horaProcedimento?: string;
  procedimentos?: string[];
  linkFicha?: string;
  nomeStudio?: string;
}

/**
 * Templates de mensagens padrão do WhatsApp
 * Podem ser personalizados nas configurações
 */
export const messageTemplates: Record<MessageType, string> = {
  ConfirmacaoAgendamento: `Oi [nomeCliente]! ✨

Seu agendamento está confirmado para [dataProcedimento] às [horaProcedimento].

Te esperamos com muito carinho 💕
— [nomeStudio]`,

  EnvioFicha: `Oi [nomeCliente]! 🌸

Para garantir o melhor atendimento, precisamos que você preencha sua ficha de anamnese.

Por favor, acesse o link abaixo:
[linkFicha]

Obrigada 💕
— [nomeStudio]`,

  Lembrete: `Oi [nomeCliente]! ✨

Passando para lembrar do seu horário amanhã às [horaProcedimento].

Te esperamos com muito carinho 💕
— [nomeStudio]`,

  Agradecimento: `Obrigada [nomeCliente]! 💖

Foi um prazer te atender hoje!
Espero te ver novamente em breve 🌷

— [nomeStudio]`,

  BoasVindas: `Olá [nomeCliente]! 💫

Seja bem-vinda! Estamos muito felizes em te receber 🌸

Qualquer dúvida, estamos à disposição 💕
— [nomeStudio]`,

  Reagendamento: `Oi [nomeCliente]! 💫

Seu agendamento foi reagendado para [dataProcedimento] às [horaProcedimento].
Se precisar alterar novamente, é só me avisar por aqui 🌸

— [nomeStudio]`,

  Cancelamento: `Oi [nomeCliente]! ⚠️

Seu agendamento foi cancelado com sucesso.
Quando quiser marcar novamente, é só me chamar 💅

— [nomeStudio]`,
};

/**
 * Substitui variáveis dinâmicas no template de mensagem
 * Usa formato [variavel] para compatibilidade
 */
function replaceVariables(template: string, params: WhatsAppMessageParams): string {
  let message = template;

  // Substituir variáveis com formato [variavel]
  message = message.replace(/\[nomeCliente\]/g, params.nomeCliente);
  
  if (params.dataProcedimento) {
    message = message.replace(/\[dataProcedimento\]/g, params.dataProcedimento);
  }
  
  if (params.horaProcedimento) {
    message = message.replace(/\[horaProcedimento\]/g, params.horaProcedimento);
  }
  
  if (params.procedimentos && params.procedimentos.length > 0) {
    message = message.replace(/\[procedimentos\]/g, params.procedimentos.join(", "));
  }
  
  if (params.linkFicha) {
    message = message.replace(/\[linkFicha\]/g, params.linkFicha);
  }

  if (params.nomeStudio) {
    message = message.replace(/\[nomeStudio\]/g, params.nomeStudio);
  }

  return message;
}

/**
 * Formata número de telefone para formato WhatsApp internacional
 * Adiciona prefixo +55 (Brasil) se não estiver presente
 * 
 * @param phone - Número de telefone em qualquer formato
 * @returns Número formatado com código do país (ex: 5565993550830)
 * 
 * @example
 * formatPhoneNumber("65993550830") → "5565993550830"
 * formatPhoneNumber("5565993550830") → "5565993550830" (mantém)
 * formatPhoneNumber("(65) 99355-0830") → "5565993550830"
 */
function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, "");
  
  // Se já começa com 55 (código do Brasil), retorna direto
  if (cleaned.startsWith("55")) {
    return cleaned;
  }
  
  // Caso contrário, adiciona o prefixo 55 (Brasil)
  return `55${cleaned}`;
}

/**
 * Gera link do WhatsApp com mensagem pré-preenchida
 * Usa formato oficial wa.me para máxima compatibilidade
 * 
 * @param numero - Número de telefone (será normalizado automaticamente)
 * @param mensagem - Mensagem a ser enviada (será codificada automaticamente)
 * @returns URL completa do WhatsApp Web/App
 * 
 * @example
 * gerarLinkWhatsApp("65993550830", "Oi! Como vai?")
 * → "https://wa.me/5565993550830?text=Oi!%20Como%20vai%3F"
 */
export function gerarLinkWhatsApp(numero: string, mensagem: string): string {
  const numeroFormatado = formatPhoneNumber(numero);
  const textoCodificado = encodeURIComponent(mensagem);
  return `https://wa.me/${numeroFormatado}?text=${textoCodificado}`;
}

/**
 * Abre WhatsApp com mensagem pré-preenchida
 * 
 * @param messageType - Tipo de mensagem a ser enviada
 * @param params - Parâmetros dinâmicos para substituição no template
 * @param customMessage - Mensagem personalizada (sobrescreve template)
 * @returns void
 * 
 * @example
 * openWhatsAppMessage("EnvioFicha", {
 *   nomeCliente: "Maria Silva",
 *   telefone: "(11) 98765-4321",
 *   linkFicha: "https://fichazen.com/ficha/123",
 *   nomeStudio: "Studio Bela"
 * });
 */
export function openWhatsAppMessage(
  messageType: MessageType,
  params: WhatsAppMessageParams,
  customMessage?: string
): void {
  try {
    // Adicionar nome do estúdio padrão se não fornecido
    const paramsWithDefaults = {
      ...params,
      nomeStudio: params.nomeStudio || "FichaZen"
    };

    // Obter template ou usar mensagem customizada
    const template = customMessage || messageTemplates[messageType];
    
    if (!template) {
      console.error(`Template de mensagem "${messageType}" não encontrado`);
      return;
    }

    // Substituir variáveis no template
    const message = replaceVariables(template, paramsWithDefaults);

    // Gerar link do WhatsApp
    const whatsappUrl = gerarLinkWhatsApp(params.telefone, message);

    // Abrir WhatsApp em nova aba
    window.open(whatsappUrl, "_blank");

    console.log("WhatsApp aberto com sucesso:", {
      tipo: messageType,
      destinatario: params.nomeCliente,
      telefone: formatPhoneNumber(params.telefone),
    });
  } catch (error) {
    console.error("Erro ao abrir WhatsApp:", error);
  }
}

/**
 * Gera preview de mensagem com variáveis de exemplo
 * Útil para visualização nas configurações
 */
export function gerarPreviewMensagem(template: string): string {
  const variaveisExemplo = {
    nomeCliente: "Ana",
    telefone: "",
    dataProcedimento: "12/11",
    horaProcedimento: "14:00",
    linkFicha: "https://fichazen.app/ficha/123",
    nomeStudio: "Studio Bela",
  };

  return replaceVariables(template, variaveisExemplo);
}

/**
 * Gera link de ficha de anamnese
 */
export function generateAnamnesisLink(clientId: string | number): string {
  return `${window.location.origin}/ficha/${clientId}`;
}

/**
 * Formata data para formato brasileiro (DD/MM)
 */
export function formatDate(date: string | Date): string {
  if (typeof date === "string") {
    // Se for string no formato YYYY-MM-DD
    const [year, month, day] = date.split("-");
    return `${day}/${month}`;
  }
  
  // Se for objeto Date
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

/**
 * Formata hora para formato brasileiro (HH:MM)
 */
export function formatTime(time: string): string {
  // Se já estiver no formato HH:MM, retorna direto
  if (time.includes(":")) {
    return time;
  }
  
  // Se for timestamp, converte
  const date = new Date(time);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
