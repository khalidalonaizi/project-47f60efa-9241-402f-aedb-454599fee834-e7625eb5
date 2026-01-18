import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Star, 
  Search, 
  Building2, 
  MapPin, 
  Eye,
  ChevronLeft,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  property_type: string;
  listing_type: string;
  is_approved: boolean;
  is_featured: boolean;
  status: string;
  created_at: string;
  images: string[] | null;
}

const propertyTypeLabels: Record<string, string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  land: 'أرض',
  building: 'عمارة',
  office: 'مكتب',
  shop: 'محل تجاري',
};

const FeaturedAdsManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

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
    if (user && isAdmin) {
      fetchProperties();
    }
  }, [user, isAdmin]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }

      setProperties(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ is_featured: !currentFeatured })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: currentFeatured ? 'تم الإلغاء' : 'تم التمييز',
        description: currentFeatured ? 'تم إلغاء تمييز الإعلان' : 'تم تمييز الإعلان كمميز',
      });

      // Update local state
      setProperties(prev => 
        prev.map(p => p.id === id ? { ...p, is_featured: !currentFeatured } : p)
      );
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الإعلان',
        variant: 'destructive',
      });
    }
  };

  // Get unique cities for filter
  const cities = [...new Set(properties.map(p => p.city))].filter(Boolean);

  // Filter properties
  const filteredProperties = properties.filter(p => {
    if (searchQuery && !p.title.includes(searchQuery) && !p.city.includes(searchQuery)) {
      return false;
    }
    if (cityFilter !== 'all' && p.city !== cityFilter) {
      return false;
    }
    if (featuredFilter !== 'all') {
      if (featuredFilter === 'featured' && !p.is_featured) return false;
      if (featuredFilter === 'not-featured' && p.is_featured) return false;
    }
    return true;
  });

  const featuredCount = properties.filter(p => p.is_featured).length;
  const totalCount = properties.length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">جاري التحميل...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/admin">
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              العودة للوحة التحكم
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-yellow-500" />
              إدارة الإعلانات المميزة
            </h1>
            <p className="text-muted-foreground mt-2">
              تفعيل وإلغاء تمييز الإعلانات لعرضها في القسم المميز
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الإعلانات المميزة</p>
                  <p className="text-3xl font-bold text-yellow-600">{featuredCount}</p>
                </div>
                <Star className="h-10 w-10 text-yellow-500 fill-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الإعلانات</p>
                  <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
                </div>
                <Building2 className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">نسبة التمييز</p>
                  <p className="text-3xl font-bold text-green-600">
                    {totalCount > 0 ? Math.round((featuredCount / totalCount) * 100) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث عن إعلان..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="المدينة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المدن</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="حالة التمييز" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="featured">مميزة فقط</SelectItem>
                  <SelectItem value="not-featured">غير مميزة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              قائمة الإعلانات ({filteredProperties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الصورة</TableHead>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">المدينة</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">السعر</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">مميز</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProperties.map((property) => (
                    <TableRow key={property.id} className={property.is_featured ? 'bg-yellow-500/5' : ''}>
                      <TableCell>
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                          {property.images && property.images[0] ? (
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">{property.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {property.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {property.city}
                        </div>
                      </TableCell>
                      <TableCell>
                        {propertyTypeLabels[property.property_type] || property.property_type}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">
                          {property.price.toLocaleString()} ر.س
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={property.is_approved ? 'default' : 'secondary'}>
                          {property.is_approved ? 'منشور' : property.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={property.is_featured}
                            onCheckedChange={() => handleToggleFeatured(property.id, property.is_featured)}
                          />
                          {property.is_featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link to={`/property/${property.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="h-4 w-4" />
                            عرض
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredProperties.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد إعلانات</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default FeaturedAdsManagement;
