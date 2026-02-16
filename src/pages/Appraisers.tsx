import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Award, Phone, Star, Search, ClipboardCheck, User } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Yellow marker for appraisers
const appraiserIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #eab308;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Appraiser {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  years_of_experience: number | null;
  bio: string | null;
  latitude: number | null;
  longitude: number | null;
  company_name: string | null;
}

const Appraisers = () => {
  const navigate = useNavigate();
  const [appraisers, setAppraisers] = useState<Appraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAppraisers();
  }, []);

  const fetchAppraisers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles_public')
        .select('*')
        .eq('account_type', 'appraiser');

      if (!error && data) {
        setAppraisers(data);
      }
    } catch (error) {
      console.error('Error fetching appraisers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || loading) return;

    mapRef.current = L.map(mapContainerRef.current).setView([24.7136, 46.6753], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapRef.current);

    // Add markers for appraisers with location
    const appraisersWithLocation = appraisers.filter(a => a.latitude && a.longitude);
    const bounds = L.latLngBounds([]);

    appraisersWithLocation.forEach(appraiser => {
      if (appraiser.latitude && appraiser.longitude) {
        const marker = L.marker([appraiser.latitude, appraiser.longitude], { icon: appraiserIcon })
          .addTo(mapRef.current!);

        marker.bindPopup(`
          <div style="direction: rtl; text-align: right; min-width: 150px;">
            <strong>${appraiser.full_name || 'مقيم عقاري'}</strong>
          </div>
        `);

        marker.on('click', () => {
          navigate(`/appraiser/${appraiser.user_id}`);
        });

        bounds.extend([appraiser.latitude, appraiser.longitude]);
      }
    });

    if (appraisersWithLocation.length > 0) {
      try {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      } catch {
        mapRef.current.setView([24.7136, 46.6753], 6);
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [appraisers, loading, navigate]);

  const filteredAppraisers = appraisers.filter(appraiser => 
    (appraiser.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">المقيمون العقاريون</h1>
          <p className="text-muted-foreground">ابحث عن مقيم عقاري معتمد واطلب خدمة التقييم</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث بالاسم أو رقم الترخيص..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Map */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              خريطة المقيمين العقاريين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapContainerRef}
              className="h-[400px] rounded-lg overflow-hidden"
              style={{ zIndex: 0 }}
            />
            {/* Legend */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-semibold mb-2">دليل الألوان</p>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#eab308' }} />
                <span className="text-muted-foreground">مقيم عقاري</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appraisers List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAppraisers.map(appraiser => (
            <Card key={appraiser.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={appraiser.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{appraiser.full_name || 'مقيم عقاري'}</h3>
                    {appraiser.years_of_experience && (
                      <Badge variant="secondary" className="mt-2">
                        خبرة {appraiser.years_of_experience} سنوات
                      </Badge>
                    )}
                  </div>
                </div>

                {appraiser.bio && (
                  <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{appraiser.bio}</p>
                )}

                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="default"
                    className="flex-1"
                    onClick={() => navigate(`/appraiser/${appraiser.user_id}`)}
                  >
                    <ClipboardCheck className="h-4 w-4 ml-2" />
                    طلب تقييم
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAppraisers.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">لا يوجد مقيمون</h3>
            <p className="text-muted-foreground">لم يتم العثور على مقيمين عقاريين مطابقين</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Appraisers;
