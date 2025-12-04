-- Fix v_admin_stats view to use SECURITY INVOKER instead of default SECURITY DEFINER
-- This ensures RLS policies of the querying user are enforced

DROP VIEW IF EXISTS public.v_admin_stats;

CREATE VIEW public.v_admin_stats 
WITH (security_invoker = true)
AS
SELECT (( SELECT count(*) AS count
           FROM profiles))::integer AS total_users,
    (( SELECT count(*) AS count
           FROM profiles
          WHERE (profiles.subscription_status = 'trialing'::text)))::integer AS trial_users,
    (( SELECT count(*) AS count
           FROM profiles
          WHERE (profiles.subscription_status = 'active'::text)))::integer AS active_subscribers,
    (( SELECT count(*) AS count
           FROM profiles
          WHERE (profiles.subscription_status = ANY (ARRAY['expired'::text, 'cancelled'::text]))))::integer AS churned_users,
    ( SELECT COALESCE(sum(
                CASE
                    WHEN (profiles.plan = 'essencial'::text) THEN 39.90
                    WHEN (profiles.plan = 'pro'::text) THEN 89.90
                    WHEN (profiles.plan = 'ultimate'::text) THEN 129.90
                    ELSE (0)::numeric
                END), (0)::numeric) AS "coalesce"
           FROM profiles
          WHERE (profiles.subscription_status = 'active'::text)) AS mrr,
    ( SELECT COALESCE(sum(billing_transactions.amount), (0)::numeric) AS "coalesce"
           FROM billing_transactions
          WHERE (billing_transactions.status = 'paid'::text)) AS total_revenue,
    (( SELECT count(*) AS count
           FROM billing_transactions
          WHERE (billing_transactions.status = 'paid'::text)))::integer AS paid_transactions,
    (( SELECT count(*) AS count
           FROM billing_transactions
          WHERE (billing_transactions.status = 'pending'::text)))::integer AS pending_transactions,
    (( SELECT count(*) AS count
           FROM profiles
          WHERE (profiles.created_at >= date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))))::integer AS new_users_this_month,
    (( SELECT count(*) AS count
           FROM profiles
          WHERE ((profiles.created_at >= date_trunc('month'::text, (CURRENT_DATE - '1 mon'::interval))) AND (profiles.created_at < date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)))))::integer AS new_users_last_month,
    (( SELECT count(*) AS count
           FROM clients))::integer AS total_clients,
    (( SELECT count(*) AS count
           FROM visits))::integer AS total_visits,
    (( SELECT count(*) AS count
           FROM anamneses
          WHERE (anamneses.filled_at IS NOT NULL)))::integer AS filled_anamneses;