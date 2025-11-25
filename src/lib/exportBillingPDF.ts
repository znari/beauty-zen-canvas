import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { BillingStats } from "@/hooks/useBillingStats";

export const exportBillingToPDF = (
  stats: BillingStats,
  month: Date,
  studioName: string,
  professionalName?: string | null
) => {
  const doc = new jsPDF();
  
  // Paleta de cores profissional
  const colors = {
    primary: [102, 45, 145] as [number, number, number],
    primaryLight: [147, 51, 234] as [number, number, number],
    success: [16, 185, 129] as [number, number, number],
    warning: [245, 158, 11] as [number, number, number],
    danger: [239, 68, 68] as [number, number, number],
    text: [31, 41, 55] as [number, number, number],
    textMuted: [107, 114, 128] as [number, number, number],
    light: [249, 250, 251] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
  };
  
  // ========== HEADER PREMIUM ==========
  // Barra superior decorativa com gradiente simulado
  doc.setFillColor(...colors.primaryLight);
  doc.rect(0, 0, 210, 4, "F");
  doc.setFillColor(...colors.primary);
  doc.rect(0, 4, 210, 50, "F");
  
  
  // Título principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DE FATURAMENTO", 105, 20, { align: "center" });
  
  // Nome do estúdio
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(studioName, 105, 32, { align: "center" });
  
  // Período
  const monthText = format(month, "MMMM 'de' yyyy", { locale: ptBR });
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    monthText.charAt(0).toUpperCase() + monthText.slice(1),
    105,
    42,
    { align: "center" }
  );
  
  // Badge do profissional filtrado (se houver)
  let yPosition = 62;
  
  if (professionalName) {
    doc.setFillColor(...colors.primaryLight);
    const badgeText = `Profissional: ${professionalName}`;
    const textWidth = doc.getTextWidth(badgeText);
    const badgeWidth = textWidth + 16;
    const badgeX = (210 - badgeWidth) / 2;
    
    doc.roundedRect(badgeX, 48, badgeWidth, 8, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(badgeText, 105, 53.5, { align: "center" });
    yPosition = 66;
  }
  
  // Resetar cor do texto
  doc.setTextColor(...colors.text);
  
  // ========== RESUMO EXECUTIVO ==========
  doc.setFillColor(...colors.light);
  doc.roundedRect(14, yPosition - 4, 182, 22, 3, 3, "F");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.text("RESUMO EXECUTIVO", 20, yPosition + 3);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.textMuted);
  
  const completionRate = stats.totalVisits > 0 
    ? ((stats.completedVisits / stats.totalVisits) * 100).toFixed(1) 
    : "0";
  
  const executiveSummary = professionalName
    ? `Este relatório apresenta o desempenho financeiro de ${professionalName} em ${monthText}. Foram realizadas ${stats.completedVisits} visitas com faturamento de R$ ${stats.totalRevenue.toFixed(2)} e taxa de conclusão de ${completionRate}%.`
    : `Este relatório apresenta o desempenho financeiro consolidado de ${monthText}. Foram realizadas ${stats.completedVisits} visitas com faturamento total de R$ ${stats.totalRevenue.toFixed(2)} e taxa de conclusão de ${completionRate}%.`;
  
  const summaryLines = doc.splitTextToSize(executiveSummary, 172);
  doc.text(summaryLines, 20, yPosition + 11);
  
  yPosition += 28;
  
  // ========== INDICADORES PRINCIPAIS (KPIs) ==========
  const drawKPICard = (
    x: number,
    y: number,
    width: number,
    height: number,
    topColor: [number, number, number],
    label: string,
    value: string,
    subtitle?: string,
    highlight?: boolean
  ) => {
    // Sombra
    doc.setFillColor(200, 200, 200);
    doc.roundedRect(x + 1, y + 1, width, height, 3, 3, "F");
    
    // Card
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 3, 3, "FD");
    
    // Barra colorida no topo
    doc.setFillColor(...topColor);
    doc.roundedRect(x, y, width, 4, 3, 3, "F");
    doc.setFillColor(...topColor);
    doc.rect(x, y + 2, width, 2, "F");
    
    // Label
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.textMuted);
    doc.text(label, x + width / 2, y + 12, { align: "center" });
    
    // Valor principal
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.text);
    doc.text(value, x + width / 2, y + 22, { align: "center" });
    
    // Subtítulo
    if (subtitle) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      const subtitleColor = highlight 
        ? (stats.revenueGrowth >= 0 ? colors.success : colors.danger)
        : colors.textMuted;
      doc.setTextColor(...subtitleColor);
      doc.text(subtitle, x + width / 2, y + 29, { align: "center" });
    }
  };
  
  // Título da seção
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.text("INDICADORES FINANCEIROS", 20, yPosition);
  yPosition += 6;
  
  const cardWidth = 44;
  const cardHeight = 35;
  const cardSpacing = 4;
  const startX = 15;
  
  const avgTicket = stats.completedVisits > 0 
    ? stats.totalRevenue / stats.completedVisits 
    : 0;
  
  drawKPICard(
    startX,
    yPosition,
    cardWidth,
    cardHeight,
    colors.primary,
    "FATURAMENTO",
    `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `${stats.revenueGrowth >= 0 ? "+" : ""}${stats.revenueGrowth.toFixed(1)}% vs anterior`,
    true
  );
  
  drawKPICard(
    startX + cardWidth + cardSpacing,
    yPosition,
    cardWidth,
    cardHeight,
    colors.success,
    "VISITAS",
    stats.completedVisits.toString(),
    `de ${stats.totalVisits} agendadas`
  );
  
  drawKPICard(
    startX + (cardWidth + cardSpacing) * 2,
    yPosition,
    cardWidth,
    cardHeight,
    colors.primaryLight,
    "TICKET MEDIO",
    `R$ ${avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  );
  
  drawKPICard(
    startX + (cardWidth + cardSpacing) * 3,
    yPosition,
    cardWidth,
    cardHeight,
    colors.warning,
    "PENDENTE",
    `R$ ${stats.totalPendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  );
  
  yPosition += cardHeight + 12;
  
  // ========== TOP 5 PROCEDIMENTOS ==========
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.text("TOP 5 PROCEDIMENTOS", 20, yPosition);
  yPosition += 4;
  
  if (stats.topProcedures.length > 0) {
    const totalProceduresRevenue = stats.topProcedures.reduce(
      (sum, p) => sum + p.revenue, 0
    );
    
    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Procedimento", "Qtd.", "Faturamento", "% Total"]],
      body: stats.topProcedures.map((proc, index) => {
        const percentage = stats.totalRevenue > 0 
          ? ((proc.revenue / stats.totalRevenue) * 100).toFixed(1) 
          : "0";
        return [
          (index + 1).toString(),
          proc.name,
          proc.count.toString(),
          `R$ ${proc.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `${percentage}%`,
        ];
      }),
      foot: [[
        "",
        "TOTAL TOP 5",
        stats.topProcedures.reduce((sum, p) => sum + p.count, 0).toString(),
        `R$ ${totalProceduresRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        stats.totalRevenue > 0 
          ? `${((totalProceduresRevenue / stats.totalRevenue) * 100).toFixed(1)}%` 
          : "0%",
      ]],
      theme: "striped",
      headStyles: {
        fillColor: colors.primary,
        textColor: colors.white,
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
      },
      footStyles: {
        fillColor: colors.light,
        textColor: colors.primary,
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 3,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "left" },
        2: { halign: "center", cellWidth: 18 },
        3: { halign: "right", cellWidth: 35 },
        4: { halign: "center", cellWidth: 22 },
      },
      margin: { left: 14, right: 14 },
      tableLineColor: colors.border,
      tableLineWidth: 0.2,
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...colors.textMuted);
    doc.text("Nenhum procedimento realizado neste período", 20, yPosition + 5);
    yPosition += 14;
  }
  
  // ========== TOP 5 CLIENTES ==========
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.text("TOP 5 CLIENTES", 20, yPosition);
  yPosition += 4;
  
  if (stats.topClients.length > 0) {
    const totalClientsSpent = stats.topClients.reduce(
      (sum, c) => sum + c.totalSpent, 0
    );
    
    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Cliente", "Visitas", "Total Gasto", "% Total"]],
      body: stats.topClients.map((client, index) => {
        const percentage = stats.totalRevenue > 0 
          ? ((client.totalSpent / stats.totalRevenue) * 100).toFixed(1) 
          : "0";
        return [
          (index + 1).toString(),
          client.name,
          client.visits.toString(),
          `R$ ${client.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          `${percentage}%`,
        ];
      }),
      foot: [[
        "",
        "TOTAL TOP 5",
        stats.topClients.reduce((sum, c) => sum + c.visits, 0).toString(),
        `R$ ${totalClientsSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        stats.totalRevenue > 0 
          ? `${((totalClientsSpent / stats.totalRevenue) * 100).toFixed(1)}%` 
          : "0%",
      ]],
      theme: "striped",
      headStyles: {
        fillColor: colors.primary,
        textColor: colors.white,
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
      },
      footStyles: {
        fillColor: colors.light,
        textColor: colors.primary,
        fontSize: 9,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 3,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "left" },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "right", cellWidth: 35 },
        4: { halign: "center", cellWidth: 22 },
      },
      margin: { left: 14, right: 14 },
      tableLineColor: colors.border,
      tableLineWidth: 0.2,
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...colors.textMuted);
    doc.text("Nenhum cliente com visitas neste período", 20, yPosition + 5);
    yPosition += 14;
  }
  
  // ========== INSIGHTS DO PERÍODO ==========
  // Gerar insights primeiro para calcular altura
  const insights: string[] = [];
  
  // Insight 1: Crescimento
  if (stats.revenueGrowth !== 0) {
    if (stats.revenueGrowth > 0) {
      insights.push("Crescimento de " + stats.revenueGrowth.toFixed(1) + "% em relacao ao mes anterior");
    } else {
      insights.push("Reducao de " + Math.abs(stats.revenueGrowth).toFixed(1) + "% em relacao ao mes anterior");
    }
  }
  
  // Insight 2: Procedimento mais lucrativo
  if (stats.topProcedures.length > 0) {
    const topProc = stats.topProcedures[0];
    const procPercentage = stats.totalRevenue > 0 
      ? ((topProc.revenue / stats.totalRevenue) * 100).toFixed(1) 
      : "0";
    insights.push(topProc.name + " representa " + procPercentage + "% do faturamento total");
  }
  
  // Insight 3: Taxa de conclusão
  if (stats.totalVisits > 0) {
    const completionRateNum = (stats.completedVisits / stats.totalVisits) * 100;
    insights.push("Taxa de conclusao: " + completionRateNum.toFixed(1) + "% (" + stats.completedVisits + " de " + stats.totalVisits + " agendamentos)");
  }
  
  // Insight 4: Concentração de clientes
  if (stats.topClients.length > 0 && stats.totalRevenue > 0) {
    const top5Revenue = stats.topClients.reduce((sum, c) => sum + c.totalSpent, 0);
    const concentration = ((top5Revenue / stats.totalRevenue) * 100).toFixed(1);
    insights.push("Top 5 clientes representam " + concentration + "% do faturamento total");
  }
  
  // Se não houver insights, adicionar um genérico
  if (insights.length === 0) {
    insights.push("Periodo sem atividade registrada para analise");
  }
  
  // Calcular altura dinâmica da caixa de insights
  const insightsHeight = 14 + (insights.length * 7);
  
  // Verificar se há espaço suficiente na página
  if (yPosition + insightsHeight > 260) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFillColor(...colors.light);
  doc.roundedRect(14, yPosition - 4, 182, insightsHeight, 3, 3, "F");
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.text("INSIGHTS DO PERIODO", 20, yPosition + 3);
  
  const insightStartY = yPosition + 10;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.text);
  
  insights.forEach((insight, index) => {
    doc.text("- " + insight, 20, insightStartY + (index * 6));
  });
  
  // ========== FOOTER PROFISSIONAL ==========
  const pageHeight = doc.internal.pageSize.height;
  
  // Linha decorativa
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 22, 196, pageHeight - 22);
  
  // Data de geração
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.textMuted);
  const now = new Date();
  doc.text(
    `Relatório gerado em ${format(now, "dd/MM/yyyy 'às' HH:mm")}`,
    105,
    pageHeight - 16,
    { align: "center" }
  );
  
  // Branding
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.textMuted);
  doc.text("FichaZen - Sistema de Gestao para Profissionais de Beleza", 14, pageHeight - 10);
  
  // Página
  doc.setFontSize(7);
  doc.text("Pagina 1", 196, pageHeight - 10, { align: "right" });
  
  // ========== SALVAR PDF ==========
  // Nome do arquivo dinâmico
  let fileName = `faturamento-${format(month, "yyyy-MM")}`;
  if (professionalName) {
    // Normalizar nome para filename (remover acentos e espaços)
    const normalizedName = professionalName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
    fileName += `-${normalizedName}`;
  }
  fileName += ".pdf";
  
  doc.save(fileName);
};
