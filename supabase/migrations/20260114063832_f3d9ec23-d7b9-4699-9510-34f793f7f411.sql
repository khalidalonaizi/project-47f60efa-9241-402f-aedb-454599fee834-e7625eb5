-- تغيير القيمة الافتراضية لـ is_approved إلى true
ALTER TABLE public.financing_offers 
ALTER COLUMN is_approved SET DEFAULT true;

-- تحديث جميع العروض الحالية لتكون موافق عليها
UPDATE public.financing_offers SET is_approved = true WHERE is_approved = false OR is_approved IS NULL;

-- حذف السياسة القديمة وإنشاء سياسة جديدة للسماح للجميع بمشاهدة كل العروض
DROP POLICY IF EXISTS "Users can view approved offers and admins can view all" ON public.financing_offers;

CREATE POLICY "Anyone can view all financing offers" 
ON public.financing_offers 
FOR SELECT 
USING (true);