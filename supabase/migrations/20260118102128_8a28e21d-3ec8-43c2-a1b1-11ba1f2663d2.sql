-- Drop existing SELECT policy for authenticated users that exposes sensitive data
DROP POLICY IF EXISTS "Authenticated users can view financing offers" ON public.financing_offers;

-- Create a more restrictive SELECT policy - only allow viewing own offers or via admin
-- Regular users should use the financing_offers_public view instead
CREATE POLICY "Users can view own financing offers"
ON public.financing_offers
FOR SELECT
USING (auth.uid() = user_id);

-- Note: Admins already have access via "Admins can manage all financing offers" policy