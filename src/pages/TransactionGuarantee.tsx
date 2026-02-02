import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, FileCheck, CheckCircle } from "lucide-react";

const TransactionGuarantee = () => {
  const guarantees = [
    {
      icon: Shield,
      title: "حماية الأموال",
      description: "نظام ضمان يحمي أموالك حتى اكتمال الصفقة بنجاح",
    },
    {
      icon: FileCheck,
      title: "توثيق العقود",
      description: "جميع العقود موثقة ومحمية قانونياً",
    },
    {
      icon: Lock,
      title: "أمان البيانات",
      description: "بياناتك الشخصية والمالية محمية بأحدث تقنيات الأمان",
    },
    {
      icon: CheckCircle,
      title: "التحقق من الملكية",
      description: "نتحقق من صحة ملكية العقارات قبل إتمام أي صفقة",
    },
  ];

  const steps = [
    { step: 1, title: "التحقق", description: "نتحقق من هوية الأطراف وصحة المستندات" },
    { step: 2, title: "الاتفاق", description: "توثيق الاتفاق بين البائع والمشتري" },
    { step: 3, title: "الضمان", description: "حفظ المبلغ في حساب ضمان آمن" },
    { step: 4, title: "التسليم", description: "نقل الملكية وتحويل المبلغ بعد التأكد" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4">ضمان المعاملات</h1>
          <p className="text-center text-muted-foreground mb-12">
            جميع المعاملات محمية ومضمونة بالكامل
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {guarantees.map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-center mb-8">كيف يعمل نظام الضمان؟</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TransactionGuarantee;
