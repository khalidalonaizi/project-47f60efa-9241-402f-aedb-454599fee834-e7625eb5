-- Enable realtime for developer_projects and properties tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.developer_projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;