-- Corrigir a view v_dashboard_stats para calcular corretamente fichas pendentes
DROP VIEW IF EXISTS v_dashboard_stats;

CREATE VIEW v_dashboard_stats AS
SELECT 
  p.id AS professional_id,
  -- Total de clientes
  (SELECT COUNT(*) 
   FROM clients c 
   WHERE c.professional_id = p.id) AS total_clients,
  -- Total de fichas PREENCHIDAS (com consent = true)
  (SELECT COUNT(*) 
   FROM anamneses a 
   WHERE a.professional_id = p.id AND a.consent = true) AS total_anamneses,
  -- Fichas PENDENTES (clientes sem anamnese ou com anamnese não consentida)
  (SELECT COUNT(DISTINCT c.id)
   FROM clients c
   LEFT JOIN anamneses a ON a.client_id = c.id AND a.consent = true
   WHERE c.professional_id = p.id AND a.id IS NULL) AS pending_anamneses,
  -- Visitas nos próximos 7 dias
  (SELECT COUNT(*) 
   FROM visits v 
   WHERE v.professional_id = p.id 
     AND v.visit_date >= CURRENT_DATE 
     AND v.visit_date <= CURRENT_DATE + 7) AS visits_next_7_days
FROM profiles p;