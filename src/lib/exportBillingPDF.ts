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
  
  // Configurações
  const primaryColor: [number, number, number] = [102, 45, 145]; // #662d91
  const textColor: [number, number, number] = [51, 51, 51];
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DE FATURAMENTO", 105, 15, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(studioName, 105, 25, { align: "center" });
  
  const monthText = format(month, "MMMM 'de' yyyy", { locale: ptBR });
  doc.text(
    monthText.charAt(0).toUpperCase() + monthText.slice(1),
    105,
    32,
    { align: "center" }
  );
  
  // Resetar cor do texto
  doc.setTextColor(...textColor);
  
  let yPosition = 50;
  
  // Resumo Financeiro
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("RESUMO FINANCEIRO", 14, yPosition);
  
  yPosition += 2;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(14, yPosition, 196, yPosition);
  
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textColor);
  
  const summaryData = [
    ["Faturamento Total:", `R$ ${stats.totalRevenue.toFixed(2)}`],
    ["Receita Pendente:", `R$ ${stats.totalPendingRevenue.toFixed(2)}`],
    ["Visitas Realizadas:", stats.completedVisits.toString()],
    ["Total de Visitas:", stats.totalVisits.toString()],
    [
      "Ticket Médio:",
      stats.completedVisits > 0
        ? `R$ ${(stats.totalRevenue / stats.completedVisits).toFixed(2)}`
        : "R$ 0,00",
    ],
    [
      "Crescimento:",
      `${stats.revenueGrowth >= 0 ? "+" : ""}${stats.revenueGrowth.toFixed(1)}%`,
    ],
  ];
  
  summaryData.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 20, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(value, 120, yPosition);
    yPosition += 8;
  });
  
  yPosition += 5;
  
  // Top 5 Procedimentos
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("TOP 5 PROCEDIMENTOS", 14, yPosition);
  
  yPosition += 2;
  doc.line(14, yPosition, 196, yPosition);
  yPosition += 5;
  
  if (stats.topProcedures.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [["Procedimento", "Quantidade", "Faturamento"]],
      body: stats.topProcedures.map((proc) => [
        proc.name,
        proc.count.toString(),
        `R$ ${proc.revenue.toFixed(2)}`,
      ]),
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 10,
      },
      margin: { left: 14, right: 14 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text("Nenhum procedimento realizado neste período", 20, yPosition + 5);
    yPosition += 15;
  }
  
  // Top 5 Clientes
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("TOP 5 CLIENTES", 14, yPosition);
  
  yPosition += 2;
  doc.line(14, yPosition, 196, yPosition);
  yPosition += 5;
  
  if (stats.topClients.length > 0) {
    autoTable(doc, {
      startY: yPosition,
      head: [["Cliente", "Visitas", "Total Gasto"]],
      body: stats.topClients.map((client) => [
        client.name,
        client.visits.toString(),
        `R$ ${client.totalSpent.toFixed(2)}`,
      ]),
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 10,
      },
      margin: { left: 14, right: 14 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 128, 128);
    doc.text("Nenhum cliente com visitas neste período", 20, yPosition + 5);
    yPosition += 15;
  }
  
  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(128, 128, 128);
  const now = new Date();
  doc.text(
    `Gerado em: ${format(now, "dd/MM/yyyy 'às' HH:mm")}`,
    105,
    280,
    { align: "center" }
  );
  
  // Salvar PDF
  const fileName = `faturamento-${format(month, "yyyy-MM")}.pdf`;
  doc.save(fileName);
};
