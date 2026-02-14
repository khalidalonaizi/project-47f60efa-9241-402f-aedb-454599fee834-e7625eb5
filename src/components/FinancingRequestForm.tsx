import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Send, FileText } from 'lucide-react';

interface FinancingRequestFormProps {
  offerId: string;
  providerId: string;
  companyName: string;
}

const propertyTypes = [
  { value: 'apartment', label: 'شقة' },
  { value: 'villa', label: 'فيلا' },
  { value: 'land', label: 'أرض' },
  { value: 'building', label: 'عمارة' },
  { value: 'office', label: 'مكتب' },
  { value: 'shop', label: 'محل تجاري' },
];

const FinancingRequestForm = ({ offerId, providerId, companyName }: FinancingRequestFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    monthly_income: '',
    property_type: '',
    property_price: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: 'تنبيه', description: 'يرجى تسجيل الدخول أولاً', variant: 'destructive' });
      navigate(`/auth?redirect=/financing/${offerId}`);
      return;
    }

    if (!form.full_name || !form.phone || !form.monthly_income || !form.property_type || !form.property_price) {
      toast({ title: 'خطأ', description: 'يرجى تعبئة جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('financing_requests').insert({
      user_id: user.id,
      offer_id: offerId,
      provider_id: providerId,
      full_name: form.full_name,
      phone: form.phone,
      monthly_income: parseFloat(form.monthly_income),
      property_type: form.property_type,
      property_price: parseFloat(form.property_price),
      notes: form.notes || null,
    });
    setSaving(false);

    if (error) {
      console.error('Error:', error);
      toast({ title: 'خطأ', description: 'تعذر إرسال الطلب', variant: 'destructive' });
    } else {
      setSubmitted(true);
      toast({ title: 'تم الإرسال! ✅', description: `تم إرسال طلب التمويل إلى ${companyName}` });
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
        <CardContent className="py-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <h3 className="font-bold text-lg mb-2">تم إرسال طلبك بنجاح! 🎉</h3>
          <p className="text-muted-foreground">سيتم مراجعة طلبك من قبل {companyName} والتواصل معك قريباً</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          طلب تمويل من {companyName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الاسم الكامل *</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="الاسم الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الجوال *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="05xxxxxxxx"
                dir="ltr"
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label>الدخل الشهري (ر.س) *</Label>
              <Input
                type="number"
                value={form.monthly_income}
                onChange={(e) => setForm({ ...form, monthly_income: e.target.value })}
                placeholder="10000"
              />
            </div>
            <div className="space-y-2">
              <Label>نوع العقار *</Label>
              <Select value={form.property_type} onValueChange={(v) => setForm({ ...form, property_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع العقار" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>سعر العقار (ر.س) *</Label>
              <Input
                type="number"
                value={form.property_price}
                onChange={(e) => setForm({ ...form, property_price: e.target.value })}
                placeholder="1000000"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>ملاحظات إضافية</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="أي ملاحظات أو متطلبات خاصة..."
                rows={3}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 ml-2" />
                إرسال طلب التمويل
              </>
            )}
          </Button>
          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              يجب تسجيل الدخول لإرسال الطلب
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default FinancingRequestForm;
