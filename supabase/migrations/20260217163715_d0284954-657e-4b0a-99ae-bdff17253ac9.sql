-- Add admin policy for managing all developer projects (including delete)
CREATE POLICY "Admins can manage all developer projects"
ON public.developer_projects
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin policy for managing all developer project phases
CREATE POLICY "Admins can manage all project phases"
ON public.developer_project_phases
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));