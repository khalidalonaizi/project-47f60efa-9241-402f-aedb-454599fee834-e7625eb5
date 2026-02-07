import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PropertyMapView from "@/components/dashboard/PropertyMapView";
import LogoUpload from "@/components/LogoUpload";
import LocationPicker from "@/components/LocationPicker";
import {
  Building2,
  Eye,
  Clock,
  Plus,
  MessageSquare,
  TrendingUp,
  MapPin,
  Edit,
  Loader2,
  FileText,
  Users,
  BarChart3,
  Save,
  CheckCircle,
  XCircle
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

interface OfficeProfile {
  company_name: string | null;
  company_logo: string | null;
  company_description: string | null;
  company_address: string | null;
  phone: string | null;
  license_number: string | null;
  commercial_registration: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface PropertyManagementRequest {
  id: string;
  requester_name: string;
  requester_phone: string;
  property_type: string;
  property_address: string;
  property_latitude: number | null;
  property_longitude: number | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const OfficeDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [requests, setRequests] = useState<PropertyManagementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  
  // Office Profile State
  const [officeProfile, setOfficeProfile] = useState<OfficeProfile>({
    company_name: "",
    company_logo: "",
    company_description: "",
    company_address: "",
    phone: "",
    license_number: "",
    commercial_registration: "",
    latitude: null,
    longitude: null,
  });

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
      const { data: propertiesData } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setProperties(propertiesData || []);

      // Fetch property management requests
      const { data: requestsData } = await supabase
        .from("property_management_requests")
        .select("*")
        .eq("office_id", user.id)
        .order("created_at", { ascending: false });

      setRequests(requestsData || []);

      // Fetch office profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("company_name, company_logo, company_description, company_address, phone, license_number, commercial_registration, latitude, longitude")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setOfficeProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: officeProfile.company_name,
        company_logo: officeProfile.company_logo,
        company_description: officeProfile.company_description,
        company_address: officeProfile.company_address,
        phone: officeProfile.phone,
        license_number: officeProfile.license_number,
        commercial_registration: officeProfile.commercial_registration,
        latitude: officeProfile.latitude,
        longitude: officeProfile.longitude,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast({ title: "خطأ", description: "تعذر حفظ البيانات", variant: "destructive" });
    } else {
      toast({ title: "تم الحفظ", description: "تم حفظ بيانات المكتب بنجاح" });
    }
  };

  const handleRequestStatus = async (requestId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from("property_management_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (error) {
      toast({ title: "خطأ", description: "تعذر تحديث حالة الطلب", variant: "destructive" });
    } else {
      // Send notification to user
      const request = requests.find(r => r.id === requestId);
      if (request) {
        const { data: requestData } = await supabase
          .from("property_management_requests")
          .select("user_id")
          .eq("id", requestId)
          .single();
        
        if (requestData) {
          await supabase.from("notifications").insert({
            user_id: requestData.user_id,
            type: "property_management",
            title: status === 'accepted' ? "تم قبول طلبك" : "تم رفض طلبك",
            message: `${status === 'accepted' ? 'تم قبول' : 'تم رفض'} طلب إدارة الأملاك الخاص بك من ${officeProfile.company_name || 'المكتب العقاري'}`,
          });
        }
      }

      toast({ 
        title: status === 'accepted' ? "تم القبول" : "تم الرفض", 
        description: `تم ${status === 'accepted' ? 'قبول' : 'رفض'} الطلب وإشعار العميل`
      });
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

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500">مقبول</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">قيد المراجعة</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === "active" || p.is_approved).length;
  const pendingProperties = properties.filter(p => p.status === "pending" || !p.is_approved).length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  const menuItems = [
    { id: "overview", label: "الرئيسية", icon: TrendingUp },
    { id: "office-info", label: "بيانات المكتب", icon: Building2 },
    { id: "location", label: "موقع المكتب", icon: MapPin },
    { id: "properties", label: "إعلانات المكتب", icon: FileText },
    { id: "map", label: "خريطة الإعلانات", icon: MapPin },
    { id: "requests", label: "طلبات إدارة الأملاك", icon: Users },
    { id: "reports", label: "التقارير", icon: BarChart3 },
    { id: "messages", label: "الرسائل", icon: MessageSquare },
  ];

  return (
    <DashboardLayout
      title="لوحة تحكم المكتب العقاري"
      subtitle="إدارة إعلانات وعمليات المكتب"
      menuItems={menuItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Building2 className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{totalProperties}</p>
                <p className="text-sm text-muted-foreground">إجمالي الإعلانات</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold">{activeProperties}</p>
                <p className="text-sm text-muted-foreground">إعلانات نشطة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">{pendingProperties}</p>
                <p className="text-sm text-muted-foreground">قيد المراجعة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{pendingRequests}</p>
                <p className="text-sm text-muted-foreground">طلبات جديدة</p>
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
              <Button variant="outline" onClick={() => setActiveTab("office-info")}>
                <Edit className="w-4 h-4 ml-2" />
                تعديل بيانات المكتب
              </Button>
              {pendingRequests > 0 && (
                <Button variant="secondary" onClick={() => setActiveTab("requests")}>
                  <Users className="w-4 h-4 ml-2" />
                  عرض الطلبات الجديدة ({pendingRequests})
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Properties */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>أحدث الإعلانات</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("properties")}>
                عرض الكل
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="office-info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>بيانات المكتب العقاري</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="flex flex-col items-center gap-4">
                <LogoUpload
                  currentUrl={officeProfile.company_logo || ""}
                  onUpload={(url) => setOfficeProfile({ ...officeProfile, company_logo: url })}
                  onRemove={() => setOfficeProfile({ ...officeProfile, company_logo: "" })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم المكتب</Label>
                  <Input
                    value={officeProfile.company_name || ""}
                    onChange={(e) => setOfficeProfile({ ...officeProfile, company_name: e.target.value })}
                    placeholder="اسم المكتب العقاري"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الترخيص</Label>
                  <Input
                    value={officeProfile.license_number || ""}
                    onChange={(e) => setOfficeProfile({ ...officeProfile, license_number: e.target.value })}
                    placeholder="رقم ترخيص الهيئة العامة للعقار"
                  />
                </div>
                <div className="space-y-2">
                  <Label>السجل التجاري</Label>
                  <Input
                    value={officeProfile.commercial_registration || ""}
                    onChange={(e) => setOfficeProfile({ ...officeProfile, commercial_registration: e.target.value })}
                    placeholder="رقم السجل التجاري"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={officeProfile.phone || ""}
                    onChange={(e) => setOfficeProfile({ ...officeProfile, phone: e.target.value })}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                    className="text-right"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>العنوان</Label>
                  <Input
                    value={officeProfile.company_address || ""}
                    onChange={(e) => setOfficeProfile({ ...officeProfile, company_address: e.target.value })}
                    placeholder="عنوان المكتب"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>وصف المكتب</Label>
                  <Textarea
                    value={officeProfile.company_description || ""}
                    onChange={(e) => setOfficeProfile({ ...officeProfile, company_description: e.target.value })}
                    placeholder="نبذة عن المكتب وخدماته..."
                    rows={4}
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ البيانات
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                موقع المكتب الجغرافي
              </CardTitle>
              <CardDescription>
                حدد موقع المكتب على الخريطة ليظهر للعملاء عند البحث عن مكاتب عقارية قريبة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <LocationPicker
                latitude={officeProfile.latitude ? Number(officeProfile.latitude) : undefined}
                longitude={officeProfile.longitude ? Number(officeProfile.longitude) : undefined}
                onLocationChange={(lat, lng) => {
                  setOfficeProfile({ ...officeProfile, latitude: lat, longitude: lng });
                }}
                autoDetectLocation={!officeProfile.latitude}
              />

              <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ الموقع
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">إعلانات المكتب</h2>
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
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                خريطة إعلانات المكتب
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
                  type: p.listing_type === 'rent' ? 'property_rent' : 'property',
                  listingType: p.listing_type as 'sale' | 'rent'
                }))}
                onMarkerClick={(id) => navigate(`/property/${id}`)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                طلبات إدارة الأملاك
              </CardTitle>
              <CardDescription>
                طلبات العملاء لإدارة عقاراتهم من قبل المكتب
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد طلبات حالياً</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map(request => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{request.requester_name}</h4>
                              {getRequestStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {request.property_type} - {request.property_address}
                            </p>
                            <p className="text-sm text-muted-foreground" dir="ltr">
                              {request.requester_phone}
                            </p>
                            {request.notes && (
                              <p className="text-sm text-muted-foreground mt-2">
                                ملاحظات: {request.notes}
                              </p>
                            )}
                          </div>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleRequestStatus(request.id, 'accepted')}
                              >
                                <CheckCircle className="w-4 h-4 ml-1" />
                                قبول
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRequestStatus(request.id, 'rejected')}
                              >
                                <XCircle className="w-4 h-4 ml-1" />
                                رفض
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">قريباً - تقارير وإحصائيات المكتب</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <Button asChild>
                <Link to="/messages">
                  عرض الرسائل
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default OfficeDashboard;
