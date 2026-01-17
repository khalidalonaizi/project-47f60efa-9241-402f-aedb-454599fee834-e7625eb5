-- Grant SELECT on properties_public view to anon and authenticated
GRANT SELECT ON public.properties_public TO anon, authenticated;

-- Drop the existing restrictive policy on properties table for SELECT
DROP POLICY IF EXISTS "Authenticated users can view properties" ON public.properties;

-- Create RLS policy for public viewing of approved properties (no auth required)
CREATE POLICY "Anyone can view approved properties" 
ON public.properties 
FOR SELECT 
USING (is_approved = true AND status = 'approved');