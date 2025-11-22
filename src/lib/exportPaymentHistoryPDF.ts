import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentTransaction {
  id: string;
  created_at: string;
  plan_name: string;
  amount: number;
  frequency: string;
  status: string;
}

interface PaymentData {
  transactions: PaymentTransaction[];
  summary: {
    totalPaid: number;
    totalPending: number;
    totalCount: number;
  };
}

export const exportPaymentHistoryPDF = (
  payments: PaymentData,
  dateRange?: { from?: Date; to?: Date }
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(102, 45, 145);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("HISTÓRICO DE PAGAMENTOS", 105, 18, { align: "center" });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("FichaZen", 105, 28, { align: "center" });
  
  // Período
  if (dateRange?.from && dateRange?.to) {
    const periodText = `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
    doc.text(periodText, 105, 35, { align: "center" });
  }
  
  // Resumo
  let yPos = 55;
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMO", 14, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Pago: R$ ${payments.summary.totalPaid.toFixed(2)}`, 14, yPos);
  doc.text(`Total Pendente: R$ ${payments.summary.totalPending.toFixed(2)}`, 80, yPos);
  doc.text(`Transações: ${payments.summary.totalCount}`, 150, yPos);
  
  // Tabela de transações
  yPos += 10;
  autoTable(doc, {
    startY: yPos,
    head: [["Data", "Plano", "Valor", "Frequência", "Status"]],
    body: payments.transactions.map((t) => [
      format(new Date(t.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
      t.plan_name,
      `R$ ${(t.amount / 100).toFixed(2)}`,
      t.frequency === 'MONTHLY' ? 'Mensal' : 'Único',
      t.status === 'paid' ? 'Pago' : 
      t.status === 'pending' ? 'Pendente' : 
      t.status === 'cancelled' ? 'Cancelado' : 'Falhou'
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [102, 45, 145],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold"
    },
    bodyStyles: {
      fontSize: 9
    }
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    105,
    285,
    { align: "center" }
  );
  
  doc.save(`historico-pagamentos-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};
