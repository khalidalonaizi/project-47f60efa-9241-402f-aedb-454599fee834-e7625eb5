import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Users, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2,
  Shield,
  MapPin
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  property_type: string;
  listing_type: string;
  is_approved: boolean;
  status: string;
  created_at: string;
  user_id: string;
  profiles: { full_name: string | null } | null;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

const Admin = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingProperties: 0,
    approvedProperties: 0,
    totalUsers: 0,
  });
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
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    try {
      // Fetch properties
      const { data: propertiesData, error: propError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (propError) {
        console.error('Error fetching properties:', propError);
      }

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
      }

      // Fetch profile names for properties
      let propertiesWithProfiles: Property[] = [];
      if (propertiesData) {
        const userIds = [...new Set(propertiesData.map(p => p.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p.full_name]) || []);
        
        propertiesWithProfiles = propertiesData.map(p => ({
          ...p,
          profiles: { full_name: profilesMap.get(p.user_id) || null }
        })) as Property[];
      }

      setProperties(propertiesWithProfiles);
      setStats({
        totalProperties: propertiesData?.length || 0,
        pendingProperties: propertiesData?.filter((p) => p.status === 'pending').length || 0,
        approvedProperties: propertiesData?.filter((p) => p.is_approved).length || 0,
        totalUsers: usersData?.length || 0,
      });

      if (usersData) {
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('properties')
      .update({ is_approved: true, status: 'approved' })
      .eq('id', id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء قبول الإعلان',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'تم القبول',
        description: 'تم قبول الإعلان ونشره',
      });
      fetchData();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('properties')
      .update({ is_approved: false, status: 'rejected' })
      .eq('id', id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء رفض الإعلان',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'تم الرفض',
        description: 'تم رفض الإعلان',
      });
      fetchData();
    }
  };

  const handleDeleteProperty = async (id: string) => {
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
        description: 'تم حذف الإعلان',
      });
      fetchData();
    }
  };

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
    <div className="min-h-screen">
      <Header />
      <main className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">لوحة الإدارة</h1>
            <p className="text-muted-foreground">إدارة الإعلانات والمستخدمين</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي الإعلانات</p>
                  <p className="text-3xl font-bold">{stats.totalProperties}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">قيد المراجعة</p>
                  <p className="text-3xl font-bold text-gold">{stats.pendingProperties}</p>
                </div>
                <Clock className="h-8 w-8 text-gold" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">منشور</p>
                  <p className="text-3xl font-bold text-success">{stats.approvedProperties}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المستخدمين</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties">
          <TabsList className="mb-4">
            <TabsTrigger value="properties">الإعلانات</TabsTrigger>
            <TabsTrigger value="users">المستخدمين</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <div className="grid gap-4">
              {properties.length === 0 ? (
                <Card className="py-8 text-center">
                  <CardContent>
                    <p className="text-muted-foreground">لا توجد إعلانات</p>
                  </CardContent>
                </Card>
              ) : (
                properties.map((property) => (
                  <Card key={property.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold">{property.title}</h3>
                            {property.is_approved ? (
                              <Badge className="bg-success">منشور</Badge>
                            ) : property.status === 'pending' ? (
                              <Badge variant="secondary">قيد المراجعة</Badge>
                            ) : (
                              <Badge variant="destructive">مرفوض</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {property.city}
                            </span>
                            <span>{property.price.toLocaleString()} ريال</span>
                            <span>بواسطة: {property.profiles?.full_name || 'غير معروف'}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {!property.is_approved && property.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success hover:bg-success hover:text-success-foreground"
                                onClick={() => handleApprove(property.id)}
                              >
                                <CheckCircle className="h-4 w-4 ml-1" />
                                قبول
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => handleReject(property.id)}
                              >
                                <XCircle className="h-4 w-4 ml-1" />
                                رفض
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => handleDeleteProperty(property.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>قائمة المستخدمين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {users.map((userProfile) => (
                    <div
                      key={userProfile.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{userProfile.full_name || 'بدون اسم'}</p>
                        <p className="text-sm text-muted-foreground">
                          {userProfile.phone || 'بدون رقم'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          انضم في: {new Date(userProfile.created_at).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
