import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LocationPicker from '@/components/LocationPicker';
import { 
  MapPin, 
  Building2, 
  Phone, 
  FileText, 
  Send, 
  Loader2, 
  ChevronLeft, 
  Star,
  User,
  CheckCircle
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Green marker for offices
const officeIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #22c55e;
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

interface RealEstateOffice {
  id: string;
  user_id: string;
  company_name: string;
  company_logo?: string;
  phone?: string;
  license_number?: string;
  company_address?: string;
  latitude?: number;
  longitude?: number;
}

const propertyTypes = [
  { value: 'apartment', label: 'شقة' },
  { value: 'villa', label: 'فيلا' },
  { value: 'land', label: 'أرض' },
  { value: 'building', label: 'عمارة' },
  { value: 'office', label: 'مكتب' },
  { value: 'shop', label: 'محل تجاري' },
];

const PropertyManagementRequest = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [offices, setOffices] = useState<RealEstateOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = useState<RealEstateOffice | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Form states
  const [requesterName, setRequesterName] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyLatitude, setPropertyLatitude] = useState<number | undefined>();
  const [propertyLongitude, setPropertyLongitude] = useState<number | undefined>();
  const [notes, setNotes] = useState('');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Don't redirect - allow viewing map without login
  // Login will be required only when submitting the form

  useEffect(() => {
    fetchOffices();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Error getting location:', error)
      );
    }
  };

  const fetchOffices = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, company_name, company_logo, phone, license_number, company_address, latitude, longitude')
        .eq('account_type', 'real_estate_office')
        .not('company_name', 'is', null);

      if (error) throw error;

      const officeData = (data || []).map(office => ({
        id: office.user_id,
        user_id: office.user_id,
        company_name: office.company_name || 'مكتب عقاري',
        company_logo: office.company_logo,
        phone: office.phone,
        license_number: office.license_number,
        company_address: office.company_address,
        latitude: office.latitude,
        longitude: office.longitude,
      }));

      setOffices(officeData);
    } catch (error) {
      console.error('Error fetching offices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map with offices
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || loading) return;

    const defaultCenter = userLocation 
      ? [userLocation.lat, userLocation.lng] 
      : [24.7136, 46.6753];

    mapRef.current = L.map(mapContainerRef.current).setView(defaultCenter as [number, number], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapRef.current);

    // Add office markers
    offices.forEach((office) => {
      if (office.latitude && office.longitude) {
        const marker = L.marker([office.latitude, office.longitude], { icon: officeIcon })
          .addTo(mapRef.current!);

        marker.bindPopup(`
          <div style="direction: rtl; text-align: right; min-width: 150px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${office.company_name}</h3>
            ${office.phone ? `<p style="font-size: 12px;">📞 ${office.phone}</p>` : ''}
          </div>
        `);

        marker.on('click', () => {
          setSelectedOffice(office);
        });
      }
    });

    // Add user location marker if available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: #8b5cf6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup('<div style="direction: rtl;">موقعك الحالي</div>');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [offices, loading, userLocation]);

  const handlePropertyLocationChange = (lat: number, lng: number) => {
    setPropertyLatitude(lat);
    setPropertyLongitude(lng);
  };

  const handleSubmitRequest = async () => {
    if (!user) {
      toast({ title: 'يرجى تسجيل الدخول', description: 'سجل دخولك أولاً لإرسال الطلب', variant: 'destructive' });
      navigate(`/auth?redirect=/property-management-request`);
      return;
    }
    if (!selectedOffice) return;
    if (!requesterName.trim() || !requesterPhone.trim() || !propertyType || !propertyAddress.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('property_management_requests').insert({
        user_id: user.id,
        office_id: selectedOffice.user_id,
        requester_name: requesterName,
        requester_phone: requesterPhone,
        property_type: propertyType,
        property_address: propertyAddress,
        property_latitude: propertyLatitude,
        property_longitude: propertyLongitude,
        notes: notes || null,
        status: 'pending',
      });

      if (error) throw error;

      // Send notification to office
      await supabase.from('notifications').insert({
        user_id: selectedOffice.user_id,
        type: 'property_management',
        title: 'طلب إدارة أملاك جديد',
        message: `طلب جديد من ${requesterName} لإدارة ${propertyTypes.find(t => t.value === propertyType)?.label || propertyType}`,
      });

      toast({
        title: 'تم إرسال الطلب',
        description: 'سيتواصل معك المكتب قريباً',
      });

      setShowRequestForm(false);
      setSelectedOffice(null);
      // Reset form
      setRequesterName('');
      setRequesterPhone('');
      setPropertyType('');
      setPropertyAddress('');
      setPropertyLatitude(undefined);
      setPropertyLongitude(undefined);
      setNotes('');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إرسال الطلب',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ChevronLeft className="h-4 w-4 ml-1" />
          رجوع
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">طلب إدارة الأملاك</h1>
          <p className="text-muted-foreground">اختر مكتباً عقارياً من الخريطة لإدارة ممتلكاتك</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  المكاتب العقارية القريبة
                </CardTitle>
                <CardDescription>
                  انقر على أي مكتب لعرض تفاصيله
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div 
                    ref={mapContainerRef} 
                    className="h-[400px] rounded-lg overflow-hidden"
                    style={{ zIndex: 0 }}
                  />
                )}
                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <span>مكاتب عقارية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500" />
                    <span>موقعك الحالي</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Office Details */}
          <div>
            {selectedOffice ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {selectedOffice.company_logo ? (
                      <img 
                        src={selectedOffice.company_logo} 
                        alt={selectedOffice.company_name}
                        className="w-16 h-16 rounded-lg object-contain border p-1"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle>{selectedOffice.company_name}</CardTitle>
                      {selectedOffice.license_number && (
                        <Badge variant="outline" className="mt-1">
                          رخصة: {selectedOffice.license_number}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedOffice.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span dir="ltr">{selectedOffice.phone}</span>
                    </div>
                  )}
                  {selectedOffice.company_address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{selectedOffice.company_address}</span>
                    </div>
                  )}

                  <Button 
                    className="w-full mt-4" 
                    onClick={() => setShowRequestForm(true)}
                  >
                    <Send className="h-4 w-4 ml-2" />
                    طلب إدارة أملاك
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    اختر مكتباً من الخريطة لعرض تفاصيله
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Request Form Dialog */}
      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              طلب إدارة أملاك - {selectedOffice?.company_name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>اسمك الكامل *</Label>
                <Input
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="أدخل اسمك"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>رقم الجوال *</Label>
                <Input
                  value={requesterPhone}
                  onChange={(e) => setRequesterPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="mt-1"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>نوع العقار *</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="اختر نوع العقار" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>عنوان العقار *</Label>
                <Input
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="المدينة، الحي، الشارع"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-primary" />
                موقع العقار على الخريطة
              </Label>
              <LocationPicker
                latitude={propertyLatitude}
                longitude={propertyLongitude}
                onLocationChange={handlePropertyLocationChange}
              />
            </div>

            <div>
              <Label>ملاحظات إضافية</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي تفاصيل إضافية تود إخبار المكتب بها..."
                className="mt-1"
                rows={3}
              />
            </div>

            <Button 
              className="w-full" 
              onClick={handleSubmitRequest}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
                  إرسال الطلب
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PropertyManagementRequest;