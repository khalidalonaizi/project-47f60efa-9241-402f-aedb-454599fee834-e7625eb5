import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { HardHat, MapPin, Building2, Loader2, Eye } from 'lucide-react';

interface Developer {
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  company_logo: string | null;
  company_description: string | null;
  avatar_url: string | null;
}

interface DeveloperProject {
  id: string;
  title: string;
  project_type: string;
  status: string;
  completion_percentage: number;
  city: string | null;
  images: string[];
  price_from: number | null;
  price_to: number | null;
}

const Developers = () => {
  const navigate = useNavigate();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [projects, setProjects] = useState<Record<string, DeveloperProject[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    const { data: devs } = await supabase
      .from('profiles')
      .select('user_id, full_name, company_name, company_logo, company_description, avatar_url')
      .eq('account_type', 'developer');

    setDevelopers(devs || []);

    // Fetch projects for all developers
    const { data: allProjects } = await supabase
      .from('developer_projects')
      .select('*')
      .order('created_at', { ascending: false });

    const grouped: Record<string, DeveloperProject[]> = {};
    (allProjects || []).forEach((p: any) => {
      if (!grouped[p.user_id]) grouped[p.user_id] = [];
      grouped[p.user_id].push(p);
    });
    setProjects(grouped);
    setLoading(false);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('ar-SA').format(price);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">منطقة المطورين العقاريين</h1>
          <p className="text-muted-foreground">تعرّف على أبرز المطورين العقاريين ومشاريعهم</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : developers.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><HardHat className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">لا يوجد مطورون مسجلون حالياً</p></CardContent></Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {developers.map(dev => (
              <Card key={dev.user_id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/developer/${dev.user_id}`)}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {dev.company_logo || dev.avatar_url ? (
                      <img src={dev.company_logo || dev.avatar_url || ''} alt={dev.company_name || dev.full_name || ''} className="w-16 h-16 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center"><HardHat className="w-8 h-8 text-primary" /></div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{dev.company_name || dev.full_name || 'مطوّر عقاري'}</CardTitle>
                      <p className="text-sm text-muted-foreground">{(projects[dev.user_id] || []).length} مشاريع</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {dev.company_description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{dev.company_description}</p>}
                  <div className="space-y-2">
                    {(projects[dev.user_id] || []).slice(0, 2).map(project => (
                      <div key={project.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                        {project.images?.[0] ? (
                          <img src={project.images[0]} alt={project.title} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center"><Building2 className="w-5 h-5 text-muted-foreground" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{project.title}</p>
                          <p className="text-xs text-muted-foreground">{project.city}</p>
                        </div>
                        <span className="text-xs font-bold text-primary">{project.completion_percentage}%</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline"><Eye className="w-4 h-4 ml-2" />عرض المشاريع</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Developers;
