import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Briefcase, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const jobs = [
  {
    title: "مطور واجهات أمامية",
    department: "التقنية",
    location: "الرياض",
    type: "دوام كامل",
  },
  {
    title: "مدير تسويق رقمي",
    department: "التسويق",
    location: "الرياض",
    type: "دوام كامل",
  },
  {
    title: "خبير تقييم عقاري",
    department: "العمليات",
    location: "جدة",
    type: "دوام كامل",
  },
  {
    title: "ممثل خدمة عملاء",
    department: "خدمة العملاء",
    location: "الدمام",
    type: "دوام جزئي",
  },
];

const Careers = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4">انضم إلى فريقنا</h1>
          <p className="text-center text-muted-foreground mb-12">
            نبحث عن أشخاص متحمسين للانضمام إلى فريقنا المتنامي
          </p>

          <div className="grid gap-4">
            {jobs.map((job, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>{job.title}</span>
                    <Button variant="hero" size="sm">تقديم</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{job.type}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center p-8 bg-accent rounded-2xl">
            <Users className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">لم تجد الوظيفة المناسبة؟</h3>
            <p className="text-muted-foreground mb-4">
              أرسل سيرتك الذاتية وسنتواصل معك عند توفر فرصة مناسبة
            </p>
            <Button variant="outline">إرسال السيرة الذاتية</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
