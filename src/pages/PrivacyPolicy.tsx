import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h1 className="text-3xl font-bold text-center mb-8">سياسة الخصوصية</h1>
          
          <div className="text-right space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-3">مقدمة</h2>
              <p className="text-muted-foreground">
                نحن في منصة عقارات نلتزم بحماية خصوصية مستخدمينا. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك الشخصية.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">المعلومات التي نجمعها</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>المعلومات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف</li>
                <li>معلومات الموقع: عند استخدام خدمات الخرائط</li>
                <li>معلومات الاستخدام: تفاعلاتك مع المنصة</li>
                <li>معلومات الجهاز: نوع المتصفح، نظام التشغيل</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">كيف نستخدم معلوماتك</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>تقديم خدماتنا وتحسينها</li>
                <li>التواصل معك بشأن حسابك وإعلاناتك</li>
                <li>إرسال تحديثات وعروض (بموافقتك)</li>
                <li>ضمان أمان المنصة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">حماية المعلومات</h2>
              <p className="text-muted-foreground">
                نستخدم تقنيات أمان متقدمة لحماية بياناتك، بما في ذلك التشفير وجدران الحماية. لا نبيع معلوماتك لأطراف ثالثة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">حقوقك</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>الوصول إلى بياناتك الشخصية</li>
                <li>تصحيح البيانات غير الدقيقة</li>
                <li>حذف حسابك وبياناتك</li>
                <li>الانسحاب من الرسائل التسويقية</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">التواصل معنا</h2>
              <p className="text-muted-foreground">
                لأي استفسارات حول سياسة الخصوصية، تواصل معنا عبر:
                <br />
                البريد الإلكتروني: info@aqarat.cloud
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-8">
              آخر تحديث: يناير 2024
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
