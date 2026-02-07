import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, 
  MapPin, 
  Award, 
  Phone, 
  Mail, 
  ArrowRight, 
  User, 
  ClipboardCheck,
  Send
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LocationPicker from '@/components/LocationPicker';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Yellow marker for appraiser
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
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  license_number: string | null;
  years_of_experience: number | null;
  bio: string | null;
  latitude: number | null;
  longitude: number | null;
}

const propertyTypes = [
  { value: 'apartment', label: 'شقة' },
  { value: 'villa', label: 'فيلا' },
  { value: 'land', label: 'أرض' },
  { value: 'building', label: 'عمارة' },
  { value: 'office', label: 'مكتب' },
  { value: 'shop', label: 'محل تجاري' },
];

const cities = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة',
  'الدمام', 'الخبر', 'الظهران', 'تبوك', 'أبها', 'الطائف'
];

const AppraiserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appraiser, setAppraiser] = useState<Appraiser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Form state
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [notes, setNotes] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  useEffect(() => {
    if (id) {
      fetchAppraiser();
    }
  }, [id]);

  const fetchAppraiser = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .eq('account_type', 'appraiser')
        .single();

      if (!error && data) {
        setAppraiser(data);
      } else {
        toast({
          title: 'خطأ',
          description: 'لم يتم العثور على المقيم',
          variant: 'destructive',
        });
        navigate('/appraisers');
      }
    } catch (error) {
      console.error('Error fetching appraiser:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map for appraiser location
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !appraiser?.latitude || !appraiser?.longitude) return;

    mapRef.current = L.map(mapContainerRef.current).setView(
      [appraiser.latitude, appraiser.longitude],
      15
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapRef.current);

    L.marker([appraiser.latitude, appraiser.longitude], { icon: appraiserIcon })
      .addTo(mapRef.current)
      .bindPopup(`<div style="direction: rtl;"><strong>${appraiser.full_name || 'مقيم عقاري'}</strong></div>`);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [appraiser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'يجب تسجيل الدخول',
        description: 'يرجى تسجيل الدخول لإرسال طلب التقييم',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!propertyAddress || !propertyType || !city) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('appraisal_requests').insert({
      user_id: user.id,
      appraiser_id: id,
      property_address: propertyAddress,
      property_type: propertyType,
      city,
      neighborhood,
      notes,
      latitude,
      longitude,
      status: 'pending',
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إرسال الطلب',
        variant: 'destructive',
      });
    } else {
      // Send notification to appraiser
      await supabase.from('notifications').insert({
        user_id: id!,
        type: 'appraisal_request',
        title: 'طلب تقييم جديد',
        message: `تم استلام طلب تقييم عقاري جديد في ${city}`,
      });

      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال طلب التقييم بنجاح وسيتم التواصل معك قريباً',
      });
      navigate('/dashboard/user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!appraiser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/appraisers')}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">تفاصيل المقيم العقاري</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Appraiser Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={appraiser.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{appraiser.full_name || 'مقيم عقاري'}</h2>
                  {appraiser.license_number && (
                    <div className="flex items-center gap-2 text-muted-foreground mt-2">
                      <Award className="h-4 w-4" />
                      <span>رخصة: {appraiser.license_number}</span>
                    </div>
                  )}
                  {appraiser.years_of_experience && (
                    <Badge variant="secondary" className="mt-3">
                      خبرة {appraiser.years_of_experience} سنوات
                    </Badge>
                  )}
                </div>

                {appraiser.bio && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-2">نبذة</h3>
                    <p className="text-sm text-muted-foreground">{appraiser.bio}</p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t space-y-3">
                  {appraiser.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span dir="ltr">{appraiser.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Map */}
            {appraiser.latitude && appraiser.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4 text-primary" />
                    موقع المقيم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    ref={mapContainerRef}
                    className="h-[200px] rounded-lg overflow-hidden"
                    style={{ zIndex: 0 }}
                  />
                  {/* Legend */}
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }} />
                    <span className="text-muted-foreground">موقع المقيم</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Request Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  طلب تقييم عقاري
                </CardTitle>
                <CardDescription>
                  أدخل بيانات العقار المراد تقييمه وسيتم التواصل معك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>نوع العقار *</Label>
                      <Select value={propertyType} onValueChange={setPropertyType}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع العقار" />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>المدينة *</Label>
                      <Select value={city} onValueChange={setCity}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المدينة" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>الحي</Label>
                      <Input
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="اسم الحي"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>عنوان العقار *</Label>
                      <Input
                        value={propertyAddress}
                        onChange={(e) => setPropertyAddress(e.target.value)}
                        placeholder="العنوان التفصيلي للعقار"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>موقع العقار على الخريطة</Label>
                    <LocationPicker
                      latitude={latitude}
                      longitude={longitude}
                      onLocationChange={(lat, lng) => {
                        setLatitude(lat);
                        setLongitude(lng);
                      }}
                      autoDetectLocation={false}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>ملاحظات إضافية</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أي تفاصيل إضافية عن العقار..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 ml-2" />
                        إرسال طلب التقييم
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AppraiserDetails;
