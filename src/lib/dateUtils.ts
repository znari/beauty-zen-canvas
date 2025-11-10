import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Converte string de data (YYYY-MM-DD) para Date local
 * sem conversão de timezone
 * 
 * Previne o bug onde new Date("2025-11-15") é interpretado como UTC midnight,
 * resultando em 14/11 no fuso horário do Brasil
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Formata string de data do banco (YYYY-MM-DD) para exibição
 * sem conversão de timezone
 */
export const formatLocalDate = (dateString: string, formatStr: string): string => {
  const date = parseLocalDate(dateString);
  return format(date, formatStr, { locale: ptBR });
};
