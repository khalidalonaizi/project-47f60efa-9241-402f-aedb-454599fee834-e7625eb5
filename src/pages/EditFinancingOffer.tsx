import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LogoUpload from '@/components/LogoUpload';
import LocationPicker from '@/components/LocationPicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Loader2, Save, Building2, Landmark, BadgeDollarSign, Plus, Trash2, MapPin } from 'lucide-react';

interface FinancingOffer {
  id: string;
  company_name: string;
  company_type: string;
  logo_url: string | null;
  interest_rate: number;
  max_tenure: number;
  max_amount: number;
  min_salary: number;
  max_dti: number;
  features: string[] | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  is_featured: boolean | null;
  is_approved: boolean | null;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
}

const EditFinancingOffer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offer, setOffer] = useState<FinancingOffer | null>(null);

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState<'bank' | 'financing_company'>('financing_company');
  const [logoUrl, setLogoUrl] = useState('');
  const [interestRate, setInterestRate] = useState(5);
  const [maxTenure, setMaxTenure] = useState(20);
  const [maxAmount, setMaxAmount] = useState(3000000);
  const [minSalary, setMinSalary] = useState(5000);
  const [maxDti, setMaxDti] = useState(60);
  const [features, setFeatures] = useState<string[]>(['']);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        toast({
          title: 'غير مصرح',
          description: 'ليس لديك صلاحية الوصول لهذه الصفحة',
          variant: 'destructive',
        });
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  useEffect(() => {
    if (user && isAdmin && id) {
      fetchOffer();
    }
  }, [user, isAdmin, id]);

  const fetchOffer = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('financing_offers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على العرض',
        variant: 'destructive',
      });
      navigate('/admin/financing-offers');
      return;
    }

    setOffer(data);
    setCompanyName(data.company_name);
    setCompanyType(data.company_type as 'bank' | 'financing_company');
    setLogoUrl(data.logo_url || '');
    setInterestRate(data.interest_rate);
    setMaxTenure(data.max_tenure);
    setMaxAmount(data.max_amount);
    setMinSalary(data.min_salary);
    setMaxDti(data.max_dti);
    setFeatures(data.features && data.features.length > 0 ? data.features : ['']);
    setPhone(data.phone || '');
    setEmail(data.email || '');
    setWebsite(data.website || '');
    setDescription(data.description || '');
    setLatitude(data.latitude || undefined);
    setLongitude(data.longitude || undefined);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!companyName.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم الشركة',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('financing_offers')
      .update({
        company_name: companyName,
        company_type: companyType,
        logo_url: logoUrl || null,
        interest_rate: interestRate,
        max_tenure: maxTenure,
        max_amount: maxAmount,
        min_salary: minSalary,
        max_dti: maxDti,
        features: features.filter(f => f.trim()),
        phone: phone || null,
        email: email || null,
        website: website || null,
        description: description || null,
        latitude: latitude || null,
        longitude: longitude || null,
      })
      .eq('id', id);

    setSaving(false);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ التعديلات',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ التعديلات بنجاح',
      });
      navigate('/admin/financing-offers');
    }
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA').format(price);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin || !offer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/financing-offers')}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">تعديل العرض التمويلي</h1>
            <p className="text-muted-foreground">{offer.company_name}</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                معلومات أساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>اسم الشركة / البنك *</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="اسم الجهة التمويلية"
                  />
                </div>
                <div className="space-y-2">
                  <Label>نوع الجهة</Label>
                  <Select value={companyType} onValueChange={(v: 'bank' | 'financing_company') => setCompanyType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">
                        <div className="flex items-center gap-2">
                          <Landmark className="h-4 w-4" />
                          بنك
                        </div>
                      </SelectItem>
                      <SelectItem value="financing_company">
                        <div className="flex items-center gap-2">
                          <BadgeDollarSign className="h-4 w-4" />
                          شركة تمويل
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>شعار الشركة</Label>
                <LogoUpload
                  currentUrl={logoUrl}
                  onUpload={setLogoUrl}
                  onRemove={() => setLogoUrl('')}
                />
              </div>

              <div className="space-y-2">
                <Label>وصف العرض</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف موجز للعرض التمويلي..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financing Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل التمويل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>نسبة الفائدة (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="20"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>أقصى مدة (سنة)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={maxTenure}
                    onChange={(e) => setMaxTenure(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الحد الأقصى للتمويل (ر.س)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">{formatPrice(maxAmount)} ر.س</p>
                </div>
                <div className="space-y-2">
                  <Label>أقل راتب مطلوب (ر.س)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={minSalary}
                    onChange={(e) => setMinSalary(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">{formatPrice(minSalary)} ر.س</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>نسبة الاستقطاع القصوى (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={maxDti}
                  onChange={(e) => setMaxDti(parseInt(e.target.value) || 0)}
                  className="max-w-[200px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>المميزات</span>
                <Button type="button" variant="outline" size="sm" onClick={addFeature} className="gap-1">
                  <Plus className="h-4 w-4" />
                  إضافة
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`الميزة ${index + 1}`}
                  />
                  {features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات التواصل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="920000000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الموقع الإلكتروني</Label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-destructive" />
                موقع الفرع على الخريطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                حدد موقع البنك أو شركة التمويل على الخريطة (سيظهر بأيقونة حمراء)
              </p>
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onLocationChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                autoDetectLocation={false}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => navigate('/admin/financing-offers')}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              حفظ التعديلات
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EditFinancingOffer;
