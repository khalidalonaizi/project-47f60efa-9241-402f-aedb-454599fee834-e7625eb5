
-- Drop the overly restrictive policy and replace with authenticated-only access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Authenticated users can view all profiles (needed for app functionality)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);
