-- Create a public view for properties that hides owner identity
CREATE VIEW public.properties_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    title,
    description,
    property_type,
    listing_type,
    price,
    city,
    neighborhood,
    address,
    bedrooms,
    bathrooms,
    area,
    images,
    amenities,
    latitude,
    longitude,
    is_featured,
    is_approved,
    status,
    created_at,
    updated_at
    -- Excludes: user_id (owner identity)
  FROM public.properties;

-- Drop the old permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view all properties" ON public.properties;

-- Create a new policy that only allows authenticated users to view properties directly
-- This protects user_id from public access
CREATE POLICY "Authenticated users can view properties" 
ON public.properties 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Grant access to the public view for anonymous users
GRANT SELECT ON public.properties_public TO anon;
GRANT SELECT ON public.properties_public TO authenticated;