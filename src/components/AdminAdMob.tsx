import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Monitor, Save, Info, CheckCircle } from 'lucide-react';

interface AdMobSettings {
  enabled: boolean;
  clientId: string;
  slots: {
    homepage_top: string;
    homepage_middle: string;
    property_details: string;
    search_results: string;
    financing_page: string;
    dashboard: string;
  };
  enabledPages: {
    homepage: boolean;
    propertyDetails: boolean;
    search: boolean;
    financing: boolean;
    dashboard: boolean;
  };
}

const DEFAULT_SETTINGS: AdMobSettings = {
  enabled: false,
  clientId: '',
  slots: {
    homepage_top: '',
    homepage_middle: '',
    property_details: '',
    search_results: '',
    financing_page: '',
    dashboard: '',
  },
  enabledPages: {
    homepage: true,
    propertyDetails: true,
    search: true,
    financing: true,
    dashboard: false,
  },
};

const SLOT_LABELS: Record<string, { label: string; description: string }> = {
  homepage_top: { label: 'الصفحة الرئيسية - أعلى', description: 'بنر إعلاني أعلى الصفحة الرئيسية' },
  homepage_middle: { label: 'الصفحة الرئيسية - وسط', description: 'بنر إعلاني بين أقسام الصفحة الرئيسية' },
  property_details: { label: 'تفاصيل العقار', description: 'بنر إعلاني في صفحة تفاصيل العقار' },
  search_results: { label: 'نتائج البحث', description: 'بنر إعلاني في صفحة نتائج البحث' },
  financing_page: { label: 'صفحة التمويل', description: 'بنر إعلاني في صفحة حاسبة التمويل' },
  dashboard: { label: 'لوحة التحكم', description: 'بنر إعلاني في لوحة تحكم المستخدم' },
};

const PAGE_LABELS: Record<string, string> = {
  homepage: 'الصفحة الرئيسية',
  propertyDetails: 'تفاصيل العقار',
  search: 'البحث',
  financing: 'التمويل',
  dashboard: 'لوحة التحكم',
};

const AdminAdMob = () => {
  const [settings, setSettings] = useState<AdMobSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('admob_settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem('admob_settings', JSON.stringify(settings));
      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ إعدادات Google AdMob بنجاح',
      });
    } catch {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الإعدادات',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إعدادات Google AdMob</h1>
          <p className="text-muted-foreground">إدارة إعلانات Google AdSense/AdMob في الموقع</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">كيفية تفعيل إعلانات Google AdMob:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-600 dark:text-blue-400">
              <li>أنشئ حساب Google AdSense من <a href="https://www.google.com/adsense" target="_blank" rel="noopener noreferrer" className="underline">google.com/adsense</a></li>
              <li>أدخل معرف العميل (Client ID) في الحقل أدناه (مثال: ca-pub-XXXXXXXXXXXXXXXX)</li>
              <li>أنشئ وحدات إعلانية وأدخل معرف كل وحدة في المكان المناسب</li>
              <li>فعّل الإعلانات واختر الصفحات المراد عرض الإعلانات فيها</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Main Toggle & Client ID */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            الإعدادات الأساسية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">تفعيل إعلانات AdMob</p>
              <p className="text-sm text-muted-foreground">تفعيل أو تعطيل جميع الإعلانات في الموقع</p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">معرف عميل AdSense (Client ID)</Label>
            <Input
              id="clientId"
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              value={settings.clientId}
              onChange={(e) => setSettings(prev => ({ ...prev, clientId: e.target.value }))}
              dir="ltr"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">يمكنك العثور عليه في لوحة تحكم Google AdSense</p>
          </div>
        </CardContent>
      </Card>

      {/* Page Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            الصفحات المفعّلة
          </CardTitle>
          <CardDescription>اختر الصفحات التي تريد عرض الإعلانات فيها</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(PAGE_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium">{label}</span>
                <Switch
                  checked={settings.enabledPages[key as keyof typeof settings.enabledPages]}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({
                      ...prev,
                      enabledPages: { ...prev.enabledPages, [key]: checked },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ad Slots */}
      <Card>
        <CardHeader>
          <CardTitle>معرّفات الوحدات الإعلانية (Ad Slots)</CardTitle>
          <CardDescription>أدخل معرف كل وحدة إعلانية من حساب AdSense الخاص بك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(SLOT_LABELS).map(([key, { label, description }]) => (
              <div key={key} className="space-y-2 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`slot-${key}`} className="font-medium">{label}</Label>
                  {settings.slots[key as keyof typeof settings.slots] && (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      <CheckCircle className="h-3 w-3 ml-1" />
                      مُعرّف
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
                <Input
                  id={`slot-${key}`}
                  placeholder="XXXXXXXXXX"
                  value={settings.slots[key as keyof typeof settings.slots]}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      slots: { ...prev.slots, [key]: e.target.value },
                    }))
                  }
                  dir="ltr"
                  className="font-mono text-sm"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص الحالة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">
                {settings.enabled ? '✅' : '❌'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">حالة الإعلانات</p>
              <Badge variant={settings.enabled ? 'default' : 'secondary'} className="mt-2">
                {settings.enabled ? 'مفعّل' : 'معطّل'}
              </Badge>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">
                {Object.values(settings.enabledPages).filter(Boolean).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">صفحات مفعّلة</p>
              <Badge variant="outline" className="mt-2">
                من {Object.keys(settings.enabledPages).length}
              </Badge>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">
                {Object.values(settings.slots).filter(Boolean).length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">وحدات إعلانية مُعرّفة</p>
              <Badge variant="outline" className="mt-2">
                من {Object.keys(settings.slots).length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAdMob;
