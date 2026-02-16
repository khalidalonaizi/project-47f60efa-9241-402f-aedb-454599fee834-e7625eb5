
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;

-- Recreate the view WITHOUT security_invoker so it bypasses RLS
-- The view itself acts as the security layer by only exposing safe fields
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
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
