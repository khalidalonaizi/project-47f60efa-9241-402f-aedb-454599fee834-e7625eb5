
-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles_public view to include location data needed for maps
DROP VIEW IF EXISTS profiles_public;
CREATE VIEW profiles_public WITH (security_invoker = on) AS
  SELECT 
    id, user_id, account_type, full_name, avatar_url, 
    company_name, company_logo, company_description, bio,
    years_of_experience, latitude, longitude, company_address
  FROM profiles;
