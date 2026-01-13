-- Create storage bucket for financing offer logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('financing-logos', 'financing-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for financing logos bucket
CREATE POLICY "Anyone can view financing logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'financing-logos');

CREATE POLICY "Authenticated users can upload financing logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'financing-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own financing logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'financing-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own financing logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'financing-logos' AND auth.uid() IS NOT NULL);