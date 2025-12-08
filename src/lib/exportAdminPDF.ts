import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminStats {
  total_users: number;
  trial_users: number;
  active_subscribers: number;
  churned_users: number;
  mrr: number;
  total_revenue: number;
  paid_transactions: number;
  pending_transactions: number;
  new_users_this_month: number;
  new_users_last_month: number;
  total_clients: number;
  total_visits: number;
  filled_anamneses: number;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  studio_name: string;
  plan: string;
  subscription_status: string;
  client_count: number;
  total_revenue: number;
}

interface AdminTransaction {
  id: string;
  user_name: string;
  plan_id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface GrowthData {
  month: string;
  new_users: number;
  new_subscribers: number;
  revenue: number;
}

interface ExportAdminPDFParams {
  stats: AdminStats;
  users: AdminUser[];
  transactions: AdminTransaction[];
  growth: GrowthData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const getPlanName = (plan: string) => {
  const names: Record<string, string> = {
    free: "Gratuito",
    essencial: "Essencial",
    pro: "Pro",
    ultimate: "Ultimate",
  };
  return names[plan] || plan;
};

const getStatusName = (status: string) => {
  const names: Record<string, string> = {
    trialing: "Em Trial",
    active: "Ativo",
    expired: "Expirado",
    cancelled: "Cancelado",
  };
  return names[status] || status;
};

export const exportAdminPDF = ({
  stats,
  users,
  transactions,
  growth,
}: ExportAdminPDFParams) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229); // Primary color
  doc.text("FichaZen Admin", 14, yPos);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Relatório Administrativo", 14, yPos + 8);
  
  doc.setFontSize(10);
  doc.text(
    `Gerado em ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`,
    14,
    yPos + 15
  );

  yPos += 30;

  // KPIs Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Métricas Principais", 14, yPos);
  yPos += 8;

  const kpis = [
    ["Total de Usuários", stats.total_users.toString()],
    ["Em Trial", stats.trial_users.toString()],
    ["Assinantes Ativos", stats.active_subscribers.toString()],
    ["Churned", stats.churned_users.toString()],
    ["MRR", formatCurrency(stats.mrr)],
    ["Receita Total", formatCurrency(stats.total_revenue)],
    ["Novos Este Mês", stats.new_users_this_month.toString()],
    ["Novos Mês Passado", stats.new_users_last_month.toString()],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [["Métrica", "Valor"]],
    body: kpis,
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: "bold" },
      1: { halign: "right" },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Plan Distribution
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Distribuição por Plano", 14, yPos);
  yPos += 8;

  const planCounts = users.reduce((acc, user) => {
    const plan = user.plan || "free";
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const planData = Object.entries(planCounts).map(([plan, count]) => [
    getPlanName(plan),
    count.toString(),
    `${((count / users.length) * 100).toFixed(1)}%`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Plano", "Usuários", "Percentual"]],
    body: planData,
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    styles: { fontSize: 10 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Top Users by Revenue
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Top 10 Usuários por Faturamento", 14, yPos);
  yPos += 8;

  const topUsers = [...users]
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 10)
    .map((user, index) => [
      `${index + 1}º`,
      user.full_name || "Sem nome",
      user.studio_name || "-",
      getPlanName(user.plan),
      user.client_count.toString(),
      formatCurrency(user.total_revenue),
    ]);

  autoTable(doc, {
    startY: yPos,
    head: [["#", "Nome", "Studio", "Plano", "Clientes", "Faturamento"]],
    body: topUsers,
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { halign: "center", cellWidth: 15 },
      5: { halign: "right" },
    },
  });

  // New page for growth and transactions
  doc.addPage();
  yPos = 20;

  // Growth Data
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Crescimento Mensal", 14, yPos);
  yPos += 8;

  const growthData = growth.map((g) => [
    g.month,
    g.new_users.toString(),
    g.new_subscribers.toString(),
    formatCurrency(g.revenue),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Mês", "Novos Usuários", "Novos Assinantes", "Receita"]],
    body: growthData,
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    styles: { fontSize: 10 },
    columnStyles: {
      3: { halign: "right" },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Recent Transactions
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Últimas 15 Transações", 14, yPos);
  yPos += 8;

  const recentTransactions = transactions.slice(0, 15).map((t) => [
    format(new Date(t.created_at), "dd/MM/yyyy", { locale: ptBR }),
    t.user_name || "Desconhecido",
    getPlanName(t.plan_id),
    formatCurrency(t.amount),
    getStatusName(t.status),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Data", "Usuário", "Plano", "Valor", "Status"]],
    body: recentTransactions,
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: {
      3: { halign: "right" },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `FichaZen Admin - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save
  const fileName = `fichazen-admin-${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
};
