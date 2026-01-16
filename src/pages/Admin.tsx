import { useState, useEffect, useRef } from 'react';
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
  Users, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2,
  Shield,
  MapPin,
  Search,
  Eye,
  TrendingUp,
  Home,
  Calendar,
  BarChart3,
  Star,
  Filter,
  Download,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import * as XLSX from 'xlsx';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ar } from 'date-fns/locale';
import AdminAdvertisements from '@/components/AdminAdvertisements';

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
  user_id: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  profiles: { full_name: string | null } | null;
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  propertiesCount?: number;
}

const Admin = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    pendingProperties: 0,
    approvedProperties: 0,
    featuredProperties: 0,
    totalUsers: 0,
    newUsersThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'users' | 'advertisements'>('overview');
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

      // Calculate properties count per user
      const usersWithCounts = usersData?.map(u => ({
        ...u,
        propertiesCount: propertiesData?.filter(p => p.user_id === u.user_id).length || 0
      })) || [];

      // Calculate new users this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const newUsersThisMonth = usersData?.filter(u => 
        new Date(u.created_at) >= thisMonth
      ).length || 0;

      setProperties(propertiesWithProfiles);
      setUsers(usersWithCounts);
      setStats({
        totalProperties: propertiesData?.length || 0,
        pendingProperties: propertiesData?.filter((p) => p.status === 'pending').length || 0,
        approvedProperties: propertiesData?.filter((p) => p.is_approved).length || 0,
        featuredProperties: propertiesData?.filter((p) => p.is_featured).length || 0,
        totalUsers: usersData?.length || 0,
        newUsersThisMonth,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    // Get property title before updating
    const property = properties.find(p => p.id === id);
    
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
      
      // Send email notification
      if (property) {
        try {
          await supabase.functions.invoke('send-status-notification', {
            body: {
              propertyId: id,
              newStatus: 'approved',
              propertyTitle: property.title,
            },
          });
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
        }
      }
      
      fetchData();
    }
  };

  const handleReject = async (id: string) => {
    // Get property title before updating
    const property = properties.find(p => p.id === id);
    
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
      
      // Send email notification
      if (property) {
        try {
          await supabase.functions.invoke('send-status-notification', {
            body: {
              propertyId: id,
              newStatus: 'rejected',
              propertyTitle: property.title,
            },
          });
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
        }
      }
      
      fetchData();
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    const { error } = await supabase
      .from('properties')
      .update({ is_featured: !currentFeatured })
      .eq('id', id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الإعلان',
        variant: 'destructive',
      });
    } else {
      toast({
        title: currentFeatured ? 'تم الإلغاء' : 'تم التمييز',
        description: currentFeatured ? 'تم إلغاء تمييز الإعلان' : 'تم تمييز الإعلان كمميز',
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

  // Get unique cities for filter
  const cities = [...new Set(properties.map(p => p.city))];

  // Prepare chart data
  const propertyTypeData = properties.reduce((acc, p) => {
    const type = p.property_type || 'غير محدد';
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const cityData = properties.reduce((acc, p) => {
    const city = p.city || 'غير محدد';
    const existing = acc.find(item => item.name === city);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: city, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Prepare monthly trend data (last 6 months)
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });

  const monthlyPropertyData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const count = properties.filter(p => {
      const date = new Date(p.created_at);
      return date >= monthStart && date <= monthEnd;
    }).length;
    return {
      month: format(month, 'MMM', { locale: ar }),
      عقارات: count
    };
  });

  const monthlyUserData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const count = users.filter(u => {
      const date = new Date(u.created_at);
      return date >= monthStart && date <= monthEnd;
    }).length;
    return {
      month: format(month, 'MMM', { locale: ar }),
      مستخدمين: count
    };
  });

  // Listing type data (sale vs rent)
  const listingTypeData = [
    { name: 'للبيع', value: properties.filter(p => p.listing_type === 'sale').length },
    { name: 'للإيجار', value: properties.filter(p => p.listing_type === 'rent').length }
  ];

  // Status data
  const statusData = [
    { name: 'منشور', value: stats.approvedProperties, color: '#22c55e' },
    { name: 'قيد المراجعة', value: stats.pendingProperties, color: '#f59e0b' },
    { name: 'مرفوض', value: properties.filter(p => p.status === 'rejected').length, color: '#ef4444' }
  ];

  // Price range distribution
  const priceRanges = [
    { range: '< 500K', min: 0, max: 500000 },
    { range: '500K-1M', min: 500000, max: 1000000 },
    { range: '1M-2M', min: 1000000, max: 2000000 },
    { range: '2M-5M', min: 2000000, max: 5000000 },
    { range: '> 5M', min: 5000000, max: Infinity }
  ];

  const priceDistribution = priceRanges.map(range => ({
    name: range.range,
    عقارات: properties.filter(p => p.price >= range.min && p.price < range.max).length
  }));
  // Export functions
  const exportPropertiesToExcel = () => {
    const data = filteredProperties.map(p => ({
      'العنوان': p.title,
      'المدينة': p.city,
      'السعر': p.price,
      'النوع': p.property_type,
      'نوع الإعلان': p.listing_type === 'sale' ? 'للبيع' : 'للإيجار',
      'الحالة': p.is_approved ? 'منشور' : p.status === 'pending' ? 'قيد المراجعة' : 'مرفوض',
      'مميز': p.is_featured ? 'نعم' : 'لا',
      'غرف النوم': p.bedrooms || 0,
      'الحمامات': p.bathrooms || 0,
      'المساحة': p.area || 0,
      'تاريخ الإنشاء': new Date(p.created_at).toLocaleDateString('ar-SA'),
      'المالك': p.profiles?.full_name || 'غير معروف',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'العقارات');
    XLSX.writeFile(workbook, `العقارات_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير بيانات العقارات إلى ملف Excel',
    });
  };

  const exportUsersToExcel = () => {
    const data = filteredUsers.map(u => ({
      'الاسم': u.full_name || 'بدون اسم',
      'رقم الهاتف': u.phone || 'بدون رقم',
      'عدد الإعلانات': u.propertiesCount || 0,
      'تاريخ التسجيل': new Date(u.created_at).toLocaleDateString('ar-SA'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المستخدمين');
    XLSX.writeFile(workbook, `المستخدمين_${new Date().toLocaleDateString('ar-SA')}.xlsx`);
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير بيانات المستخدمين إلى ملف Excel',
    });
  };

  // Filter properties
  const filteredProperties = properties.filter(p => {
    if (searchQuery && !p.title.includes(searchQuery) && !p.city.includes(searchQuery)) {
      return false;
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'approved' && !p.is_approved) return false;
      if (statusFilter === 'pending' && p.status !== 'pending') return false;
      if (statusFilter === 'rejected' && p.status !== 'rejected') return false;
    }
    if (cityFilter !== 'all' && p.city !== cityFilter) {
      return false;
    }
    return true;
  });

  // Filter users
  const filteredUsers = users.filter(u => {
    if (searchQuery && !u.full_name?.includes(searchQuery) && !u.phone?.includes(searchQuery)) {
      return false;
    }
    return true;
  });

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
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col bg-card border-l min-h-[calc(100vh-64px)] p-4">
          <div className="flex items-center gap-3 mb-8 p-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h2 className="font-bold">لوحة الإدارة</h2>
              <p className="text-xs text-muted-foreground">مرحباً بك</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <Button 
              variant={activeTab === 'overview' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 className="h-4 w-4" />
              نظرة عامة
            </Button>
            <Button 
              variant={activeTab === 'properties' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab('properties')}
            >
              <Building2 className="h-4 w-4" />
              الإعلانات
              <Badge variant="secondary" className="mr-auto">{stats.totalProperties}</Badge>
            </Button>
            <Button 
              variant={activeTab === 'users' ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-4 w-4" />
              المستخدمين
              <Badge variant="secondary" className="mr-auto">{stats.totalUsers}</Badge>
            </Button>
            
            <div className="border-t my-4 pt-4">
              <p className="text-xs text-muted-foreground mb-2 px-3">إدارة متقدمة</p>
              <Button 
                variant={activeTab === 'advertisements' ? 'secondary' : 'ghost'} 
                className="w-full justify-start gap-2"
                onClick={() => setActiveTab('advertisements')}
              >
                <ImageIcon className="h-4 w-4 text-purple-500" />
                إدارة الإعلانات
              </Button>
              <Link to="/admin/featured">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  الإعلانات المميزة
                </Button>
              </Link>
              <Link to="/admin/financing-offers">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  إدارة العروض التمويلية
                </Button>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Mobile Tab Buttons */}
          <div className="flex md:hidden gap-2 mb-6 overflow-x-auto pb-2">
            <Button 
              variant={activeTab === 'overview' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 className="h-4 w-4 ml-1" />
              نظرة عامة
            </Button>
            <Button 
              variant={activeTab === 'properties' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('properties')}
            >
              <Building2 className="h-4 w-4 ml-1" />
              الإعلانات
            </Button>
            <Button 
              variant={activeTab === 'users' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('users')}
            >
              <Users className="h-4 w-4 ml-1" />
              المستخدمين
            </Button>
            <Button 
              variant={activeTab === 'advertisements' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('advertisements')}
            >
              <ImageIcon className="h-4 w-4 ml-1" />
              إدارة الإعلانات
            </Button>
            <Link to="/admin/financing-offers">
              <Button variant="outline" size="sm" className="border-emerald-500 text-emerald-600">
                <Building2 className="h-4 w-4 ml-1" />
                العروض التمويلية
              </Button>
            </Link>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">نظرة عامة</h1>
              
              {/* Stats Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">إجمالي الإعلانات</p>
                        <p className="text-2xl font-bold">{stats.totalProperties}</p>
                      </div>
                      <Building2 className="h-8 w-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">قيد المراجعة</p>
                        <p className="text-2xl font-bold text-amber-500">{stats.pendingProperties}</p>
                      </div>
                      <Clock className="h-8 w-8 text-amber-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">منشور</p>
                        <p className="text-2xl font-bold text-green-500">{stats.approvedProperties}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">مميز</p>
                        <p className="text-2xl font-bold text-primary">{stats.featuredProperties}</p>
                      </div>
                      <Star className="h-8 w-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">المستخدمين</p>
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      </div>
                      <Users className="h-8 w-8 text-primary opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">جدد هذا الشهر</p>
                        <p className="text-2xl font-bold text-green-500">{stats.newUsersThisMonth}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trends */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">نمو العقارات (آخر 6 أشهر)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={monthlyPropertyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="عقارات" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">نمو المستخدمين (آخر 6 أشهر)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={monthlyUserData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="مستخدمين" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">حالة الإعلانات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">نوع الإعلان</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={listingTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#22c55e" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">توزيع العقارات حسب النوع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={propertyTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={70}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {propertyTypeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">توزيع الأسعار</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={priceDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={60} />
                        <Tooltip />
                        <Bar dataKey="عقارات" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* City Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">توزيع العقارات حسب المدينة</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" name="عدد العقارات" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Properties */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>آخر الإعلانات</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('properties')}>
                    عرض الكل
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {properties.slice(0, 5).map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{property.title}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {property.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {property.is_approved ? (
                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">منشور</Badge>
                          ) : property.status === 'pending' ? (
                            <Badge variant="secondary">قيد المراجعة</Badge>
                          ) : (
                            <Badge variant="destructive">مرفوض</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>آخر المستخدمين</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('users')}>
                    عرض الكل
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.slice(0, 5).map((userProfile) => (
                      <div
                        key={userProfile.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{userProfile.full_name || 'بدون اسم'}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(userProfile.created_at).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{userProfile.propertiesCount} إعلان</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h1 className="text-2xl font-bold">إدارة الإعلانات</h1>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={exportPropertiesToExcel}>
                    <FileSpreadsheet className="h-4 w-4 ml-1" />
                    تصدير Excel
                  </Button>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-9 w-48"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36">
                      <Filter className="h-4 w-4 ml-2" />
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="approved">منشور</SelectItem>
                      <SelectItem value="pending">قيد المراجعة</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger className="w-36">
                      <MapPin className="h-4 w-4 ml-2" />
                      <SelectValue placeholder="المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">كل المدن</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4">
                {filteredProperties.length === 0 ? (
                  <Card className="py-8 text-center">
                    <CardContent>
                      <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">لا توجد إعلانات</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredProperties.map((property) => (
                    <Card key={property.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-bold">{property.title}</h3>
                              {property.is_featured && (
                                <Badge className="bg-primary">
                                  <Star className="w-3 h-3 ml-1" />
                                  مميز
                                </Badge>
                              )}
                              {property.is_approved ? (
                                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">منشور</Badge>
                              ) : property.status === 'pending' ? (
                                <Badge variant="secondary">قيد المراجعة</Badge>
                              ) : (
                                <Badge variant="destructive">مرفوض</Badge>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {property.city}
                              </span>
                              <span>{property.price.toLocaleString()} ريال</span>
                              <span>{property.property_type}</span>
                              <span>{property.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}</span>
                              <span className="text-xs">
                                بواسطة: {property.profiles?.full_name || 'غير معروف'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                            >
                              <Link to={`/property/${property.id}`}>
                                <Eye className="h-4 w-4 ml-1" />
                                عرض
                              </Link>
                            </Button>
                            
                            <Button
                              size="sm"
                              variant={property.is_featured ? "secondary" : "outline"}
                              onClick={() => handleToggleFeatured(property.id, property.is_featured)}
                            >
                              <Star className={`h-4 w-4 ml-1 ${property.is_featured ? 'fill-current' : ''}`} />
                              {property.is_featured ? 'إلغاء التمييز' : 'تمييز'}
                            </Button>
                            
                            {!property.is_approved && property.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-500 hover:bg-green-500 hover:text-white"
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
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
                <div className="flex gap-2 items-center">
                  <Button variant="outline" size="sm" onClick={exportUsersToExcel}>
                    <FileSpreadsheet className="h-4 w-4 ml-1" />
                    تصدير Excel
                  </Button>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث بالاسم أو الهاتف..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-9 w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((userProfile) => (
                  <Card key={userProfile.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{userProfile.full_name || 'بدون اسم'}</p>
                          <p className="text-sm text-muted-foreground">
                            {userProfile.phone || 'بدون رقم'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">
                              <Building2 className="w-3 h-3 ml-1" />
                              {userProfile.propertiesCount} إعلان
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            انضم في: {new Date(userProfile.created_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Advertisements Tab */}
          {activeTab === 'advertisements' && (
            <AdminAdvertisements />
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Admin;
