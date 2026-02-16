
ALTER TABLE public.developer_projects
ADD COLUMN contact_phone text DEFAULT NULL,
ADD COLUMN contact_email text DEFAULT NULL,
ADD COLUMN contact_whatsapp text DEFAULT NULL;
