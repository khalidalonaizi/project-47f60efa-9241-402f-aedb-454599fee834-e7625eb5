
-- Remove the overly broad policy that exposes all profile columns
DROP POLICY IF EXISTS "Anyone can view public profile data" ON public.profiles;

-- Instead, create a security definer function that returns only public profile data
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    account_type account_type,
    full_name text,
    avatar_url text,
    company_name text,
    company_logo text,
    company_description text,
    company_address text,
    bio text,
    years_of_experience integer,
    latitude numeric,
    longitude numeric,
    phone text,
    license_number text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT p.id, p.user_id, p.account_type, p.full_name, p.avatar_url,
           p.company_name, p.company_logo, p.company_description, p.company_address,
           p.bio, p.years_of_experience, p.latitude, p.longitude, p.phone, p.license_number
    FROM profiles p;
$$;

-- Recreate view using the function (with security_invoker since function handles access)
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public
WITH (security_invoker = on)
AS
SELECT * FROM public.get_public_profiles();
