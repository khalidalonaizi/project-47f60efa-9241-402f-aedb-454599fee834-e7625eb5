-- Update the SELECT policy to require authentication for viewing financing offers
DROP POLICY IF EXISTS "Anyone can view approved financing offers" ON public.financing_offers;

CREATE POLICY "Authenticated users can view approved financing offers" 
ON public.financing_offers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    (is_approved = true) OR (auth.uid() = user_id)
  )
);