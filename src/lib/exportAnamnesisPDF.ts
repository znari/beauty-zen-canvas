import jsPDF from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AnamnesisData {
  clientName: string;
  dateOfBirth?: string | null;
  filledAt?: string | null;
  responses: {
    isPregnantOrBreastfeeding?: string;
    useContinuousMedication?: string;
    medicationDetails?: string;
    hasAllergies?: string;
    allergyDetails?: string;
    previousProcedure?: string;
    previousProcedureDetails?: string;
    skinConditions?: string;
    skinConditionDetails?: string;
    additionalNotes?: string;
    consentTerms?: boolean;
    // Legacy fields
    q1_alergia?: string;
    q1_alergia_details?: string;
    q2_medicamento?: string;
    q2_medicamento_details?: string;
    q3_doenca?: string;
    q3_doenca_details?: string;
    q4_gravida?: string;
    q5_observacao?: string;
    q5_observacao_details?: string;
    consentimento?: boolean;
  };
}

export const exportAnamnesisToPDF = (
  data: AnamnesisData,
  studioName?: string
) => {
  const doc = new jsPDF();
  
  // Paleta de cores
  const colors = {
    primary: [102, 45, 145] as [number, number, number],
    primaryLight: [147, 51, 234] as [number, number, number],
    success: [16, 185, 129] as [number, number, number],
    text: [31, 41, 55] as [number, number, number],
    textMuted: [107, 114, 128] as [number, number, number],
    light: [249, 250, 251] as [number, number, number],
    border: [229, 231, 235] as [number, number, number],
  };

  // Helper para normalizar respostas (legacy + new)
  const getAnswer = (newField?: string, legacyField?: string): boolean => {
    if (newField === "yes" || legacyField === "sim") return true;
    return false;
  };

  const getDetails = (newField?: string, legacyField?: string): string => {
    return newField || legacyField || "";
  };

  const responses = data.responses || {};

  // Normalizar campos
  const isPregnant = getAnswer(responses.isPregnantOrBreastfeeding, responses.q4_gravida);
  const usesMedication = getAnswer(responses.useContinuousMedication, responses.q2_medicamento);
  const medicationDetails = getDetails(responses.medicationDetails, responses.q2_medicamento_details);
  const hasAllergies = getAnswer(responses.hasAllergies, responses.q1_alergia);
  const allergyDetails = getDetails(responses.allergyDetails, responses.q1_alergia_details);
  const hadPreviousProcedure = getAnswer(responses.previousProcedure);
  const previousProcedureDetails = responses.previousProcedureDetails || "";
  const hasSkinConditions = getAnswer(responses.skinConditions, responses.q3_doenca);
  const skinConditionDetails = getDetails(responses.skinConditionDetails, responses.q3_doenca_details);
  const additionalNotes = responses.additionalNotes || responses.q5_observacao_details || "";
  const hasConsent = responses.consentTerms || responses.consentimento || false;

  // ========== HEADER ==========
  doc.setFillColor(...colors.primaryLight);
  doc.rect(0, 0, 210, 4, "F");
  doc.setFillColor(...colors.primary);
  doc.rect(0, 4, 210, 40, "F");
  
  // Logo/Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("FichaZen", 105, 14, { align: "center" });
  
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("FICHA DE ANAMNESE", 105, 26, { align: "center" });
  
  if (studioName) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(studioName, 105, 36, { align: "center" });
  }

  let yPosition = 54;

  // ========== INFORMAÇÕES DO CLIENTE ==========
  doc.setFillColor(...colors.light);
  doc.roundedRect(14, yPosition - 4, 182, 26, 3, 3, "F");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.text("DADOS DO CLIENTE", 20, yPosition + 3);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.text);
  doc.text(`Nome: ${data.clientName}`, 20, yPosition + 12);
  
  if (data.dateOfBirth) {
    try {
      const dob = new Date(data.dateOfBirth + "T00:00:00");
      doc.text(`Data de Nascimento: ${format(dob, "dd/MM/yyyy")}`, 20, yPosition + 19);
    } catch {
      doc.text(`Data de Nascimento: ${data.dateOfBirth}`, 20, yPosition + 19);
    }
  }

  yPosition += 32;

  // ========== INFORMAÇÕES DE SAÚDE ==========
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.text("INFORMAÇÕES DE SAÚDE", 20, yPosition);
  
  yPosition += 8;

  const drawQuestion = (question: string, answer: boolean, details?: string) => {
    const icon = answer ? "✓ Sim" : "✗ Não";
    const iconColor = answer ? colors.success : colors.textMuted;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.text);
    doc.text(question, 20, yPosition);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...iconColor);
    doc.text(icon, 150, yPosition);
    
    yPosition += 6;
    
    if (answer && details) {
      doc.setFontSize(9);
      doc.setTextColor(...colors.textMuted);
      const detailLines = doc.splitTextToSize(`→ ${details}`, 160);
      doc.text(detailLines, 24, yPosition);
      yPosition += detailLines.length * 5;
    }
    
    yPosition += 4;
  };

  drawQuestion("Gestante ou amamentando?", isPregnant);
  drawQuestion("Uso de medicamentos contínuos?", usesMedication, medicationDetails);
  drawQuestion("Possui alergias?", hasAllergies, allergyDetails);
  drawQuestion("Procedimento anterior?", hadPreviousProcedure, previousProcedureDetails);
  drawQuestion("Condições de pele?", hasSkinConditions, skinConditionDetails);

  // Observações
  if (additionalNotes) {
    yPosition += 4;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.text);
    doc.text("Observações Adicionais:", 20, yPosition);
    
    yPosition += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.textMuted);
    const notesLines = doc.splitTextToSize(additionalNotes, 170);
    doc.text(notesLines, 20, yPosition);
    yPosition += notesLines.length * 5 + 4;
  }

  // ========== CONSENTIMENTO ==========
  yPosition += 8;
  doc.setFillColor(...colors.light);
  doc.roundedRect(14, yPosition - 4, 182, 24, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.primary);
  doc.text("TERMO DE CONSENTIMENTO", 20, yPosition + 3);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.text);
  
  if (hasConsent) {
    doc.setTextColor(...colors.success);
    doc.text("✓ Cliente concordou com os termos de consentimento", 20, yPosition + 11);
  } else {
    doc.setTextColor(...colors.textMuted);
    doc.text("⚠ Termo de consentimento pendente", 20, yPosition + 11);
  }
  
  if (data.filledAt) {
    try {
      const filledDate = new Date(data.filledAt);
      doc.setTextColor(...colors.textMuted);
      doc.text(
        `Preenchido em ${format(filledDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        20,
        yPosition + 17
      );
    } catch {
      // Ignore date parsing errors
    }
  }

  // ========== FOOTER ==========
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 22, 196, pageHeight - 22);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.textMuted);
  doc.text(
    `Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
    105,
    pageHeight - 16,
    { align: "center" }
  );
  
  doc.text("FichaZen - Sistema de Gestão para Profissionais de Beleza", 14, pageHeight - 10);

  // ========== SALVAR ==========
  const normalizedName = data.clientName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
  
  doc.save(`ficha-anamnese-${normalizedName}.pdf`);
};
