-- Enable RLS on financing_offers_public view
ALTER VIEW public.financing_offers_public SET (security_invoker = on);

-- Add RLS policy to allow anyone to read approved offers through the view
-- The view already filters to is_approved = true, but explicit RLS adds defense-in-depth
CREATE POLICY "Anyone can view approved financing offers"
ON public.financing_offers
FOR SELECT
USING (is_approved = true);
