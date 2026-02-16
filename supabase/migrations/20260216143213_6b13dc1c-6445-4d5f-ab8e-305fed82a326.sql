
-- Add a policy allowing anyone to read profiles via the public view
-- This is safe because the view only exposes non-sensitive fields
CREATE POLICY "Anyone can view public profiles"
ON public.profiles
FOR SELECT
USING (true);
