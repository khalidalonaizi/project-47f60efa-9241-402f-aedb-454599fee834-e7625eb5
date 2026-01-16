-- Create a public view for financing offers that hides contact information
CREATE VIEW public.financing_offers_public
WITH (security_invoker=on) AS
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
    updated_at,
    user_id
    -- Excludes: phone, email (sensitive contact information)
  FROM public.financing_offers;

-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view all financing offers" ON public.financing_offers;

-- Create a new policy that only allows authenticated users to view financing offers directly
-- This protects phone and email from public access
CREATE POLICY "Authenticated users can view financing offers" 
ON public.financing_offers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Grant access to the public view for anonymous users
GRANT SELECT ON public.financing_offers_public TO anon;
GRANT SELECT ON public.financing_offers_public TO authenticated;