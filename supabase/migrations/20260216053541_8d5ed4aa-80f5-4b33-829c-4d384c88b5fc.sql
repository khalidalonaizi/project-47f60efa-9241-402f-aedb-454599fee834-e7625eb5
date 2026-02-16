
-- 1. Fix profiles table: Replace public SELECT policy with restricted one
DROP POLICY IF EXISTS "Anyone can view public profile info" ON public.profiles;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Create a public profiles view with only non-sensitive fields
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  account_type,
  company_name,
  company_logo,
  company_description,
  bio,
  years_of_experience
FROM public.profiles;

-- 3. Fix financing_offers_public view - recreate with security_invoker
DROP VIEW IF EXISTS public.financing_offers_public;

CREATE VIEW public.financing_offers_public
WITH (security_invoker = on) AS
SELECT 
  id,
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

-- 4. Update financing_offers SELECT policy to also allow viewing approved offers publicly
-- Keep existing owner-only policy, add a public policy for approved offers only (no sensitive fields via view)
CREATE POLICY "Anyone can view approved offers via view"
ON public.financing_offers FOR SELECT
USING (is_approved = true);
