
-- Add 'developer' to account_type enum
ALTER TYPE public.account_type ADD VALUE IF NOT EXISTS 'developer';

-- Create financing_requests table
CREATE TABLE public.financing_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  offer_id UUID NOT NULL REFERENCES public.financing_offers(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  monthly_income NUMERIC NOT NULL,
  property_type TEXT NOT NULL,
  property_price NUMERIC NOT NULL,
  property_latitude NUMERIC,
  property_longitude NUMERIC,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create financing requests" ON public.financing_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own financing requests" ON public.financing_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Providers can view their financing requests" ON public.financing_requests FOR SELECT USING (auth.uid() = provider_id);
CREATE POLICY "Providers can update financing requests" ON public.financing_requests FOR UPDATE USING (auth.uid() = provider_id);

-- Create developer_projects table
CREATE TABLE public.developer_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'residential',
  status TEXT NOT NULL DEFAULT 'planning',
  completion_percentage INTEGER DEFAULT 0,
  total_units INTEGER,
  available_units INTEGER,
  price_from NUMERIC,
  price_to NUMERIC,
  area_from NUMERIC,
  area_to NUMERIC,
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  city TEXT,
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  plans TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  vision_quality TEXT,
  vision_sustainability TEXT,
  vision_innovation TEXT,
  vision_experience TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.developer_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view developer projects" ON public.developer_projects FOR SELECT USING (true);
CREATE POLICY "Developers can insert own projects" ON public.developer_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Developers can update own projects" ON public.developer_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Developers can delete own projects" ON public.developer_projects FOR DELETE USING (auth.uid() = user_id);

-- Create developer_project_phases table
CREATE TABLE public.developer_project_phases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.developer_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completion_percentage INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.developer_project_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view project phases" ON public.developer_project_phases FOR SELECT USING (true);
CREATE POLICY "Project owners can manage phases" ON public.developer_project_phases FOR ALL USING (
  EXISTS (SELECT 1 FROM public.developer_projects WHERE id = project_id AND user_id = auth.uid())
);

-- Add trigger for updated_at
CREATE TRIGGER update_financing_requests_updated_at BEFORE UPDATE ON public.financing_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_developer_projects_updated_at BEFORE UPDATE ON public.developer_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
