import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LocationPicker from "@/components/LocationPicker";
import ImageUploadWithCamera from "@/components/ImageUploadWithCamera";
import {
  HardHat, Plus, TrendingUp, MapPin, Loader2, FileText, Users,
  MessageSquare, Eye, Save, Building2, Percent, Calendar
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DeveloperProject {
  id: string;
  title: string;
  description: string | null;
  project_type: string;
  status: string;
  completion_percentage: number;
  total_units: number | null;
  available_units: number | null;
  price_from: number | null;
  price_to: number | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  address: string | null;
  images: string[];
  created_at: string;
}

const projectTypes = [
  { value: 'residential', label: 'سكني' },
  { value: 'commercial', label: 'تجاري' },
  { value: 'mixed', label: 'متعدد الاستخدامات' },
  { value: 'industrial', label: 'صناعي' },
];

const projectStatuses = [
  { value: 'planning', label: 'قيد التخطيط' },
  { value: 'under_construction', label: 'قيد الإنشاء' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'selling', label: 'جاري البيع' },
];

const DeveloperDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DeveloperProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newProject, setNewProject] = useState({
    title: "", description: "", project_type: "residential", status: "planning",
    completion_percentage: 0, total_units: 0, available_units: 0,
    price_from: 0, price_to: 0, city: "", address: "",
    latitude: null as number | null, longitude: null as number | null,
    images: [] as string[],
    vision_quality: "", vision_sustainability: "", vision_innovation: "", vision_experience: "",
  });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("developer_projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setProjects((data as DeveloperProject[]) || []);
    setLoading(false);
  };

  const handleAddProject = async () => {
    if (!user) return;
    if (!newProject.title.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم المشروع", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("developer_projects").insert({
      user_id: user.id,
      title: newProject.title,
      description: newProject.description || null,
      project_type: newProject.project_type,
      status: newProject.status,
      completion_percentage: newProject.completion_percentage,
      total_units: newProject.total_units || null,
      available_units: newProject.available_units || null,
      price_from: newProject.price_from || null,
      price_to: newProject.price_to || null,
      city: newProject.city || null,
      address: newProject.address || null,
      latitude: newProject.latitude,
      longitude: newProject.longitude,
      images: newProject.images,
      vision_quality: newProject.vision_quality || null,
      vision_sustainability: newProject.vision_sustainability || null,
      vision_innovation: newProject.vision_innovation || null,
      vision_experience: newProject.vision_experience || null,
    } as any);
    setSaving(false);
    if (error) {
      toast({ title: "خطأ", description: "تعذر إضافة المشروع", variant: "destructive" });
    } else {
      toast({ title: "تم الإضافة", description: "تم إضافة المشروع بنجاح" });
      setShowAddForm(false);
      fetchProjects();
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;
    const { error } = await supabase.from("developer_projects").delete().eq("id", id);
    if (!error) { toast({ title: "تم الحذف" }); fetchProjects(); }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat("ar-SA").format(price);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const menuItems = [
    { id: "overview", label: "الرئيسية", icon: TrendingUp },
    { id: "projects", label: "مشاريعي", icon: Building2 },
    { id: "location", label: "الموقع الجغرافي", icon: MapPin },
    { id: "messages", label: "الرسائل", icon: MessageSquare },
  ];

  return (
    <DashboardLayout title="لوحة تحكم المطوّر العقاري" subtitle="إدارة مشاريع التطوير العقاري" menuItems={menuItems} activeTab={activeTab} onTabChange={setActiveTab}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center"><HardHat className="w-8 h-8 mx-auto text-primary mb-2" /><p className="text-2xl font-bold">{projects.length}</p><p className="text-sm text-muted-foreground">إجمالي المشاريع</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Building2 className="w-8 h-8 mx-auto text-blue-500 mb-2" /><p className="text-2xl font-bold">{projects.filter(p => p.status === 'under_construction').length}</p><p className="text-sm text-muted-foreground">قيد الإنشاء</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Eye className="w-8 h-8 mx-auto text-green-500 mb-2" /><p className="text-2xl font-bold">{projects.filter(p => p.status === 'completed' || p.status === 'selling').length}</p><p className="text-sm text-muted-foreground">مشاريع مكتملة</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><Users className="w-8 h-8 mx-auto text-yellow-500 mb-2" /><p className="text-2xl font-bold">{projects.reduce((acc, p) => acc + (p.available_units || 0), 0)}</p><p className="text-sm text-muted-foreground">وحدات متاحة</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>إجراءات سريعة</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button onClick={() => { setActiveTab("projects"); setShowAddForm(true); }}><Plus className="w-4 h-4 ml-2" />إضافة مشروع جديد</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">مشاريعي</h2>
            <Button onClick={() => setShowAddForm(!showAddForm)}><Plus className="w-4 h-4 ml-2" />{showAddForm ? "إلغاء" : "إضافة مشروع"}</Button>
          </div>

          {showAddForm && (
            <Card>
              <CardHeader><CardTitle>إضافة مشروع تطوير جديد</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>اسم المشروع *</Label><Input value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} placeholder="اسم المشروع" /></div>
                  <div className="space-y-2"><Label>نوع المشروع</Label>
                    <Select value={newProject.project_type} onValueChange={(v) => setNewProject({ ...newProject, project_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{projectTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>حالة المشروع</Label>
                    <Select value={newProject.status} onValueChange={(v) => setNewProject({ ...newProject, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{projectStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>المدينة</Label><Input value={newProject.city} onChange={(e) => setNewProject({ ...newProject, city: e.target.value })} placeholder="المدينة" /></div>
                  <div className="space-y-2"><Label>نسبة الإنجاز (%)</Label>
                    <div className="flex items-center gap-4">
                      <Slider value={[newProject.completion_percentage]} onValueChange={([v]) => setNewProject({ ...newProject, completion_percentage: v })} min={0} max={100} step={5} className="flex-1" />
                      <span className="font-bold text-primary">{newProject.completion_percentage}%</span>
                    </div>
                  </div>
                  <div className="space-y-2"><Label>إجمالي الوحدات</Label><Input type="number" value={newProject.total_units} onChange={(e) => setNewProject({ ...newProject, total_units: parseInt(e.target.value) || 0 })} /></div>
                  <div className="space-y-2"><Label>الوحدات المتاحة</Label><Input type="number" value={newProject.available_units} onChange={(e) => setNewProject({ ...newProject, available_units: parseInt(e.target.value) || 0 })} /></div>
                  <div className="space-y-2"><Label>السعر من (ر.س)</Label><Input type="number" value={newProject.price_from} onChange={(e) => setNewProject({ ...newProject, price_from: parseInt(e.target.value) || 0 })} /></div>
                  <div className="space-y-2"><Label>السعر إلى (ر.س)</Label><Input type="number" value={newProject.price_to} onChange={(e) => setNewProject({ ...newProject, price_to: parseInt(e.target.value) || 0 })} /></div>
                  <div className="md:col-span-2 space-y-2"><Label>وصف المشروع</Label><Textarea value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} rows={3} /></div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">رؤية التطوير</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>الجودة</Label><Textarea value={newProject.vision_quality} onChange={(e) => setNewProject({ ...newProject, vision_quality: e.target.value })} rows={2} placeholder="معايير الجودة المتبعة..." /></div>
                    <div className="space-y-2"><Label>الاستدامة</Label><Textarea value={newProject.vision_sustainability} onChange={(e) => setNewProject({ ...newProject, vision_sustainability: e.target.value })} rows={2} placeholder="ممارسات الاستدامة..." /></div>
                    <div className="space-y-2"><Label>الابتكار</Label><Textarea value={newProject.vision_innovation} onChange={(e) => setNewProject({ ...newProject, vision_innovation: e.target.value })} rows={2} placeholder="الحلول المبتكرة..." /></div>
                    <div className="space-y-2"><Label>تجربة الساكن</Label><Textarea value={newProject.vision_experience} onChange={(e) => setNewProject({ ...newProject, vision_experience: e.target.value })} rows={2} placeholder="تجربة السكن المتميزة..." /></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>صور المشروع</Label>
                  {user && <ImageUploadWithCamera userId={user.id} onImagesChange={(imgs) => setNewProject({ ...newProject, images: imgs })} maxImages={10} />}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" />موقع المشروع على الخريطة</Label>
                  <LocationPicker latitude={newProject.latitude || undefined} longitude={newProject.longitude || undefined} onLocationChange={(lat, lng) => setNewProject({ ...newProject, latitude: lat, longitude: lng })} />
                </div>

                <Button onClick={handleAddProject} disabled={saving} className="w-full">
                  {saving ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جاري الإضافة...</> : <><Save className="w-4 h-4 ml-2" />إضافة المشروع</>}
                </Button>
              </CardContent>
            </Card>
          )}

          {projects.map(project => (
            <Card key={project.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.city} {project.address ? `- ${project.address}` : ''}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="outline">{projectTypes.find(t => t.value === project.project_type)?.label}</Badge>
                      <Badge className={project.status === 'completed' ? 'bg-green-500' : project.status === 'under_construction' ? 'bg-blue-500' : 'bg-yellow-500'}>
                        {projectStatuses.find(s => s.value === project.status)?.label}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">الإنجاز:</span>
                      <div className="flex-1 bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{ width: `${project.completion_percentage}%` }} /></div>
                      <span className="text-sm font-bold">{project.completion_percentage}%</span>
                    </div>
                    {project.price_from && project.price_to && (
                      <p className="text-primary font-bold mt-2">{formatPrice(project.price_from)} - {formatPrice(project.price_to)} ر.س</p>
                    )}
                  </div>
                  {project.images?.[0] && <img src={project.images[0]} alt={project.title} className="w-24 h-24 rounded-lg object-cover" />}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => user && navigate(`/developer/${user.id}`)}><Eye className="w-4 h-4 ml-1" />عرض</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(project.id)}>حذف</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {projects.length === 0 && !showAddForm && (
            <Card><CardContent className="py-12 text-center"><HardHat className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">لا توجد مشاريع بعد</p></CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" />الموقع الجغرافي</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">يمكنك تحديد الموقع الرئيسي لمقر شركة التطوير</p>
              <LocationPicker latitude={undefined} longitude={undefined} onLocationChange={() => {}} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card><CardContent className="py-12 text-center"><MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">لا توجد رسائل</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
