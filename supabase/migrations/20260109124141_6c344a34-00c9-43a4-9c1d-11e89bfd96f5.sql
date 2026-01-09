-- إصلاح سياسة تخزين الصور لجعل الـ bucket عام للصور المعتمدة
UPDATE storage.buckets SET public = true WHERE id = 'property-images';

-- حذف السياسات القديمة وإعادة إنشائها بشكل صحيح
DROP POLICY IF EXISTS "View approved property images" ON storage.objects;

-- سياسة جديدة: الجميع يمكنهم رؤية صور العقارات
CREATE POLICY "Public access to property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');