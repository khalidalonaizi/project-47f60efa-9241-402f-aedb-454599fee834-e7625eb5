import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { HardHat, MapPin, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface DeveloperProject {
  id: string;
  title: string;
  city: string | null;
  images: string[] | null;
  status: string;
  completion_percentage: number | null;
  price_from: number | null;
  price_to: number | null;
  user_id: string;
  description: string | null;
}

const statusLabels: Record<string, string> = {
  planning: "قيد التخطيط",
  under_construction: "قيد الإنشاء",
  completed: "مكتمل",
  selling: "جاري البيع",
};

const DeveloperProjectsSection = () => {
  const [projects, setProjects] = useState<DeveloperProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("developer_projects")
        .select("id, title, city, images, status, completion_percentage, price_from, price_to, user_id, description")
        .order("created_at", { ascending: false })
        .limit(6);
      if (!error && data) setProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat("ar-SA").format(price);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (projects.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            <HardHat className="w-3 h-3 ml-1" />
            مشاريع التطوير العقاري
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">أحدث مشاريع المطورين</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            استكشف أحدث مشاريع التطوير العقاري من أفضل المطورين في المملكة
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} to={`/developer/${project.user_id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="relative h-48">
                  {project.images?.[0] ? (
                    <img src={project.images[0]} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <HardHat className="w-16 h-16 text-primary/30" />
                    </div>
                  )}
                  <Badge className="absolute top-3 right-3 bg-primary/90">
                    {statusLabels[project.status] || project.status}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{project.title}</h3>
                  {project.city && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3" />
                      {project.city}
                    </p>
                  )}
                  {project.completion_percentage != null && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>نسبة الإنجاز</span>
                        <span className="font-bold">{project.completion_percentage}%</span>
                      </div>
                      <Progress value={project.completion_percentage} className="h-2" />
                    </div>
                  )}
                  {project.price_from && project.price_to && (
                    <p className="text-primary font-bold text-sm">
                      {formatPrice(project.price_from)} - {formatPrice(project.price_to)} ر.س
                    </p>
                  )}
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/developers">
            <Button size="lg" variant="outline" className="gap-2">
              عرض جميع المطورين
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DeveloperProjectsSection;
