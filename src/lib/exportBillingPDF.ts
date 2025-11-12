import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { BillingStats } from "@/hooks/useBillingStats";

export const exportBillingToPDF = (
  stats: BillingStats,
  month: Date,
  studioName: string
) => {
  const doc = new jsPDF();
  
  // Paleta de cores refinada
  const colors = {
    primary: [102, 45, 145] as [number, number, number],
    accent: [147, 51, 234] as [number, number, number],
    success: [16, 185, 129] as [number, number, number],
    warning: [245, 158, 11] as [number, number, number],
    text: [51, 51, 51] as [number, number, number],
    light: [249, 250, 251] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
  };
  
  // ========== HEADER APRIMORADO ==========
  // Linha decorativa no topo
  doc.setFillColor(...colors.accent);
  doc.rect(0, 0, 210, 3, "F");
  
  // Header principal com gradiente simulado
  doc.setFillColor(...colors.primary);
  doc.rect(0, 3, 210, 47, "F");
  
  // Adicionar algumas linhas decorativas para simular profundidade
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.line(20, 48, 190, 48);
  
  // Título principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DE FATURAMENTO", 105, 18, { align: "center" });
  
  // Nome do estúdio destacado
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(studioName, 105, 30, { align: "center" });
  
  // Período
  const monthText = format(month, "MMMM 'de' yyyy", { locale: ptBR });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    monthText.charAt(0).toUpperCase() + monthText.slice(1),
    105,
    39,
    { align: "center" }
  );
  
  // Resetar cor do texto
  doc.setTextColor(...colors.text);
  
  let yPosition = 60;
  
  // ========== RESUMO FINANCEIRO COM CARDS ==========
  // Função auxiliar para desenhar cards
  const drawMetricCard = (
    x: number,
    y: number,
    width: number,
    height: number,
    topColor: [number, number, number],
    label: string,
    value: string,
    subtitle?: string
  ) => {
    // Sombra sutil
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(x + 0.5, y + 0.5, width, height, 2, 2, "F");
    
    // Card branco
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 2, 2, "FD");
    
    // Barra colorida no topo
    doc.setFillColor(...topColor);
    doc.rect(x, y, width, 3, "F");
    
    // Label
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text(label, x + width / 2, y + 10, { align: "center" });
    
    // Valor principal
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.text);
    doc.text(value, x + width / 2, y + 20, { align: "center" });
    
    // Subtítulo (opcional)
    if (subtitle) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(subtitle, x + width / 2, y + 27, { align: "center" });
    }
  };
  
  // Background da seção
  doc.setFillColor(...colors.light);
  doc.roundedRect(12, yPosition - 8, 186, 58, 3, 3, "F");
  
  // Título da seção
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.text("RESUMO FINANCEIRO", 16, yPosition);
  
  yPosition += 8;
  
  // Cards de métricas (2x2)
  const cardWidth = 44;
  const cardHeight = 30;
  const cardSpacing = 3;
  const startX = 16;
  
  // Linha 1
  drawMetricCard(
    startX,
    yPosition,
    cardWidth,
    cardHeight,
    colors.primary,
    "FATURAMENTO TOTAL",
    `R$ ${stats.totalRevenue.toFixed(2)}`,
    `${stats.revenueGrowth >= 0 ? "+" : ""}${stats.revenueGrowth.toFixed(1)}% vs mês anterior`
  );
  
  drawMetricCard(
    startX + cardWidth + cardSpacing,
    yPosition,
    cardWidth,
    cardHeight,
    colors.success,
    "VISITAS REALIZADAS",
    stats.completedVisits.toString(),
    `${stats.totalVisits} agendadas`
  );
  
  drawMetricCard(
    startX + (cardWidth + cardSpacing) * 2,
    yPosition,
    cardWidth,
    cardHeight,
    colors.accent,
    "TICKET MÉDIO",
    stats.completedVisits > 0
      ? `R$ ${(stats.totalRevenue / stats.completedVisits).toFixed(2)}`
      : "R$ 0,00"
  );
  
  drawMetricCard(
    startX + (cardWidth + cardSpacing) * 3,
    yPosition,
    cardWidth,
    cardHeight,
    colors.warning,
    "RECEITA PENDENTE",
    `R$ ${stats.totalPendingRevenue.toFixed(2)}`
  );
  
  yPosition += cardHeight + 18;
  
  // ========== TOP 5 PROCEDIMENTOS ==========
  // Background da seção
  doc.setFillColor(...colors.light);
  doc.roundedRect(12, yPosition - 8, 186, 10, 3, 3, "F");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.text("TOP 5 PROCEDIMENTOS", 16, yPosition);
  
  yPosition += 5;
  
  if (stats.topProcedures.length > 0) {
    const totalProceduresRevenue = stats.topProcedures.reduce(
      (sum, p) => sum + p.revenue,
      0
    );
    const totalProceduresCount = stats.topProcedures.reduce(
      (sum, p) => sum + p.count,
      0
    );
    
    autoTable(doc, {
      startY: yPosition,
      head: [["Procedimento", "Quantidade", "Faturamento"]],
      body: stats.topProcedures.map((proc) => [
        proc.name,
        proc.count.toString(),
        `R$ ${proc.revenue.toFixed(2)}`,
      ]),
      foot: [
        [
          "TOTAL",
          totalProceduresCount.toString(),
          `R$ ${totalProceduresRevenue.toFixed(2)}`,
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 4,
      },
      footStyles: {
        fillColor: colors.light,
        textColor: colors.primary,
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      margin: { left: 14, right: 14 },
      tableLineColor: colors.border,
      tableLineWidth: 0.3,
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text("Nenhum procedimento realizado neste período", 20, yPosition + 5);
    yPosition += 18;
  }
  
  // ========== TOP 5 CLIENTES ==========
  // Background da seção
  doc.setFillColor(...colors.light);
  doc.roundedRect(12, yPosition - 8, 186, 10, 3, 3, "F");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.text("TOP 5 CLIENTES", 16, yPosition);
  
  yPosition += 5;
  
  if (stats.topClients.length > 0) {
    const totalClientsVisits = stats.topClients.reduce(
      (sum, c) => sum + c.visits,
      0
    );
    const totalClientsSpent = stats.topClients.reduce(
      (sum, c) => sum + c.totalSpent,
      0
    );
    
    autoTable(doc, {
      startY: yPosition,
      head: [["Cliente", "Visitas", "Total Gasto"]],
      body: stats.topClients.map((client) => [
        client.name,
        client.visits.toString(),
        `R$ ${client.totalSpent.toFixed(2)}`,
      ]),
      foot: [
        [
          "TOTAL",
          totalClientsVisits.toString(),
          `R$ ${totalClientsSpent.toFixed(2)}`,
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 4,
      },
      footStyles: {
        fillColor: colors.light,
        textColor: colors.primary,
        fontSize: 10,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      margin: { left: 14, right: 14 },
      tableLineColor: colors.border,
      tableLineWidth: 0.3,
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text("Nenhum cliente com visitas neste período", 20, yPosition + 5);
    yPosition += 15;
  }
  
  // ========== FOOTER MELHORADO ==========
  // Linha decorativa superior
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.line(14, 275, 196, 275);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(128, 128, 128);
  const now = new Date();
  doc.text(
    `Relatório gerado em: ${format(now, "dd/MM/yyyy 'às' HH:mm")}`,
    105,
    282,
    { align: "center" }
  );
  
  doc.setFontSize(7);
  doc.text("Powered by FichaZen • Página 1 de 1", 105, 287, {
    align: "center",
  });
  
  // Salvar PDF
  const fileName = `faturamento-${format(month, "yyyy-MM")}.pdf`;
  doc.save(fileName);
};
