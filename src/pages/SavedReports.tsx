import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { FileText, Trash2, Calendar, Loader2, ArrowLeft } from "lucide-react";

interface SavedReport {
  id: string;
  report_name: string;
  property_price: number;
  monthly_payment: number;
  dti: number;
  is_eligible: boolean;
  created_at: string;
  tenure: number;
  interest_rate: number;
  salary: number;
}

const SavedReports = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('saved_financing_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('saved_financing_reports')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف التقرير",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم الحذف",
        description: "تم حذف التقرير بنجاح",
      });
      setReports(reports.filter(r => r.id !== id));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(Math.round(price));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="bg-primary/5 border-b border-border">
        <div className="container py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/financing')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للحاسبة
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">تقارير التمويل المحفوظة</h1>
          <p className="text-muted-foreground">
            عرض وإدارة تقارير التمويل التي قمت بحفظها
          </p>
        </div>
      </div>

      <div className="container py-8">
        {reports.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              لا توجد تقارير محفوظة
            </h3>
            <p className="text-muted-foreground mb-4">
              استخدم حاسبة التمويل وقم بحفظ تقريرك للمراجعة لاحقاً
            </p>
            <Button onClick={() => navigate('/financing')}>
              حاسبة التمويل
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map(report => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{report.report_name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 ml-1" />
                      {formatDate(report.created_at)}
                    </div>
                  </div>
                  <Badge variant={report.is_eligible ? "default" : "destructive"}>
                    {report.is_eligible ? "مؤهل" : "غير مؤهل"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">سعر العقار</span>
                      <span className="font-bold">{formatPrice(report.property_price)} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">القسط الشهري</span>
                      <span className="font-bold text-primary">{formatPrice(report.monthly_payment)} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المدة</span>
                      <span>{report.tenure} سنة</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">معدل الربح</span>
                      <span>{report.interest_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">نسبة الاستقطاع</span>
                      <span className={report.dti > 65 ? "text-destructive" : "text-green-500"}>
                        {report.dti.toFixed(1)}%
                      </span>
                    </div>
                    <div className="pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(report.id)}
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف التقرير
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SavedReports;
