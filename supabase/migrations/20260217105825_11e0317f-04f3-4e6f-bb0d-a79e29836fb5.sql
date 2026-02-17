
-- Fix profiles_public view to use security_invoker instead of security_definer
-- First, drop the existing view
DROP VIEW IF EXISTS public.profiles_public;

-- Recreate with security_invoker=on
CREATE VIEW public.profiles_public
WITH (security_invoker = on)
AS
SELECT
    id,
    user_id,
    account_type,
    full_name,
    avatar_url,
    company_name,
    company_logo,
    company_description,
    company_address,
    bio,
    years_of_experience,
    latitude,
    longitude,
    phone,
    license_number
FROM profiles p;

-- Add a permissive SELECT policy for public profile data access
-- This allows anyone (including anon) to read profiles through the view
CREATE POLICY "Anyone can view public profile data"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);
