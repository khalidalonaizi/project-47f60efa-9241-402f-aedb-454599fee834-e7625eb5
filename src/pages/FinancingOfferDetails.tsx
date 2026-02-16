import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  ArrowRight,
  Landmark,
  BadgeDollarSign,
  Building2,
  CheckCircle,
  Clock,
  Star,
  Phone,
  Mail,
  Globe,
  Loader2,
  Edit,
  Trash2,
  Percent,
  Calendar,
  Banknote,
  Users
} from 'lucide-react';
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

const FinancingOfferDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<FinancingOffer | null>(null);
  const [loading, setLoading] = useState(true);
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
    if (user && isAdmin && id) {
      fetchOffer();
    }
  }, [user, isAdmin, id]);

  const fetchOffer = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('financing_offers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching offer:', error);
        toast({
          title: 'خطأ',
          description: 'حدث خطأ أثناء جلب تفاصيل العرض',
          variant: 'destructive',
        });
        navigate('/admin/financing-offers');
        return;
      }

      if (data) {
        // Fetch profile name
        const { data: profileData } = await supabase
          .from('profiles_public')
          .select('full_name')
          .eq('user_id', data.user_id)
          .single();

        setOffer({
          ...data,
          features: data.features || [],
          profiles: { full_name: profileData?.full_name || null }
        } as FinancingOffer);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!offer) return;
    
    const { error } = await supabase
      .from('financing_offers')
      .update({ is_approved: true })
      .eq('id', offer.id);

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
      fetchOffer();
    }
  };

  const handleReject = async () => {
    if (!offer) return;
    
    const { error } = await supabase
      .from('financing_offers')
      .update({ is_approved: false })
      .eq('id', offer.id);

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
      fetchOffer();
    }
  };

  const handleToggleFeatured = async () => {
    if (!offer) return;
    
    const { error } = await supabase
      .from('financing_offers')
      .update({ is_featured: !offer.is_featured })
      .eq('id', offer.id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث حالة التمييز',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'تم التحديث',
        description: offer.is_featured ? 'تم إلغاء التمييز' : 'تم تمييز العرض',
      });
      fetchOffer();
    }
  };

  const handleDelete = async () => {
    if (!offer) return;
    
    const { error } = await supabase
      .from('financing_offers')
      .delete()
      .eq('id', offer.id);

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
      navigate('/admin/financing-offers');
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
        return <Landmark className="h-8 w-8" />;
      case 'financing_company':
        return <BadgeDollarSign className="h-8 w-8" />;
      default:
        return <Building2 className="h-8 w-8" />;
    }
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
      
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/financing-offers')}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">تفاصيل العرض التمويلي</h1>
            <p className="text-muted-foreground">مراجعة وإدارة العرض</p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            {!offer.is_approved ? (
              <Button onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 ml-1" />
                موافقة
              </Button>
            ) : (
              <Button variant="outline" onClick={handleReject}>
                رفض
              </Button>
            )}
            <Button
              variant={offer.is_featured ? "secondary" : "outline"}
              onClick={handleToggleFeatured}
            >
              <Star className={`h-4 w-4 ml-1 ${offer.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              {offer.is_featured ? 'إلغاء التمييز' : 'تمييز'}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
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
                  <AlertDialogAction onClick={handleDelete}>
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-4">
                {offer.logo_url ? (
                  <img 
                    src={offer.logo_url} 
                    alt={offer.company_name}
                    className="w-16 h-16 object-contain rounded-lg border p-2"
                  />
                ) : (
                  <div className={`p-4 rounded-lg ${offer.company_type === 'bank' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                    {getCompanyIcon(offer.company_type)}
                  </div>
                )}
                <div className="flex-1">
                  <CardTitle className="text-xl">{offer.company_name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
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
                  <p className="text-sm text-muted-foreground">معدل الفائدة</p>
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
                  <h3 className="font-semibold mb-3">مميزات العرض</h3>
                  <div className="grid gap-2">
                    {offer.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات التواصل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {offer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{offer.phone}</span>
                  </div>
                )}
                {offer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{offer.email}</span>
                  </div>
                )}
                {offer.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <a 
                      href={offer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {offer.website}
                    </a>
                  </div>
                )}
                {!offer.phone && !offer.email && !offer.website && (
                  <p className="text-muted-foreground text-sm">لا توجد معلومات تواصل</p>
                )}
              </CardContent>
            </Card>

            {/* Submission Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات التقديم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">مقدم الطلب:</span>
                  <span className="font-medium">{offer.profiles?.full_name || 'غير معروف'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاريخ التقديم:</span>
                  <span className="font-medium">
                    {new Date(offer.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الحد الأقصى للاستقطاع:</span>
                  <span className="font-medium">{offer.max_dti}%</span>
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

export default FinancingOfferDetails;
