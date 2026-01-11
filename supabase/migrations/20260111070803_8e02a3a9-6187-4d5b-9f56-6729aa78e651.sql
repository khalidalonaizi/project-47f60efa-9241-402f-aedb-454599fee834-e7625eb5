-- Drop the existing policy that requires is_approved
DROP POLICY IF EXISTS "Anyone can view approved properties" ON public.properties;

-- Create a new policy that allows viewing all properties
CREATE POLICY "Anyone can view all properties" 
ON public.properties 
FOR SELECT 
USING (true);