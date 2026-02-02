import { Calculator, FileText, HandshakeIcon, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const services = [
  {
    icon: Calculator,
    title: "حاسبة التمويل العقاري",
    description: "احسب قسطك الشهري وتعرف على خطط التمويل المتاحة",
    href: "/financing",
  },
  {
    icon: FileText,
    title: "التقييم العقاري",
    description: "احصل على تقييم دقيق لعقارك من خبراء معتمدين",
    href: "/property-evaluation",
  },
  {
    icon: HandshakeIcon,
    title: "خدمات الوساطة",
    description: "نساعدك في إتمام صفقتك العقارية بكل سهولة",
    href: "/brokerage-services",
  },
  {
    icon: Shield,
    title: "ضمان المعاملات",
    description: "جميع المعاملات محمية ومضمونة بالكامل",
    href: "/transaction-guarantee",
  },
];

const ServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            خدماتنا
          </h2>
          <p className="text-muted-foreground">
            نقدم لك خدمات متكاملة لتسهيل رحلتك العقارية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              onClick={() => navigate(service.href)}
              className="group p-6 bg-card rounded-2xl card-shadow hover:card-shadow-hover transition-all duration-300 text-center animate-fade-up cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-accent rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                <service.icon className="w-8 h-8 text-accent-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
