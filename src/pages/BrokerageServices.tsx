import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Handshake, FileCheck, Users, Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BrokerageServices = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Users,
      title: "الوساطة العقارية",
      description: "نربط بين البائعين والمشترين لإتمام صفقات ناجحة",
    },
    {
      icon: FileCheck,
      title: "إتمام الصفقات",
      description: "نساعدك في جميع إجراءات البيع والشراء والإيجار",
    },
    {
      icon: Handshake,
      title: "التفاوض",
      description: "فريق متخصص للتفاوض نيابة عنك للحصول على أفضل سعر",
    },
    {
      icon: Shield,
      title: "الحماية القانونية",
      description: "ضمان سلامة جميع العقود والوثائق",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4">خدمات الوساطة</h1>
          <p className="text-center text-muted-foreground mb-12">
            نساعدك في إتمام صفقتك العقارية بكل سهولة وأمان
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {services.map((service, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-8 text-center">
              <h2 className="text-2xl font-bold mb-4">هل تحتاج مساعدة في صفقتك العقارية؟</h2>
              <p className="mb-6 opacity-90">
                فريقنا المتخصص جاهز لمساعدتك في كل خطوة
              </p>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => navigate("/contact")}
              >
                تواصل معنا
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrokerageServices;
