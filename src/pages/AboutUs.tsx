import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Building2, Users, Target, Award } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">من نحن</h1>
          
          <div className="prose prose-lg max-w-none text-right">
            <p className="text-lg text-muted-foreground mb-8">
              عقارات هي منصتك الأولى للبحث عن العقارات في المملكة العربية السعودية. 
              نوفر لك أكثر من 50,000 عقار في جميع المناطق مع خدمات متكاملة تشمل التمويل العقاري والتقييم وخدمات الوساطة.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="p-6 bg-card rounded-2xl card-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">رؤيتنا</h3>
              <p className="text-muted-foreground">
                أن نكون المنصة العقارية الرائدة في المملكة العربية السعودية والخليج العربي.
              </p>
            </div>

            <div className="p-6 bg-card rounded-2xl card-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">رسالتنا</h3>
              <p className="text-muted-foreground">
                تسهيل رحلة البحث عن العقار المناسب وتوفير خدمات عقارية متكاملة وموثوقة.
              </p>
            </div>

            <div className="p-6 bg-card rounded-2xl card-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">فريقنا</h3>
              <p className="text-muted-foreground">
                فريق من الخبراء والمتخصصين في القطاع العقاري يعملون على خدمتك على مدار الساعة.
              </p>
            </div>

            <div className="p-6 bg-card rounded-2xl card-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">إنجازاتنا</h3>
              <p className="text-muted-foreground">
                أكثر من 100,000 عميل سعيد وآلاف الصفقات الناجحة منذ تأسيسنا.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
