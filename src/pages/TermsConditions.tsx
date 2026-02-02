import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsConditions = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h1 className="text-3xl font-bold text-center mb-8">الشروط والأحكام</h1>
          
          <div className="text-right space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-3">القبول بالشروط</h2>
              <p className="text-muted-foreground">
                باستخدامك لمنصة عقارات، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">استخدام المنصة</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>يجب أن يكون عمرك 18 سنة أو أكثر لاستخدام المنصة</li>
                <li>تتحمل مسؤولية دقة المعلومات التي تقدمها</li>
                <li>يحظر استخدام المنصة لأي أغراض غير قانونية</li>
                <li>يجب عدم نشر محتوى مسيء أو مضلل</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">الإعلانات العقارية</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>يجب أن تكون الإعلانات حقيقية ودقيقة</li>
                <li>يحظر نشر إعلانات وهمية أو مضللة</li>
                <li>نحتفظ بحق إزالة أي إعلان يخالف الشروط</li>
                <li>المعلن مسؤول عن محتوى إعلانه</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">الملكية الفكرية</h2>
              <p className="text-muted-foreground">
                جميع حقوق الملكية الفكرية للمنصة وتصميمها ومحتواها محفوظة لمنصة عقارات. لا يجوز نسخ أو توزيع أي جزء من المنصة دون إذن كتابي.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">إخلاء المسؤولية</h2>
              <p className="text-muted-foreground">
                المنصة تعمل كوسيط بين البائعين والمشترين. لا نتحمل مسؤولية أي صفقات تتم بين المستخدمين. ننصح بالتحقق من جميع المعلومات والوثائق قبل إتمام أي صفقة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">تعديل الشروط</h2>
              <p className="text-muted-foreground">
                نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-3">القانون الحاكم</h2>
              <p className="text-muted-foreground">
                تخضع هذه الشروط لأنظمة وقوانين المملكة العربية السعودية.
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

export default TermsConditions;
