-- إنشاء bucket لصور العقارات
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

-- سياسات التخزين للصور
CREATE POLICY "Anyone can view property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Users can update their own property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- تحديث trigger لجعل أول مستخدم admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- إنشاء profile للمستخدم
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- التحقق من عدد المستخدمين
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  -- إذا كان أول مستخدم، اجعله admin
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

-- إضافة عمود للعنوان الكامل (للخريطة)
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);