-- Fix RLS policies for financing_offers to allow admins to view all offers
-- Drop and recreate the SELECT policy to include admin access
DROP POLICY IF EXISTS "Authenticated users can view approved financing offers" ON public.financing_offers;

-- Create new SELECT policy that includes admin access
CREATE POLICY "Users can view approved offers and admins can view all" 
ON public.financing_offers 
FOR SELECT 
USING (
  -- Admins can view all offers
  has_role(auth.uid(), 'admin'::app_role) 
  OR 
  -- Authenticated users can view approved offers or their own offers
  (auth.uid() IS NOT NULL AND (is_approved = true OR auth.uid() = user_id))
);