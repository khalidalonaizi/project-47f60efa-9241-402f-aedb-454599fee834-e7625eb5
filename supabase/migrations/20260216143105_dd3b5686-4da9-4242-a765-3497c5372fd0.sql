
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public WITH (security_invoker = on) AS
SELECT
  p.id,
  p.user_id,
  p.account_type,
  p.full_name,
  p.avatar_url,
  p.company_name,
  p.company_logo,
  p.company_description,
  p.company_address,
  p.bio,
  p.years_of_experience,
  p.latitude,
  p.longitude,
  p.phone,
  p.license_number
FROM profiles p;
