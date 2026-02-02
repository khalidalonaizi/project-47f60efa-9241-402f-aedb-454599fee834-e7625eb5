import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "ما هي منصة عقارات؟",
    a: "عقارات هي منصة عقارية شاملة تجمع بين البائعين والمشترين والمستأجرين في المملكة العربية السعودية، مع خدمات متكاملة تشمل التمويل والتقييم العقاري.",
  },
  {
    q: "هل الخدمة مجانية؟",
    a: "نعم، تصفح العقارات والبحث مجاني تماماً. بعض الخدمات المتقدمة مثل تمييز الإعلانات قد تتطلب رسوماً إضافية.",
  },
  {
    q: "كيف أضمن أن الإعلانات موثوقة؟",
    a: "نقوم بمراجعة جميع الإعلانات قبل نشرها، ونتحقق من هوية المعلنين. كما نوفر نظام تقييمات ومراجعات من المستخدمين.",
  },
  {
    q: "ما أنواع العقارات المتاحة؟",
    a: "نوفر جميع أنواع العقارات: شقق، فلل، أراضي، مكاتب، محلات تجارية، مستودعات، مزارع، شاليهات، والمزيد.",
  },
  {
    q: "كيف أتواصل مع صاحب العقار؟",
    a: "بعد تسجيل الدخول، يمكنك إرسال رسالة مباشرة لصاحب العقار أو التواصل عبر أرقام الاتصال المتاحة.",
  },
  {
    q: "هل يمكنني الحصول على تمويل عقاري عبر المنصة؟",
    a: "نعم، نوفر حاسبة تمويل عقاري وعروض من أفضل البنوك وشركات التمويل في المملكة.",
  },
  {
    q: "كيف أطلب تقييم عقاري؟",
    a: "يمكنك طلب تقييم من خلال صفحة التقييم العقاري، وسيتواصل معك مقيم معتمد لإتمام العملية.",
  },
  {
    q: "ما هي مدة بقاء الإعلان؟",
    a: "تبقى الإعلانات نشطة لمدة 30 يوماً، ويمكنك تجديدها مجاناً.",
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4">الأسئلة الشائعة</h1>
          <p className="text-center text-muted-foreground mb-12">
            إجابات على الأسئلة الأكثر شيوعاً
          </p>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-xl px-4 border-0 card-shadow"
              >
                <AccordionTrigger className="text-right hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
