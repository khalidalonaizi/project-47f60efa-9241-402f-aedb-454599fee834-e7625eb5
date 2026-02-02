import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, FileText, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

const helpTopics = [
  {
    category: "الحساب والتسجيل",
    questions: [
      { q: "كيف أنشئ حساباً جديداً؟", a: "اضغط على زر 'تسجيل' في أعلى الصفحة واملأ البيانات المطلوبة." },
      { q: "نسيت كلمة المرور، ماذا أفعل؟", a: "اضغط على 'نسيت كلمة المرور' في صفحة تسجيل الدخول وأدخل بريدك الإلكتروني." },
      { q: "كيف أغير بياناتي الشخصية؟", a: "ادخل إلى صفحة الملف الشخصي وعدّل البيانات التي تريد تغييرها." },
    ],
  },
  {
    category: "الإعلانات العقارية",
    questions: [
      { q: "كيف أضيف إعلاناً جديداً؟", a: "سجل دخولك ثم اضغط على 'أضف إعلان' واملأ تفاصيل العقار." },
      { q: "كم تستغرق مراجعة الإعلان؟", a: "عادة تتم مراجعة الإعلانات خلال 24 ساعة." },
      { q: "لماذا تم رفض إعلاني؟", a: "قد يُرفض الإعلان لعدم استيفاء الشروط. تحقق من رسالة الرفض للتفاصيل." },
    ],
  },
  {
    category: "التمويل العقاري",
    questions: [
      { q: "كيف أستخدم حاسبة التمويل؟", a: "أدخل سعر العقار والدفعة الأولى والمدة لحساب القسط الشهري التقريبي." },
      { q: "هل عروض التمويل محدثة؟", a: "نعم، نقوم بتحديث العروض بشكل دوري بالتعاون مع البنوك والجهات التمويلية." },
      { q: "كيف أتقدم لطلب تمويل؟", a: "اختر العرض المناسب واضغط على 'تقديم طلب' أو تواصل مع الجهة التمويلية مباشرة." },
    ],
  },
];

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTopics = helpTopics.map(topic => ({
    ...topic,
    questions: topic.questions.filter(
      q => q.q.includes(searchQuery) || q.a.includes(searchQuery)
    ),
  })).filter(topic => topic.questions.length > 0);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4">مركز المساعدة</h1>
          <p className="text-center text-muted-foreground mb-8">
            كيف يمكننا مساعدتك؟
          </p>

          <div className="relative mb-8">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="ابحث عن سؤالك..."
              className="pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-card rounded-xl text-center card-shadow">
              <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
              <span className="text-sm">دليل المستخدم</span>
            </div>
            <div className="p-4 bg-card rounded-xl text-center card-shadow">
              <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              <span className="text-sm">الدردشة المباشرة</span>
            </div>
            <div className="p-4 bg-card rounded-xl text-center card-shadow">
              <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
              <span className="text-sm">اتصل بنا</span>
            </div>
          </div>

          {filteredTopics.map((topic, index) => (
            <div key={index} className="mb-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                {topic.category}
              </h2>
              <Accordion type="single" collapsible className="bg-card rounded-xl">
                {topic.questions.map((item, qIndex) => (
                  <AccordionItem key={qIndex} value={`${index}-${qIndex}`}>
                    <AccordionTrigger className="px-4">{item.q}</AccordionTrigger>
                    <AccordionContent className="px-4 text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
