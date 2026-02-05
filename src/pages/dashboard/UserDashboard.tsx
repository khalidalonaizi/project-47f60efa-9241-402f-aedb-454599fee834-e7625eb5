import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PropertyMapView from "@/components/dashboard/PropertyMapView";
import {
  Building2,
  Eye,
  Clock,
  XCircle,
  Plus,
  Heart,
  MessageSquare,
  TrendingUp,
  MapPin,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  neighborhood: string | null;
  property_type: string;
  listing_type: string;
  status: string | null;
  is_approved: boolean | null;
  images: string[] | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

interface Stats {
  totalProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  totalViews: number;
  totalFavorites: number;
  totalMessages: number;
}

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    pendingProperties: 0,
    rejectedProperties: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalMessages: 0,
  });
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      // Calculate stats
      const total = propertiesData?.length || 0;
      const pending = propertiesData?.filter(p => p.status === "pending" || !p.is_approved).length || 0;
      const rejected = propertiesData?.filter(p => p.status === "rejected").length || 0;

      // Fetch favorites count
      const { count: favoritesCount } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Fetch messages count
      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      setStats({
        totalProperties: total,
        pendingProperties: pending,
        rejectedProperties: rejected,
        totalViews: 0, // Would need a views table
        totalFavorites: favoritesCount || 0,
        totalMessages: messagesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "خطأ", description: "تعذر حذف الإعلان", variant: "destructive" });
    } else {
      toast({ title: "تم الحذف", description: "تم حذف الإعلان بنجاح" });
      fetchData();
    }
  };

  const togglePropertyStatus = async (id: string, currentStatus: string | null) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    
    const { error } = await supabase
      .from("properties")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "خطأ", description: "تعذر تغيير الحالة", variant: "destructive" });
    } else {
      toast({ title: "تم التحديث", description: `تم ${newStatus === "active" ? "تفعيل" : "إيقاف"} الإعلان` });
      fetchData();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(price);
  };

  const getStatusBadge = (property: Property) => {
    if (property.status === "rejected") {
      return <Badge variant="destructive">مرفوض</Badge>;
    }
    if (!property.is_approved || property.status === "pending") {
      return <Badge variant="secondary">قيد المراجعة</Badge>;
    }
    if (property.status === "inactive") {
      return <Badge variant="outline">متوقف</Badge>;
    }
    return <Badge className="bg-green-500">نشط</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const menuItems = [
    { id: "overview", label: "الرئيسية", icon: TrendingUp },
    { id: "properties", label: "إعلاناتي", icon: Building2 },
    { id: "map", label: "خريطة إعلاناتي", icon: MapPin },
    { id: "favorites", label: "المفضلة", icon: Heart },
    { id: "messages", label: "الرسائل", icon: MessageSquare },
  ];

  return (
    <DashboardLayout
      title="لوحة التحكم"
      subtitle="إدارة إعلاناتك العقارية"
      menuItems={menuItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Building2 className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{stats.totalProperties}</p>
                <p className="text-sm text-muted-foreground">إجمالي الإعلانات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">{stats.pendingProperties}</p>
                <p className="text-sm text-muted-foreground">قيد المراجعة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <XCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                <p className="text-2xl font-bold">{stats.rejectedProperties}</p>
                <p className="text-sm text-muted-foreground">مرفوضة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{stats.totalViews}</p>
                <p className="text-sm text-muted-foreground">المشاهدات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 mx-auto text-pink-500 mb-2" />
                <p className="text-2xl font-bold">{stats.totalFavorites}</p>
                <p className="text-sm text-muted-foreground">المفضلة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
                <p className="text-sm text-muted-foreground">الرسائل</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button asChild>
                <Link to="/add-property">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة إعلان جديد
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/my-properties">
                  <Building2 className="w-4 h-4 ml-2" />
                  إدارة الإعلانات
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/favorites">
                  <Heart className="w-4 h-4 ml-2" />
                  المفضلة
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/messages">
                  <MessageSquare className="w-4 h-4 ml-2" />
                  الرسائل
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Properties */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>أحدث الإعلانات</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/my-properties">عرض الكل</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.slice(0, 5).map((property) => (
                  <div key={property.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {property.images?.[0] ? (
                        <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{property.title}</h4>
                      <p className="text-sm text-muted-foreground">{property.city}</p>
                      <p className="text-sm font-bold text-primary">{formatPrice(property.price)} ر.س</p>
                    </div>
                    {getStatusBadge(property)}
                  </div>
                ))}
                {properties.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">لا توجد إعلانات</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">إعلاناتي</h2>
            <Button asChild>
              <Link to="/add-property">
                <Plus className="w-4 h-4 ml-2" />
                إضافة إعلان
              </Link>
            </Button>
          </div>

          <div className="grid gap-4">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                      {property.images?.[0] ? (
                        <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{property.title}</h3>
                          <p className="text-sm text-muted-foreground">{property.city} - {property.neighborhood}</p>
                          <p className="text-lg font-bold text-primary mt-1">{formatPrice(property.price)} ر.س</p>
                        </div>
                        {getStatusBadge(property)}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/property/${property.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/edit-property/${property.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePropertyStatus(property.id, property.status)}
                        >
                          {property.status === "active" ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {properties.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">لا توجد إعلانات</p>
                  <Button asChild>
                    <Link to="/add-property">
                      <Plus className="w-4 h-4 ml-2" />
                      أضف إعلانك الأول
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                خريطة إعلاناتي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyMapView
                properties={properties.filter(p => p.latitude && p.longitude).map(p => ({
                  id: p.id,
                  title: p.title,
                  price: p.price,
                  latitude: p.latitude!,
                  longitude: p.longitude!,
                  type: "property" as const,
                  listingType: p.listing_type as "sale" | "rent"
                }))}
                onMarkerClick={(id) => navigate(`/property/${id}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">عقاراتك المفضلة</p>
              <Button asChild>
                <Link to="/favorites">عرض المفضلة</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">رسائلك</p>
              <Button asChild>
                <Link to="/messages">عرض الرسائل</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default UserDashboard;
