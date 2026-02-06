-- Create property_management_requests table for property management service requests
CREATE TABLE public.property_management_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  office_id uuid NOT NULL,
  requester_name text NOT NULL,
  requester_phone text NOT NULL,
  property_type text NOT NULL,
  property_address text NOT NULL,
  property_latitude numeric,
  property_longitude numeric,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_management_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own property management requests"
  ON public.property_management_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create requests
CREATE POLICY "Users can create property management requests"
  ON public.property_management_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Office owners can view requests sent to them
CREATE POLICY "Offices can view their received requests"
  ON public.property_management_requests FOR SELECT
  USING (auth.uid() = office_id);

-- Office owners can update request status
CREATE POLICY "Offices can update request status"
  ON public.property_management_requests FOR UPDATE
  USING (auth.uid() = office_id);

-- Add trigger for updated_at
CREATE TRIGGER update_property_management_requests_updated_at
  BEFORE UPDATE ON public.property_management_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for property_management_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.property_management_requests;