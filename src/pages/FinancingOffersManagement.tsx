import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Shield,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Star,
  Building2,
  Landmark,
  BadgeDollarSign,
  ArrowRight,
  Phone,
  Mail,
  Globe,
  Loader2,
  Eye,
  Plus,
  Pencil
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  is_approved: boolean;
  created_at: string;
  user_id: string;
  profiles?: { full_name: string | null };
}

const FinancingOffersManagement = () => {
  const [offers, setOffers] = useState<FinancingOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rateFilter, setRateFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    featured: 0,
    banks: 0,
    companies: 0,
  });
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
      fetchOffers();
    }
  }, [user, isAdmin]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('financing_offers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching offers:', error);
        toast({
          title: 'خطأ',
          description: 'حدث خطأ أثناء جلب العروض',
          variant: 'destructive',
        });
        return;
      }

      // Fetch profile names
      if (data) {
        const userIds = [...new Set(data.map(o => o.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p.full_name]) || []);

        const offersWithProfiles = data.map(o => ({
          ...o,
          features: o.features || [],
          profiles: { full_name: profilesMap.get(o.user_id) || null }
        })) as FinancingOffer[];

        setOffers(offersWithProfiles);

        // Calculate stats
        setStats({
          total: data.length,
          pending: data.filter(o => !o.is_approved).length,
          approved: data.filter(o => o.is_approved).length,
          featured: data.filter(o => o.is_featured).length,
          banks: data.filter(o => o.company_type === 'bank').length,
          companies: data.filter(o => o.company_type === 'financing_company').length,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (offerId: string) => {
    const { error } = await supabase
      .from('financing_offers')
      .update({ is_approved: true })
      .eq('id', offerId);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الموافقة على العرض',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'تمت الموافقة',
        description: 'تم الموافقة على العرض بنجاح',
      });
      fetchOffers();
    }
  };

  const handleReject = async (offerId: string) => {
    const { error } = await supabase
      .from('financing_offers')
      .update({ is_approved: false })
      .eq('id', offerId);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء رفض العرض',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'تم الرفض',
        description: 'تم رفض العرض',
      });
      fetchOffers();
    }
  };

  const handleToggleFeatured = async (offerId: string, currentFeatured: boolean) => {
    const { error } = await supabase
      .from('financing_offers')
      .update({ is_featured: !currentFeatured })
      .eq('id', offerId);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث حالة التمييز',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'تم التحديث',
        description: currentFeatured ? 'تم إلغاء التمييز' : 'تم تمييز العرض',
      });
      fetchOffers();
    }
  };

  const handleDelete = async (offerId: string) => {
    const { error } = await supabase
      .from('financing_offers')
      .delete()
      .eq('id', offerId);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف العرض',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'تم الحذف',
        description: 'تم حذف العرض بنجاح',
      });
      fetchOffers();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-SA').format(price);
  };

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
        return <Landmark className="h-5 w-5" />;
      case 'financing_company':
        return <BadgeDollarSign className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  // Filter offers
  const filteredOffers = offers.filter(offer => {
    if (searchQuery && !offer.company_name.includes(searchQuery)) {
      return false;
    }
    if (statusFilter === 'pending' && offer.is_approved) {
      return false;
    }
    if (statusFilter === 'approved' && !offer.is_approved) {
      return false;
    }
    if (statusFilter === 'featured' && !offer.is_featured) {
      return false;
    }
    if (typeFilter !== 'all' && offer.company_type !== typeFilter) {
      return false;
    }
    if (rateFilter === 'low' && offer.interest_rate > 4.5) {
      return false;
    }
    if (rateFilter === 'medium' && (offer.interest_rate <= 4.5 || offer.interest_rate > 5.5)) {
      return false;
    }
    if (rateFilter === 'high' && offer.interest_rate <= 5.5) {
      return false;
    }
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">إدارة العروض التمويلية</h1>
              <p className="text-muted-foreground">مراجعة وإدارة عروض البنوك وشركات التمويل</p>
            </div>
          </div>
          <Button onClick={() => navigate('/financing')} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة عرض جديد
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي العروض</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">بانتظار المراجعة</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">موافق عليها</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.featured}</p>
                <p className="text-sm text-muted-foreground">مميزة</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث باسم الشركة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">بانتظار المراجعة</SelectItem>
                  <SelectItem value="approved">موافق عليها</SelectItem>
                  <SelectItem value="featured">مميزة</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="نوع الجهة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="bank">بنوك ({stats.banks})</SelectItem>
                  <SelectItem value="financing_company">شركات تمويل ({stats.companies})</SelectItem>
                </SelectContent>
              </Select>
              <Select value={rateFilter} onValueChange={setRateFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="معدل الفائدة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المعدلات</SelectItem>
                  <SelectItem value="low">منخفض (≤4.5%)</SelectItem>
                  <SelectItem value="medium">متوسط (4.5-5.5%)</SelectItem>
                  <SelectItem value="high">مرتفع ({'>'} 5.5%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Offers List */}
        <div className="space-y-4">
          {filteredOffers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد عروض تمويلية</p>
              </CardContent>
            </Card>
          ) : (
            filteredOffers.map((offer) => (
              <Card key={offer.id} className={`${offer.is_featured ? 'border-yellow-400 bg-yellow-50/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Company Info */}
                    <div className="flex items-start gap-3 flex-1">
                      {offer.logo_url ? (
                        <img src={offer.logo_url} alt={offer.company_name} className="w-12 h-12 object-contain rounded-lg border p-1" />
                      ) : (
                        <div className={`p-3 rounded-lg ${offer.company_type === 'bank' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                          {getCompanyIcon(offer.company_type)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold">{offer.company_name}</h3>
                          <Badge variant="outline">{getCompanyTypeLabel(offer.company_type)}</Badge>
                          {offer.is_featured && (
                            <Badge className="bg-yellow-500">
                              <Star className="h-3 w-3 ml-1" />
                              مميز
                            </Badge>
                          )}
                          {offer.is_approved ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 ml-1" />
                              معتمد
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Clock className="h-3 w-3 ml-1" />
                              بانتظار المراجعة
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          أضيف بواسطة: {offer.profiles?.full_name || 'غير معروف'} | 
                          {new Date(offer.created_at).toLocaleDateString('ar-SA')}
                        </p>
                        
                        {/* Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">نسبة الفائدة:</span>
                            <span className="font-medium mr-1">{offer.interest_rate}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">أقصى مدة:</span>
                            <span className="font-medium mr-1">{offer.max_tenure} سنة</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">الحد الأقصى:</span>
                            <span className="font-medium mr-1">{formatPrice(offer.max_amount)} ر.س</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">أقل راتب:</span>
                            <span className="font-medium mr-1">{formatPrice(offer.min_salary)} ر.س</span>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                          {offer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {offer.phone}
                            </span>
                          )}
                          {offer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {offer.email}
                            </span>
                          )}
                          {offer.website && (
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              الموقع
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap lg:flex-col gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/admin/financing-offers/${offer.id}`)}>
                        <Eye className="h-4 w-4 ml-1" />
                        عرض التفاصيل
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/admin/financing-offers/${offer.id}/edit`)}>
                        <Pencil className="h-4 w-4 ml-1" />
                        تعديل
                      </Button>
                      {!offer.is_approved && (
                        <Button size="sm" onClick={() => handleApprove(offer.id)}>
                          <CheckCircle className="h-4 w-4 ml-1" />
                          موافقة
                        </Button>
                      )}
                      {offer.is_approved && (
                        <Button size="sm" variant="outline" onClick={() => handleReject(offer.id)}>
                          <XCircle className="h-4 w-4 ml-1" />
                          إلغاء الموافقة
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={offer.is_featured ? "secondary" : "outline"}
                        onClick={() => handleToggleFeatured(offer.id, offer.is_featured)}
                      >
                        <Star className={`h-4 w-4 ml-1 ${offer.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                        {offer.is_featured ? 'إلغاء التمييز' : 'تمييز'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4 ml-1" />
                            حذف
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              سيتم حذف هذا العرض نهائياً ولا يمكن استعادته.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(offer.id)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FinancingOffersManagement;
