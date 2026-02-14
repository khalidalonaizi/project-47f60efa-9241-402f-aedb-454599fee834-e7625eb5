import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { HardHat, MapPin, Building2, Loader2, ArrowRight, Lightbulb, Leaf, Sparkles, Heart } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const developerIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="width:32px;height:32px;background:#6366f1;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 5px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="width:10px;height:10px;background:white;border-radius:50%;transform:rotate(45deg);"></div></div>`,
  iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
});

const projectStatuses: Record<string, string> = {
  planning: 'قيد التخطيط', under_construction: 'قيد الإنشاء', completed: 'مكتمل', selling: 'جاري البيع'
};
const projectTypes: Record<string, string> = {
  residential: 'سكني', commercial: 'تجاري', mixed: 'متعدد الاستخدامات', industrial: 'صناعي'
};

const DeveloperDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [developer, setDeveloper] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: dev } = await supabase.from('profiles').select('*').eq('user_id', id).single();
    setDeveloper(dev);
    const { data: projs } = await supabase.from('developer_projects').select('*').eq('user_id', id!).order('created_at', { ascending: false });
    setProjects((projs as any[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || projects.length === 0) return;
    const projectsWithLocation = projects.filter(p => p.latitude && p.longitude);
    if (projectsWithLocation.length === 0) return;

    mapRef.current = L.map(mapContainerRef.current).setView([projectsWithLocation[0].latitude, projectsWithLocation[0].longitude], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapRef.current);
    projectsWithLocation.forEach(p => {
      L.marker([p.latitude, p.longitude], { icon: developerIcon }).addTo(mapRef.current!).bindPopup(`<div style="direction:rtl;text-align:right;"><strong>${p.title}</strong><br/>${p.city || ''}</div>`);
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [projects]);

  const formatPrice = (price: number) => new Intl.NumberFormat('ar-SA').format(price);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!developer) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Button variant="ghost" onClick={() => navigate('/developers')} className="mb-6"><ArrowRight className="h-4 w-4 ml-1" />العودة للمطورين</Button>

        {/* Developer Header */}
        <div className="bg-gradient-to-l from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6">
            {developer.company_logo || developer.avatar_url ? (
              <img src={developer.company_logo || developer.avatar_url} alt="" className="w-24 h-24 rounded-xl object-cover border-2 border-primary/20" />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center"><HardHat className="w-12 h-12 text-primary" /></div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{developer.company_name || developer.full_name || 'مطوّر عقاري'}</h1>
              <p className="text-muted-foreground mt-1">{projects.length} مشاريع تطوير عقاري</p>
              {developer.phone && <p className="text-sm mt-2" dir="ltr">📞 {developer.phone}</p>}
            </div>
          </div>
          {developer.company_description && <p className="mt-4 text-muted-foreground max-w-2xl">{developer.company_description}</p>}
        </div>

        {/* Map */}
        {projects.some(p => p.latitude && p.longitude) && (
          <Card className="mb-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />مواقع المشاريع</CardTitle></CardHeader>
            <CardContent><div ref={mapContainerRef} className="h-[300px] rounded-lg overflow-hidden" style={{ zIndex: 0 }} /></CardContent>
          </Card>
        )}

        {/* Projects */}
        <h2 className="text-2xl font-bold mb-6">المشاريع</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map(project => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {project.images?.[0] && <img src={project.images[0]} alt={project.title} className="w-full h-48 object-cover" />}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold">{project.title}</h3>
                  <Badge className={project.status === 'completed' ? 'bg-green-500' : project.status === 'under_construction' ? 'bg-blue-500' : 'bg-yellow-500'}>
                    {projectStatuses[project.status] || project.status}
                  </Badge>
                </div>
                {project.city && <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3"><MapPin className="w-3 h-3" />{project.city}</p>}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1"><span>نسبة الإنجاز</span><span className="font-bold">{project.completion_percentage}%</span></div>
                  <Progress value={project.completion_percentage} className="h-2" />
                </div>
                {project.price_from && project.price_to && <p className="text-primary font-bold">{formatPrice(project.price_from)} - {formatPrice(project.price_to)} ر.س</p>}
                {project.total_units && <p className="text-sm text-muted-foreground mt-1">{project.available_units || 0} وحدة متاحة من {project.total_units}</p>}
                {project.description && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{project.description}</p>}

                {/* Vision */}
                {(project.vision_quality || project.vision_sustainability || project.vision_innovation || project.vision_experience) && (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {project.vision_quality && <div className="p-2 bg-muted/50 rounded text-center"><Sparkles className="w-4 h-4 mx-auto text-primary mb-1" /><p className="text-xs">الجودة</p></div>}
                    {project.vision_sustainability && <div className="p-2 bg-muted/50 rounded text-center"><Leaf className="w-4 h-4 mx-auto text-green-500 mb-1" /><p className="text-xs">الاستدامة</p></div>}
                    {project.vision_innovation && <div className="p-2 bg-muted/50 rounded text-center"><Lightbulb className="w-4 h-4 mx-auto text-yellow-500 mb-1" /><p className="text-xs">الابتكار</p></div>}
                    {project.vision_experience && <div className="p-2 bg-muted/50 rounded text-center"><Heart className="w-4 h-4 mx-auto text-red-500 mb-1" /><p className="text-xs">تجربة الساكن</p></div>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        {projects.length === 0 && <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">لا توجد مشاريع بعد</p></CardContent></Card>}
      </main>
      <Footer />
    </div>
  );
};

export default DeveloperDetails;
