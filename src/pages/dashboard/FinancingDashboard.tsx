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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PropertyMapView from "@/components/dashboard/PropertyMapView";
import LogoUpload from "@/components/LogoUpload";
import LocationPicker from "@/components/LocationPicker";
import ProfileCompletionAlert from "@/components/ProfileCompletionAlert";
import {
  Landmark,
  Plus,
  MessageSquare,
  TrendingUp,
  MapPin,
  Edit,
  Trash2,
  Loader2,
  FileText,
  Users,
  Eye,
  ToggleLeft,
  ToggleRight,
  Save,
  Percent,
  Banknote,
  Calendar
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  features: string[];
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  is_approved: boolean | null;
  is_featured: boolean | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

interface FinancingRequest {
  id: string;
  full_name: string;
  phone: string;
  monthly_income: number;
  property_type: string;
  property_price: number;
  notes: string | null;
  status: string;
  provider_response: string | null;
  created_at: string;
  user_id: string;
  offer_id: string;
}

const FinancingDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<FinancingOffer[]>([]);
  const [requests, setRequests] = useState<FinancingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  
  // New offer form state
  const [newOffer, setNewOffer] = useState({
    company_name: "",
    company_type: "financing_company",
    logo_url: "",
    interest_rate: 5,
    max_tenure: 20,
    max_amount: 3000000,
    min_salary: 5000,
    max_dti: 60,
    features: [""],
    phone: "",
    email: "",
    website: "",
    description: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) {
      fetchOffers();
    }
  }, [user]);

  const fetchOffers = async () => {
    if (!user) return;

    try {
      const [offersRes, requestsRes] = await Promise.all([
        supabase
          .from("financing_offers")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("financing_requests")
          .select("*")
          .eq("provider_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!offersRes.error) setOffers(offersRes.data || []);
      if (!requestsRes.error) setRequests(requestsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffer = async () => {
    if (!user) return;
    if (!newOffer.company_name.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم الشركة", variant: "destructive" });
      return;
    }
    if (!newOffer.latitude || !newOffer.longitude) {
      toast({ title: "خطأ", description: "يرجى تحديد موقع الفرع على الخريطة", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("financing_offers").insert({
      user_id: user.id,
      company_name: newOffer.company_name,
      company_type: newOffer.company_type,
      logo_url: newOffer.logo_url || null,
      interest_rate: newOffer.interest_rate,
      max_tenure: newOffer.max_tenure,
      max_amount: newOffer.max_amount,
      min_salary: newOffer.min_salary,
      max_dti: newOffer.max_dti,
      features: newOffer.features.filter(f => f.trim()),
      phone: newOffer.phone || null,
      email: newOffer.email || null,
      website: newOffer.website || null,
      description: newOffer.description || null,
      latitude: newOffer.latitude,
      longitude: newOffer.longitude,
      is_approved: false, // Needs admin approval
    });
    setSaving(false);

    if (error) {
      toast({ title: "خطأ", description: "تعذر إضافة العرض", variant: "destructive" });
    } else {
      toast({ title: "تم الإضافة", description: "تم إضافة العرض وسيتم مراجعته من الإدارة" });
      setShowAddForm(false);
      setNewOffer({
        company_name: "",
        company_type: "financing_company",
        logo_url: "",
        interest_rate: 5,
        max_tenure: 20,
        max_amount: 3000000,
        min_salary: 5000,
        max_dti: 60,
        features: [""],
        phone: "",
        email: "",
        website: "",
        description: "",
        latitude: null,
        longitude: null,
      });
      fetchOffers();
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;

    const { error } = await supabase
      .from("financing_offers")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "خطأ", description: "تعذر حذف العرض", variant: "destructive" });
    } else {
      toast({ title: "تم الحذف", description: "تم حذف العرض بنجاح" });
      fetchOffers();
    }
  };

  const handleRequestAction = async (requestId: string, status: string, response?: string) => {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (response) updateData.provider_response = response;
    
    const { error } = await supabase
      .from("financing_requests")
      .update(updateData)
      .eq("id", requestId);

    if (error) {
      toast({ title: "خطأ", description: "تعذر تحديث الطلب", variant: "destructive" });
    } else {
      toast({ title: "تم التحديث", description: "تم تحديث حالة الطلب" });
      setRespondingTo(null);
      setResponseText('');
      fetchOffers();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(price);
  };

  const getStatusBadge = (offer: FinancingOffer) => {
    if (offer.is_featured) {
      return <Badge className="bg-yellow-500">مميز</Badge>;
    }
    if (offer.is_approved) {
      return <Badge className="bg-green-500">نشط</Badge>;
    }
    return <Badge variant="secondary">قيد المراجعة</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalOffers = offers.length;
  const activeOffers = offers.filter(o => o.is_approved).length;
  const pendingOffers = offers.filter(o => !o.is_approved).length;

  const menuItems = [
    { id: "overview", label: "الرئيسية", icon: TrendingUp },
    { id: "offers", label: "عروضي التمويلية", icon: FileText },
    { id: "requests", label: "طلبات التمويل", icon: Users },
    { id: "clients", label: "تصنيف العملاء", icon: Users },
    { id: "map", label: "خريطة العملاء", icon: MapPin },
    { id: "messages", label: "الرسائل", icon: MessageSquare },
  ];

  return (
    <DashboardLayout
      title="لوحة تحكم جهة التمويل"
      subtitle="إدارة عروض التمويل العقاري"
      menuItems={menuItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="overview" className="space-y-6">
          {(() => {
            const missing: string[] = [];
            if (offers.length === 0) missing.push('عرض تمويلي واحد على الأقل');
            return <ProfileCompletionAlert missingFields={missing} onGoToProfile={() => { setActiveTab("offers"); setShowAddForm(true); }} accountTypeLabel="جهة التمويل" />;
          })()}
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Landmark className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{totalOffers}</p>
                <p className="text-sm text-muted-foreground">إجمالي العروض</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold">{activeOffers}</p>
                <p className="text-sm text-muted-foreground">عروض نشطة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">{pendingOffers}</p>
                <p className="text-sm text-muted-foreground">قيد المراجعة</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{requests.length}</p>
                <p className="text-sm text-muted-foreground">طلبات التمويل</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button onClick={() => { setActiveTab("offers"); setShowAddForm(true); }}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة عرض تمويل
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("requests")}>
                <Users className="w-4 h-4 ml-2" />
                عرض الطلبات
              </Button>
            </CardContent>
          </Card>

          {/* Recent Offers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>أحدث العروض</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("offers")}>
                عرض الكل
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offers.slice(0, 5).map((offer) => (
                  <div key={offer.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center">
                      {offer.logo_url ? (
                        <img src={offer.logo_url} alt={offer.company_name} className="w-full h-full object-cover" />
                      ) : (
                        <Landmark className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{offer.company_name}</h4>
                      <p className="text-sm text-muted-foreground">معدل الربح: {offer.interest_rate}%</p>
                    </div>
                    {getStatusBadge(offer)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">عروضي التمويلية</h2>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-4 h-4 ml-2" />
              {showAddForm ? "إلغاء" : "إضافة عرض"}
            </Button>
          </div>

          {/* Add Offer Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>إضافة عرض تمويل جديد</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <LogoUpload
                    currentUrl={newOffer.logo_url}
                    onUpload={(url) => setNewOffer({ ...newOffer, logo_url: url })}
                    onRemove={() => setNewOffer({ ...newOffer, logo_url: "" })}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اسم الجهة التمويلية *</Label>
                    <Input
                      value={newOffer.company_name}
                      onChange={(e) => setNewOffer({ ...newOffer, company_name: e.target.value })}
                      placeholder="اسم البنك أو شركة التمويل"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع الجهة</Label>
                    <Select value={newOffer.company_type} onValueChange={(v) => setNewOffer({ ...newOffer, company_type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank">بنك</SelectItem>
                        <SelectItem value="financing_company">شركة تمويل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>معدل الربح السنوي (%)</Label>
                    <Input
                      type="number"
                      value={newOffer.interest_rate}
                      onChange={(e) => setNewOffer({ ...newOffer, interest_rate: parseFloat(e.target.value) || 0 })}
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>أقصى مدة تمويل (سنة)</Label>
                    <Input
                      type="number"
                      value={newOffer.max_tenure}
                      onChange={(e) => setNewOffer({ ...newOffer, max_tenure: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الحد الأقصى للتمويل (ر.س)</Label>
                    <Input
                      type="number"
                      value={newOffer.max_amount}
                      onChange={(e) => setNewOffer({ ...newOffer, max_amount: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الحد الأدنى للراتب (ر.س)</Label>
                    <Input
                      type="number"
                      value={newOffer.min_salary}
                      onChange={(e) => setNewOffer({ ...newOffer, min_salary: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الهاتف</Label>
                    <Input
                      value={newOffer.phone}
                      onChange={(e) => setNewOffer({ ...newOffer, phone: e.target.value })}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input
                      value={newOffer.email}
                      onChange={(e) => setNewOffer({ ...newOffer, email: e.target.value })}
                      placeholder="email@example.com"
                      dir="ltr"
                      className="text-right"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>الموقع الإلكتروني</Label>
                    <Input
                      value={newOffer.website}
                      onChange={(e) => setNewOffer({ ...newOffer, website: e.target.value })}
                      placeholder="https://..."
                      dir="ltr"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>وصف العرض</Label>
                    <Textarea
                      value={newOffer.description}
                      onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                      placeholder="وصف تفصيلي للعرض التمويلي..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Location Picker */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    موقع الفرع على الخريطة (إلزامي) *
                  </Label>
                  <LocationPicker
                    latitude={newOffer.latitude || undefined}
                    longitude={newOffer.longitude || undefined}
                    onLocationChange={(lat, lng) => setNewOffer({ ...newOffer, latitude: lat, longitude: lng })}
                    autoDetectLocation={false}
                  />
                </div>

                <Button onClick={handleAddOffer} disabled={saving} className="w-full">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      إضافة العرض
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Offers List */}
          <div className="grid gap-4">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center">
                      {offer.logo_url ? (
                        <img src={offer.logo_url} alt={offer.company_name} className="w-full h-full object-cover" />
                      ) : (
                        <Landmark className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{offer.company_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Percent className="w-4 h-4" />
                              {offer.interest_rate}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Banknote className="w-4 h-4" />
                              {formatPrice(offer.max_amount)} ر.س
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {offer.max_tenure} سنة
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(offer)}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/financing/${offer.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/admin/financing-offers/${offer.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteOffer(offer.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {offers.length === 0 && !showAddForm && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Landmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">لا توجد عروض تمويلية</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    أضف عرضك الأول
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <h2 className="text-xl font-bold">طلبات التمويل الواردة</h2>
          <div className="grid gap-4">
            {requests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{req.full_name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        📱 {req.phone} | 💰 الدخل: {formatPrice(req.monthly_income)} ر.س
                      </p>
                      <p className="text-sm mt-1">
                        🏠 {req.property_type} | سعر العقار: {formatPrice(req.property_price)} ر.س
                      </p>
                      {req.notes && (
                        <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                          📝 {req.notes}
                        </p>
                      )}
                      {req.provider_response && (
                        <p className="text-sm mt-2 bg-primary/10 p-2 rounded">
                          ✅ ردك: {req.provider_response}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(req.created_at).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                    <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {req.status === 'approved' ? 'مقبول' : req.status === 'rejected' ? 'مرفوض' : 'جديد'}
                    </Badge>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button size="sm" onClick={() => handleRequestAction(req.id, 'approved')}>
                        ✅ قبول
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRequestAction(req.id, 'rejected')}>
                        ❌ رفض
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRespondingTo(respondingTo === req.id ? null : req.id)}>
                        💬 إرسال رد
                      </Button>
                    </div>
                  )}
                  {respondingTo === req.id && (
                    <div className="mt-3 flex gap-2">
                      <Input
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="اكتب ردك هنا..."
                        className="flex-1"
                      />
                      <Button size="sm" onClick={() => handleRequestAction(req.id, req.status, responseText)}>
                        إرسال
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد طلبات تمويل واردة حالياً</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">تصنيف العملاء قريباً</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: '#ef4444' }} />
                خريطة فروع التمويل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                فروع البنوك وشركات التمويل تظهر بأيقونات حمراء على الخريطة
              </p>
              <PropertyMapView
                properties={offers.filter(o => o.latitude && o.longitude).map(o => ({
                  id: o.id,
                  title: o.company_name,
                  latitude: o.latitude!,
                  longitude: o.longitude!,
                  type: "financing" as const
                }))}
                onMarkerClick={(id) => navigate(`/financing/${id}`)}
              />
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

export default FinancingDashboard;
