
-- Add user_id back to financing_offers_public since it's needed for financing requests
DROP VIEW IF EXISTS public.financing_offers_public;

CREATE VIEW public.financing_offers_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  company_name,
  company_type,
  logo_url,
  interest_rate,
  max_tenure,
  max_amount,
  min_salary,
  max_dti,
  features,
  description,
  website,
  is_approved,
  is_featured,
  created_at,
  updated_at
FROM public.financing_offers
WHERE is_approved = true;
