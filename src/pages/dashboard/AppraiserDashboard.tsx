import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PropertyMapView from "@/components/dashboard/PropertyMapView";
import {
  ClipboardCheck,
  MessageSquare,
  TrendingUp,
  MapPin,
  Loader2,
  FileText,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Save,
  Upload
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AppraisalRequest {
  id: string;
  property_address: string;
  property_type: string;
  city: string;
  neighborhood: string | null;
  status: string | null;
  estimated_value: number | null;
  visit_date: string | null;
  visit_notes: string | null;
  report_url: string | null;
  images: string[] | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  user_id: string;
}

interface AppraiserProfile {
  full_name: string | null;
  license_number: string | null;
  years_of_experience: number | null;
  phone: string | null;
  avatar_url: string | null;
}

const AppraiserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AppraisalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState<AppraiserProfile>({
    full_name: "",
    license_number: "",
    years_of_experience: 0,
    phone: "",
    avatar_url: "",
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
      // Fetch appraisal requests assigned to this appraiser
      const { data: requestsData } = await supabase
        .from("appraisal_requests")
        .select("*")
        .eq("appraiser_id", user.id)
        .order("created_at", { ascending: false });

      setRequests(requestsData || []);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, license_number, years_of_experience, phone, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: string) => {
    const { error } = await supabase
      .from("appraisal_requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    if (error) {
      toast({ title: "خطأ", description: "تعذر تحديث الحالة", variant: "destructive" });
    } else {
      toast({ title: "تم التحديث", description: "تم تحديث حالة الطلب بنجاح" });
      fetchData();
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        license_number: profile.license_number,
        years_of_experience: profile.years_of_experience,
        phone: profile.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast({ title: "خطأ", description: "تعذر حفظ البيانات", variant: "destructive" });
    } else {
      toast({ title: "تم الحفظ", description: "تم حفظ بيانات الملف الشخصي بنجاح" });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">مكتمل</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">قيد التنفيذ</Badge>;
      case "scheduled":
        return <Badge className="bg-yellow-500">بانتظار الزيارة</Badge>;
      case "rejected":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="secondary">جديد</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const newRequests = requests.filter(r => !r.status || r.status === "new").length;
  const scheduledRequests = requests.filter(r => r.status === "scheduled").length;
  const completedRequests = requests.filter(r => r.status === "completed").length;
  const totalReports = requests.filter(r => r.report_url).length;

  const menuItems = [
    { id: "overview", label: "الرئيسية", icon: TrendingUp },
    { id: "requests", label: "طلبات التقييم", icon: FileText },
    { id: "visits", label: "زيارات العقارات", icon: Calendar },
    { id: "reports", label: "التقارير", icon: ClipboardCheck },
    { id: "map", label: "خريطة التقييمات", icon: MapPin },
    { id: "profile", label: "الملف الشخصي", icon: Users },
    { id: "messages", label: "الرسائل", icon: MessageSquare },
  ];

  return (
    <DashboardLayout
      title="لوحة تحكم المقيم العقاري"
      subtitle="إدارة طلبات وتقارير التقييم العقاري"
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
                <Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">{newRequests}</p>
                <p className="text-sm text-muted-foreground">طلبات جديدة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{scheduledRequests}</p>
                <p className="text-sm text-muted-foreground">بانتظار الزيارة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold">{completedRequests}</p>
                <p className="text-sm text-muted-foreground">طلبات مكتملة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{totalReports}</p>
                <p className="text-sm text-muted-foreground">تقارير صادرة</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>أحدث الطلبات</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("requests")}>
                عرض الكل
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 shrink-0 flex items-center justify-center">
                      <ClipboardCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{request.property_address}</h4>
                      <p className="text-sm text-muted-foreground">{request.city} - {request.property_type}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">لا توجد طلبات تقييم</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <h2 className="text-xl font-bold">طلبات التقييم</h2>

          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{request.property_address}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.city} - {request.neighborhood} | {request.property_type}
                      </p>
                      {request.visit_date && (
                        <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          موعد الزيارة: {new Date(request.visit_date).toLocaleDateString("ar-SA")}
                        </p>
                      )}
                      {request.estimated_value && (
                        <p className="text-lg font-bold text-primary mt-2">
                          القيمة التقديرية: {new Intl.NumberFormat("ar-SA").format(request.estimated_value)} ر.س
                        </p>
                      )}
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {request.status === "new" && (
                      <>
                        <Button size="sm" onClick={() => handleUpdateRequestStatus(request.id, "scheduled")}>
                          <Calendar className="w-4 h-4 ml-1" />
                          تحديد موعد زيارة
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateRequestStatus(request.id, "rejected")}>
                          <XCircle className="w-4 h-4 ml-1" />
                          رفض
                        </Button>
                      </>
                    )}
                    {request.status === "scheduled" && (
                      <Button size="sm" onClick={() => handleUpdateRequestStatus(request.id, "in_progress")}>
                        <CheckCircle className="w-4 h-4 ml-1" />
                        بدء التقييم
                      </Button>
                    )}
                    {request.status === "in_progress" && (
                      <Button size="sm" onClick={() => handleUpdateRequestStatus(request.id, "completed")}>
                        <Upload className="w-4 h-4 ml-1" />
                        رفع التقرير
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد طلبات تقييم حالياً</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="visits">
          <Card>
            <CardHeader>
              <CardTitle>زيارات العقارات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.filter(r => r.status === "scheduled" || r.status === "in_progress").map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{request.property_address}</h4>
                        <p className="text-sm text-muted-foreground">{request.city}</p>
                        {request.visit_date && (
                          <p className="text-sm text-blue-600 mt-2">
                            موعد الزيارة: {new Date(request.visit_date).toLocaleDateString("ar-SA")}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                ))}
                {requests.filter(r => r.status === "scheduled" || r.status === "in_progress").length === 0 && (
                  <p className="text-center text-muted-foreground py-8">لا توجد زيارات مجدولة</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>التقارير الصادرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.filter(r => r.report_url).map((request) => (
                  <div key={request.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <FileText className="w-10 h-10 text-primary" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{request.property_address}</h4>
                      <p className="text-sm text-muted-foreground">
                        القيمة: {request.estimated_value ? new Intl.NumberFormat("ar-SA").format(request.estimated_value) + " ر.س" : "غير محدد"}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a href={request.report_url!} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 ml-1" />
                        عرض التقرير
                      </a>
                    </Button>
                  </div>
                ))}
                {requests.filter(r => r.report_url).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">لا توجد تقارير صادرة</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                خريطة العقارات المُقيَّمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyMapView
                properties={requests.filter(r => r.latitude && r.longitude).map(r => ({
                  id: r.id,
                  title: r.property_address,
                  price: r.estimated_value || undefined,
                  latitude: r.latitude!,
                  longitude: r.longitude!,
                  type: "appraisal"
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الملف الشخصي للمقيم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الاسم الكامل</Label>
                  <Input
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="الاسم الكامل"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم ترخيص المقيم</Label>
                  <Input
                    value={profile.license_number || ""}
                    onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
                    placeholder="رقم الترخيص من الهيئة السعودية للمقيمين المعتمدين"
                  />
                </div>
                <div className="space-y-2">
                  <Label>سنوات الخبرة</Label>
                  <Input
                    type="number"
                    value={profile.years_of_experience || ""}
                    onChange={(e) => setProfile({ ...profile, years_of_experience: parseInt(e.target.value) || 0 })}
                    placeholder="عدد سنوات الخبرة"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                    className="text-right"
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

export default AppraiserDashboard;
