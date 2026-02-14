import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FinancingRequestForm from '@/components/FinancingRequestForm';
import MapLegend from '@/components/MapLegend';
import { 
  ArrowRight,
  Landmark,
  BadgeDollarSign,
  Building2,
  CheckCircle,
  Star,
  Phone,
  Mail,
  Globe,
  Loader2,
  Percent,
  Calendar,
  Banknote,
  Users,
  Calculator,
  MapPin
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

// Red marker for financing
const financingIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #ef4444;
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

// Static financing offers for demo
const staticOffers = [
  {
    id: "1",
    company_name: "البنك الأهلي السعودي",
    company_type: "bank",
    interest_rate: 4.5,
    max_tenure: 25,
    max_amount: 5000000,
    min_salary: 5000,
    max_dti: 65,
    features: ["تمويل يصل إلى 90%", "فترة سداد مرنة", "إعفاء من الرسوم الإدارية"],
    website: "https://www.alahli.com",
    description: "عرض تمويلي مميز من البنك الأهلي السعودي يتيح لك امتلاك منزل أحلامك بأقساط مريحة ونسبة ربح تنافسية.",
    is_featured: true,
    latitude: 24.7136,
    longitude: 46.6753,
    user_id: "static-1",
  },
  {
    id: "2",
    company_name: "مصرف الراجحي",
    company_type: "bank",
    interest_rate: 4.2,
    max_tenure: 30,
    max_amount: 7000000,
    min_salary: 4000,
    max_dti: 60,
    features: ["متوافق مع الشريعة", "موافقة سريعة", "تأمين مجاني"],
    website: "https://www.alrajhibank.com.sa",
    description: "تمويل عقاري متوافق مع أحكام الشريعة الإسلامية من مصرف الراجحي.",
    is_featured: true,
    latitude: 24.6877,
    longitude: 46.7219,
    user_id: "static-2",
  },
  {
    id: "3",
    company_name: "بنك الرياض",
    company_type: "bank",
    interest_rate: 4.8,
    max_tenure: 25,
    max_amount: 4000000,
    min_salary: 6000,
    max_dti: 55,
    features: ["أقساط ثابتة", "خدمة عملاء متميزة", "تحويل الراتب اختياري"],
    website: "https://www.riyadbank.com",
    description: "عرض تمويل عقاري من بنك الرياض بأقساط ثابتة طوال فترة التمويل.",
    is_featured: false,
    latitude: 24.7000,
    longitude: 46.6900,
    user_id: "static-3",
  },
];

interface FinancingOffer {
  id: string;
  company_name: string;
  company_type: string;
  logo_url?: string;
  interest_rate: number;
  max_tenure: number;
  max_amount: number;
  min_salary: number;
  max_dti: number;
  features: string[];
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  is_featured: boolean;
  latitude?: number;
  longitude?: number;
  user_id?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-SA').format(Math.round(price));
};

const FinancingOfferPublicDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<FinancingOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Calculator states
  const [propertyPrice, setPropertyPrice] = useState(1000000);
  const [downPayment, setDownPayment] = useState(200000);
  const [tenure, setTenure] = useState(20);
  const [showCalculator, setShowCalculator] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOffer();
    }
  }, [id]);

  const fetchOffer = async () => {
    setLoading(true);
    try {
      // First check static offers (for demo data)
      const staticOffer = staticOffers.find(o => o.id === id);
      if (staticOffer) {
        setOffer(staticOffer);
        setLoading(false);
        return;
      }

      // Try to fetch from public view - this is accessible to everyone
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('financing_offers_public')
        .select('*')
        .eq('id', id)
        .eq('is_approved', true)
        .maybeSingle();

      if (!error && data) {
        setOffer({
          id: data.id!,
          company_name: data.company_name!,
          company_type: data.company_type!,
          logo_url: data.logo_url || undefined,
          interest_rate: data.interest_rate!,
          max_tenure: data.max_tenure!,
          max_amount: data.max_amount!,
          min_salary: data.min_salary!,
          max_dti: data.max_dti!,
          features: data.features || [],
          website: data.website || undefined,
          description: data.description || undefined,
          is_featured: data.is_featured || false,
          user_id: data.user_id || undefined,
        });
      } else {
        toast({
          title: 'تنبيه',
          description: 'العرض غير متاح حالياً',
        });
        navigate('/financing');
      }
    } catch (error) {
      console.error('Error:', error);
      // If error, check static offers again
      const staticOffer = staticOffers.find(o => o.id === id);
      if (staticOffer) {
        setOffer(staticOffer);
      } else {
        toast({
          title: 'خطأ',
          description: 'حدث خطأ أثناء جلب تفاصيل العرض',
          variant: 'destructive',
        });
        navigate('/financing');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !offer?.latitude || !offer?.longitude) return;

    mapRef.current = L.map(mapContainerRef.current).setView(
      [offer.latitude, offer.longitude],
      15
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(mapRef.current);

    L.marker([offer.latitude, offer.longitude], { icon: financingIcon })
      .addTo(mapRef.current)
      .bindPopup(`<div style="direction: rtl; text-align: right;"><strong>${offer.company_name}</strong></div>`);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [offer]);

  // Calculator calculations
  const loanAmount = propertyPrice - downPayment;
  const interestRate = offer?.interest_rate || 5;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = tenure * 12;

  const monthlyPayment = useMemo(() => {
    if (monthlyRate === 0) return loanAmount / numberOfPayments;
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }, [loanAmount, monthlyRate, numberOfPayments]);

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  const getCompanyTypeLabel = (type: string) => {
    switch (type) {
      case 'bank':
        return 'بنك';
      case 'financing_company':
        return 'شركة تمويل';
      default:
        return type;
    }
  };

  const getCompanyIcon = (type: string) => {
    switch (type) {
      case 'bank':
        return <Landmark className="h-8 w-8" />;
      case 'financing_company':
        return <BadgeDollarSign className="h-8 w-8" />;
      default:
        return <Building2 className="h-8 w-8" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!offer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/financing')}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">تفاصيل العرض التمويلي</h1>
            <p className="text-muted-foreground">معلومات كاملة عن العرض - متاح للجميع</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  {offer.logo_url ? (
                    <img 
                      src={offer.logo_url} 
                      alt={offer.company_name}
                      className="w-20 h-20 object-contain rounded-lg border p-2"
                    />
                  ) : (
                    <div className={`p-4 rounded-lg ${offer.company_type === 'bank' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-emerald-100 dark:bg-emerald-900'}`}>
                      {getCompanyIcon(offer.company_type)}
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{offer.company_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{getCompanyTypeLabel(offer.company_type)}</Badge>
                      {offer.is_featured && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">
                          <Star className="h-3 w-3 ml-1" />
                          مميز
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {offer.description && (
                  <div>
                    <h3 className="font-semibold mb-2">وصف العرض</h3>
                    <p className="text-muted-foreground">{offer.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Percent className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold text-primary">{offer.interest_rate}%</p>
                    <p className="text-sm text-muted-foreground">نسبة الربح</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Calendar className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold text-primary">{offer.max_tenure}</p>
                    <p className="text-sm text-muted-foreground">سنوات التمويل</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Banknote className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-lg font-bold text-primary">{formatPrice(offer.max_amount)}</p>
                    <p className="text-sm text-muted-foreground">أقصى مبلغ</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Users className="h-6 w-6 mx-auto text-primary mb-2" />
                    <p className="text-lg font-bold text-primary">{formatPrice(offer.min_salary)}</p>
                    <p className="text-sm text-muted-foreground">أقل راتب</p>
                  </div>
                </div>

                {offer.features && offer.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">شروط ومميزات العرض</h3>
                    <div className="grid gap-2">
                      {offer.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">الحد الأقصى للاستقطاع:</span>
                  <span className="font-bold">{offer.max_dti}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Calculator Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    حاسبة التمويل
                  </CardTitle>
                  <Button 
                    variant={showCalculator ? "secondary" : "default"}
                    onClick={() => setShowCalculator(!showCalculator)}
                  >
                    {showCalculator ? 'إخفاء' : 'استخدام الحاسبة'}
                  </Button>
                </div>
              </CardHeader>
              {showCalculator && (
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <Label>سعر العقار (ر.س)</Label>
                        <Input
                          type="number"
                          value={propertyPrice}
                          onChange={(e) => setPropertyPrice(Number(e.target.value))}
                          className="mt-1"
                        />
                        <Slider
                          value={[propertyPrice]}
                          onValueChange={([val]) => setPropertyPrice(val)}
                          min={100000}
                          max={10000000}
                          step={50000}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>الدفعة الأولى (ر.س)</Label>
                        <Input
                          type="number"
                          value={downPayment}
                          onChange={(e) => setDownPayment(Number(e.target.value))}
                          className="mt-1"
                        />
                        <Slider
                          value={[downPayment]}
                          onValueChange={([val]) => setDownPayment(val)}
                          min={propertyPrice * 0.1}
                          max={propertyPrice * 0.5}
                          step={10000}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>مدة التمويل (سنة)</Label>
                        <Input
                          type="number"
                          value={tenure}
                          onChange={(e) => setTenure(Number(e.target.value))}
                          className="mt-1"
                        />
                        <Slider
                          value={[tenure]}
                          onValueChange={([val]) => setTenure(val)}
                          min={5}
                          max={offer.max_tenure}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-primary/10 rounded-lg p-6 text-center">
                        <p className="text-sm text-muted-foreground mb-2">القسط الشهري المتوقع</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatPrice(monthlyPayment)} ر.س
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <p className="text-sm text-muted-foreground">مبلغ التمويل</p>
                          <p className="font-bold">{formatPrice(loanAmount)} ر.س</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <p className="text-sm text-muted-foreground">إجمالي الربح</p>
                          <p className="font-bold">{formatPrice(totalInterest)} ر.س</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4 text-center col-span-2">
                          <p className="text-sm text-muted-foreground">إجمالي السداد</p>
                          <p className="font-bold text-lg">{formatPrice(totalPayment)} ر.س</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Financing Request Form */}
            <FinancingRequestForm
              offerId={offer.id}
              providerId={offer.user_id || ''}
              companyName={offer.company_name}
            />

            {/* Location Map */}
            {offer.latitude && offer.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    موقع الجهة التمويلية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    ref={mapContainerRef} 
                    className="h-[300px] rounded-lg overflow-hidden"
                    style={{ zIndex: 0 }}
                  />
                  <MapLegend items={[{ color: '#ef4444', label: 'موقع الجهة التمويلية' }]} className="mt-4" />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات التواصل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {offer.phone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الهاتف</p>
                      <p className="font-medium" dir="ltr">{offer.phone}</p>
                    </div>
                  </div>
                )}
                {offer.email && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                      <p className="font-medium">{offer.email}</p>
                    </div>
                  </div>
                )}
                {offer.website && (
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a href={offer.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                      زيارة الموقع الإلكتروني
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Facts */}
            <Card>
              <CardHeader>
                <CardTitle>ملخص العرض</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نسبة الربح</span>
                  <span className="font-bold text-primary">{offer.interest_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">أقصى مدة</span>
                  <span className="font-bold">{offer.max_tenure} سنة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">أقصى مبلغ</span>
                  <span className="font-bold">{formatPrice(offer.max_amount)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الحد الأدنى للراتب</span>
                  <span className="font-bold">{formatPrice(offer.min_salary)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نسبة الاستقطاع</span>
                  <span className="font-bold">{offer.max_dti}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FinancingOfferPublicDetails;
