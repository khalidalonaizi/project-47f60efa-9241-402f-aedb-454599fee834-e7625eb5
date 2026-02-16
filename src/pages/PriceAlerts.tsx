import { useState, useEffect } from "react";
import { saudiCityNamesAr, propertyTypesSelectAr } from '@/lib/propertyTypes';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bell, Plus, Trash2, MapPin, Building, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface PriceAlert {
  id: string;
  user_id: string;
  city: string;
  max_price: number;
  property_type: string | null;
  is_active: boolean;
  created_at: string;
}

const cities = saudiCityNamesAr;

const localPropertyTypes = propertyTypesSelectAr;

const PriceAlerts = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    city: "",
    max_price: "",
    property_type: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["price-alerts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PriceAlert[];
    },
    enabled: !!user,
  });

  const createAlertMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("يجب تسجيل الدخول");

      const { error } = await supabase.from("price_alerts").insert({
        user_id: user.id,
        city: newAlert.city,
        max_price: parseFloat(newAlert.max_price),
        property_type: newAlert.property_type || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
      setNewAlert({ city: "", max_price: "", property_type: "" });
      setDialogOpen(false);
      toast.success("تم إنشاء التنبيه بنجاح");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء إنشاء التنبيه");
    },
  });

  const toggleAlertMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("price_alerts")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("price_alerts").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["price-alerts"] });
      toast.success("تم حذف التنبيه");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حذف التنبيه");
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeLabel = (type: string | null) => {
    if (!type) return "جميع الأنواع";
    return localPropertyTypes.find((t) => t.value === type)?.label || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">تنبيهات الأسعار</h1>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة تنبيه
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>إنشاء تنبيه سعر جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">المدينة *</label>
                  <Select
                    value={newAlert.city || undefined}
                    onValueChange={(value) =>
                      setNewAlert((prev) => ({ ...prev, city: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الحد الأقصى للسعر *</label>
                  <Input
                    type="number"
                    value={newAlert.max_price}
                    onChange={(e) =>
                      setNewAlert((prev) => ({ ...prev, max_price: e.target.value }))
                    }
                    placeholder="مثال: 500000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">نوع العقار (اختياري)</label>
                  <Select
                    value={newAlert.property_type || undefined}
                    onValueChange={(value) =>
                      setNewAlert((prev) => ({ ...prev, property_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الأنواع" />
                    </SelectTrigger>
                    <SelectContent>
                      {localPropertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button
                    onClick={() => createAlertMutation.mutate()}
                    disabled={
                      !newAlert.city ||
                      !newAlert.max_price ||
                      createAlertMutation.isPending
                    }
                  >
                    {createAlertMutation.isPending ? "جاري الحفظ..." : "حفظ التنبيه"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-muted-foreground mb-8">
          سيتم إعلامك عند توفر عقارات بأسعار أقل من الحد المحدد في المدن المختارة
        </p>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">لا توجد تنبيهات بعد</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              إنشاء أول تنبيه
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`${!alert.is_active ? "opacity-60" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      {alert.city}
                    </CardTitle>
                    <Switch
                      checked={alert.is_active}
                      onCheckedChange={(checked) =>
                        toggleAlertMutation.mutate({
                          id: alert.id,
                          isActive: checked,
                        })
                      }
                    />
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {getPropertyTypeLabel(alert.property_type)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                      <DollarSign className="w-5 h-5" />
                      {formatPrice(alert.max_price)}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlertMutation.mutate(alert.id)}
                      disabled={deleteAlertMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PriceAlerts;
