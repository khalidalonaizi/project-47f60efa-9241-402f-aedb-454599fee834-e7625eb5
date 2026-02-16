

# مراجعة أمنية شاملة للمشروع - خطة المعالجة

## ملخص النتائج

تم اكتشاف **11 مشكلة أمنية**: 5 حرجة (خطيرة)، 4 تحذيرات، و2 معلوماتية.

---

## المشاكل الحرجة (يجب إصلاحها فوراً)

### 1. كشف أرقام الهواتف والبيانات الحساسة لجميع المستخدمين
- **المشكلة:** جدول `profiles` يسمح لأي مستخدم مسجل برؤية أرقام الهواتف والسجل التجاري ورقم الترخيص لجميع المستخدمين
- **السبب:** سياسة SELECT تستخدم `USING (true)` بدلاً من تقييد الوصول
- **الحل:** تغيير سياسة SELECT إلى `USING (auth.uid() = user_id)` والاعتماد على `profiles_public` view لعرض بيانات المستخدمين الآخرين

### 2. تسريب البيانات المالية عبر التلاعب بـ provider_id
- **المشكلة:** جدول `financing_requests` يكشف الدخل الشهري وأرقام الهواتف. لا يوجد تحقق أن `provider_id` يعود لحساب جهة تمويلية فعلية
- **الحل:** إضافة trigger للتحقق من أن `provider_id` ينتمي لمستخدم من نوع `financing_provider`

### 3. كشف بيانات الاتصال عبر التلاعب بـ office_id
- **المشكلة:** جدول `property_management_requests` يكشف اسم ورقم هاتف مقدم الطلب لأي مستخدم يطابق `office_id`
- **الحل:** إضافة trigger للتحقق من أن `office_id` ينتمي لمستخدم من نوع `real_estate_office`

### 4. كشف مواقع العقارات عبر التلاعب بـ appraiser_id
- **المشكلة:** جدول `appraisal_requests` يكشف عناوين وإحداثيات العقارات. لا يوجد تحقق أن `appraiser_id` يعود لمقيم فعلي
- **الحل:** إضافة trigger للتحقق من أن `appraiser_id` ينتمي لمستخدم من نوع `appraiser`

### 5. حماية كلمات المرور المسربة معطلة
- **المشكلة:** المستخدمون يمكنهم التسجيل بكلمات مرور مسربة ومعروفة في قواعد بيانات الاختراقات
- **الحل:** تفعيل خاصية "Leaked Password Protection" من إعدادات المصادقة (يتطلب تفعيل يدوي)

---

## التحذيرات

### 6. الحد الأدنى لكلمة المرور ضعيف (6 أحرف)
- **الحل:** رفع الحد الأدنى إلى 8 أحرف مع إضافة متطلبات التعقيد

### 7. بيانات الاتصال لجهات التمويل متاحة للمنافسين
- معلوماتي - قد يكون مقصوداً لأغراض العرض

### 8. عرض `financing_offers_public` بدون سياسات RLS صريحة
- **الحل:** إضافة سياسات RLS للتحكم بالبيانات المعروضة

---

## التفاصيل التقنية للتنفيذ

### الخطوة 1: تقييد الوصول لجدول profiles
```text
-- تعديل سياسة SELECT
DROP POLICY "Authenticated users can view profiles" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
```
ثم تحديث الكود ليستخدم `profiles_public` view عند عرض بيانات مستخدمين آخرين.

### الخطوة 2: إنشاء دوال تحقق من نوع الحساب
```text
-- دالة للتحقق من نوع الحساب
CREATE OR REPLACE FUNCTION validate_account_type()
RETURNS trigger AS $$
BEGIN
  -- تحقق حسب الجدول
  IF TG_TABLE_NAME = 'financing_requests' THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = NEW.provider_id 
      AND account_type = 'financing_provider'
    ) THEN
      RAISE EXCEPTION 'provider_id must be a financing_provider';
    END IF;
  ELSIF TG_TABLE_NAME = 'property_management_requests' THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = NEW.office_id 
      AND account_type = 'real_estate_office'
    ) THEN
      RAISE EXCEPTION 'office_id must be a real_estate_office';
    END IF;
  ELSIF TG_TABLE_NAME = 'appraisal_requests' THEN
    IF NEW.appraiser_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = NEW.appraiser_id 
      AND account_type = 'appraiser'
    ) THEN
      RAISE EXCEPTION 'appraiser_id must be an appraiser';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### الخطوة 3: ربط الـ Triggers بالجداول
```text
CREATE TRIGGER validate_financing_provider
  BEFORE INSERT OR UPDATE ON financing_requests
  FOR EACH ROW EXECUTE FUNCTION validate_account_type();

CREATE TRIGGER validate_office
  BEFORE INSERT OR UPDATE ON property_management_requests
  FOR EACH ROW EXECUTE FUNCTION validate_account_type();

CREATE TRIGGER validate_appraiser
  BEFORE INSERT OR UPDATE ON appraisal_requests
  FOR EACH ROW EXECUTE FUNCTION validate_account_type();
```

### الخطوة 4: تحديث كود المصادقة
- رفع الحد الأدنى لكلمة المرور من 6 إلى 8 أحرف في `Auth.tsx`

### الخطوة 5: تحديث الكود لاستخدام profiles_public
- مراجعة جميع الأماكن التي تقرأ من `profiles` مباشرة لعرض بيانات مستخدمين آخرين واستبدالها بـ `profiles_public`

### إجراء يدوي مطلوب
- تفعيل "Leaked Password Protection" من إعدادات المصادقة في Lovable Cloud

