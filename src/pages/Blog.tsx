import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";

const blogPosts = [
  {
    title: "دليل شراء العقار الأول للمبتدئين",
    excerpt: "كل ما تحتاج معرفته قبل شراء عقارك الأول في المملكة العربية السعودية",
    date: "2024-01-15",
    author: "فريق عقارات",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
  },
  {
    title: "كيف تختار الحي المناسب لعائلتك",
    excerpt: "معايير اختيار الحي المثالي للسكن وأهم العوامل التي يجب مراعاتها",
    date: "2024-01-10",
    author: "أحمد محمد",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  },
  {
    title: "التمويل العقاري: أسئلة وأجوبة",
    excerpt: "إجابات على أكثر الأسئلة شيوعاً حول التمويل العقاري في السعودية",
    date: "2024-01-05",
    author: "سارة علي",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-12">
        <h1 className="text-3xl font-bold text-center mb-4">المدونة</h1>
        <p className="text-center text-muted-foreground mb-12">
          أحدث المقالات والنصائح العقارية
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <Card key={index} className="overflow-hidden hover:card-shadow-hover transition-shadow cursor-pointer">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.date).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{post.author}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
