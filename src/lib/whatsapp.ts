/**
 * Utilitários para integração com WhatsApp
 * Permite envio de mensagens prontas com variáveis dinâmicas
 */

export type MessageType = "ConfirmacaoAgendamento" | "EnvioFicha" | "Lembrete" | "BoasVindas";

export interface WhatsAppMessageParams {
  nomeCliente: string;
  telefone: string;
  data?: string;
  hora?: string;
  procedimentos?: string[];
  linkFicha?: string;
}

/**
 * Templates de mensagens padrão do WhatsApp
 * Podem ser personalizados nas configurações futuramente
 */
const messageTemplates: Record<MessageType, string> = {
  ConfirmacaoAgendamento: `Olá {nomeCliente}! 🌸

Seu agendamento para {data} às {hora} foi confirmado.

Procedimento(s): {procedimentos}

Te esperamos no estúdio 💅✨`,

  EnvioFicha: `Oi {nomeCliente}! 💜

Para garantir o melhor atendimento, precisamos que você preencha sua ficha de anamnese.

Por favor, acesse o link abaixo:
{linkFicha}

Obrigada! ✨`,

  Lembrete: `Oi {nomeCliente}! ✨

Passando para lembrar do seu horário amanhã às {hora}.

Procedimento(s): {procedimentos}

Até logo! 💕`,

  BoasVindas: `Olá {nomeCliente}! 😊

Seja bem-vinda ao FichaZen! 💜

Estamos muito felizes em te ter como cliente. Qualquer dúvida, estamos à disposição! ✨`,
};

/**
 * Substitui variáveis dinâmicas no template de mensagem
 */
function replaceVariables(template: string, params: WhatsAppMessageParams): string {
  let message = template;

  // Substituir variáveis básicas
  message = message.replace(/{nomeCliente}/g, params.nomeCliente);
  
  if (params.data) {
    message = message.replace(/{data}/g, params.data);
  }
  
  if (params.hora) {
    message = message.replace(/{hora}/g, params.hora);
  }
  
  if (params.procedimentos && params.procedimentos.length > 0) {
    message = message.replace(/{procedimentos}/g, params.procedimentos.join(", "));
  }
  
  if (params.linkFicha) {
    message = message.replace(/{linkFicha}/g, params.linkFicha);
  }

  return message;
}

/**
 * Formata número de telefone para formato WhatsApp (somente dígitos)
 */
function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, "");
  
  // Se não tem código do país, adiciona 55 (Brasil)
  if (cleaned.length === 11) {
    return `55${cleaned}`;
  }
  
  return cleaned;
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
 *   linkFicha: "https://fichazen.com/ficha/123"
 * });
 */
export function openWhatsAppMessage(
  messageType: MessageType,
  params: WhatsAppMessageParams,
  customMessage?: string
): void {
  try {
    // Obter template ou usar mensagem customizada
    const template = customMessage || messageTemplates[messageType];
    
    if (!template) {
      console.error(`Template de mensagem "${messageType}" não encontrado`);
      return;
    }

    // Substituir variáveis no template
    const message = replaceVariables(template, params);

    // Formatar número de telefone
    const whatsappNumber = formatPhoneNumber(params.telefone);

    // Codificar mensagem para URL
    const encodedMessage = encodeURIComponent(message);

    // Construir URL do WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Abrir WhatsApp em nova aba
    // Se o app não estiver instalado, abre WhatsApp Web automaticamente
    window.open(whatsappUrl, "_blank");

    console.log("WhatsApp aberto com sucesso:", {
      tipo: messageType,
      destinatario: params.nomeCliente,
      telefone: whatsappNumber,
    });
  } catch (error) {
    console.error("Erro ao abrir WhatsApp:", error);
  }
}

/**
 * Gera link de ficha de anamnese
 */
export function generateAnamnesisLink(clientId: string | number): string {
  return `${window.location.origin}/ficha/${clientId}`;
}

/**
 * Formata data para formato brasileiro (DD/MM/YYYY)
 */
export function formatDate(date: string | Date): string {
  if (typeof date === "string") {
    // Se for string no formato YYYY-MM-DD
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }
  
  // Se for objeto Date
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
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
