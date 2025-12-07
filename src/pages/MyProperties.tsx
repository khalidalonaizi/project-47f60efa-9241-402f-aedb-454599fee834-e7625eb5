import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Plus, MapPin, BedDouble, Bath, Ruler, Trash2, Edit, Eye } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  neighborhood: string | null;
  property_type: string;
  listing_type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  is_approved: boolean;
  status: string;
  created_at: string;
}

const getPropertyTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    apartment: 'شقة',
    villa: 'فيلا',
    land: 'أرض',
    building: 'عمارة',
    office: 'مكتب',
    shop: 'محل تجاري',
  };
  return types[type] || type;
};

const getStatusBadge = (isApproved: boolean, status: string) => {
  if (isApproved) {
    return <Badge className="bg-success text-success-foreground">منشور</Badge>;
  }
  if (status === 'pending') {
    return <Badge variant="secondary">قيد المراجعة</Badge>;
  }
  return <Badge variant="destructive">مرفوض</Badge>;
};

const MyProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب العقارات',
        variant: 'destructive',
      });
    } else {
      setProperties(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

    const { error } = await supabase.from('properties').delete().eq('id', id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف الإعلان',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الإعلان بنجاح',
      });
      setProperties(properties.filter((p) => p.id !== id));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">إعلاناتي</h1>
            <p className="text-muted-foreground">إدارة إعلاناتك العقارية</p>
          </div>
          <Button asChild variant="hero">
            <Link to="/add-property">
              <Plus className="h-4 w-4 ml-2" />
              إضافة إعلان
            </Link>
          </Button>
        </div>

        {properties.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent>
              <p className="text-muted-foreground mb-4">لا توجد إعلانات حتى الآن</p>
              <Button asChild variant="hero">
                <Link to="/add-property">
                  <Plus className="h-4 w-4 ml-2" />
                  أضف إعلانك الأول
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{property.title}</h3>
                        {getStatusBadge(property.is_approved, property.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-muted-foreground text-sm mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {property.city}
                          {property.neighborhood && ` - ${property.neighborhood}`}
                        </span>
                        <span>{getPropertyTypeLabel(property.property_type)}</span>
                        <span>{property.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-4 w-4 text-muted-foreground" />
                          {property.bedrooms} غرف
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4 text-muted-foreground" />
                          {property.bathrooms} حمام
                        </span>
                        <span className="flex items-center gap-1">
                          <Ruler className="h-4 w-4 text-muted-foreground" />
                          {property.area} م²
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xl font-bold text-primary">
                        {property.price.toLocaleString()} ريال
                        {property.listing_type === 'rent' && <span className="text-sm font-normal">/شهر</span>}
                      </p>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleDelete(property.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
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

export default MyProperties;
