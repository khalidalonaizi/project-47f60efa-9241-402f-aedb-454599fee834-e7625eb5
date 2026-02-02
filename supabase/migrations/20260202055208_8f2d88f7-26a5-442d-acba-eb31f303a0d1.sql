-- Create enum for user account types
CREATE TYPE public.account_type AS ENUM ('individual', 'real_estate_office', 'financing_provider', 'appraiser');

-- Add account_type to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_type public.account_type DEFAULT 'individual';

-- Add office/company details to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_logo TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS commercial_registration TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_description TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Create appraisal requests table
CREATE TABLE public.appraisal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  appraiser_id UUID,
  property_address TEXT NOT NULL,
  property_type TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  images TEXT[] DEFAULT '{}',
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'visit_scheduled', 'completed', 'rejected')),
  visit_date TIMESTAMP WITH TIME ZONE,
  visit_notes TEXT,
  report_url TEXT,
  estimated_value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on appraisal_requests
ALTER TABLE public.appraisal_requests ENABLE ROW LEVEL SECURITY;

-- Policies for appraisal_requests
CREATE POLICY "Users can create appraisal requests"
ON public.appraisal_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own appraisal requests"
ON public.appraisal_requests FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = appraiser_id);

CREATE POLICY "Appraisers can update assigned requests"
ON public.appraisal_requests FOR UPDATE
USING (auth.uid() = appraiser_id OR auth.uid() = user_id);

CREATE POLICY "Users can delete own pending requests"
ON public.appraisal_requests FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- Add location to financing_offers if not exists
ALTER TABLE public.financing_offers ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE public.financing_offers ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Create trigger for updated_at on appraisal_requests
CREATE TRIGGER update_appraisal_requests_updated_at
BEFORE UPDATE ON public.appraisal_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create policy for public profiles view (for office/appraiser listings)
CREATE POLICY "Anyone can view public profile info"
ON public.profiles FOR SELECT
USING (true);

-- Drop old restrictive policy if exists
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;