import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  MousePointer,
  Calendar,
  Image as ImageIcon,
  Link as LinkIcon,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  display_locations: string[];
  click_count: number;
  created_at: string;
}

const DISPLAY_LOCATIONS = [
  { id: 'homepage', label: 'الصفحة الرئيسية' },
  { id: 'search', label: 'صفحة البحث' },
  { id: 'property-details', label: 'صفحة تفاصيل العقار' },
  { id: 'financing', label: 'صفحة التمويل' },
];

const AdminAdvertisements = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    target_url: '',
    start_date: '',
    end_date: '',
    is_active: true,
    display_locations: ['homepage'] as string[],
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء جلب الإعلانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image_url: '',
      target_url: '',
      start_date: '',
      end_date: '',
      is_active: true,
      display_locations: ['homepage'],
    });
    setEditingAd(null);
  };

  const openEditDialog = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image_url: ad.image_url,
      target_url: ad.target_url,
      start_date: ad.start_date.slice(0, 16),
      end_date: ad.end_date.slice(0, 16),
      is_active: ad.is_active,
      display_locations: ad.display_locations,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار ملف صورة صحيح',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'خطأ',
        description: 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `ads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      
      toast({
        title: 'تم الرفع',
        description: 'تم رفع الصورة بنجاح',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء رفع الصورة',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.image_url || !formData.target_url || !formData.start_date || !formData.end_date) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast({
        title: 'خطأ',
        description: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية',
        variant: 'destructive',
      });
      return;
    }

    try {
      const adData = {
        title: formData.title,
        image_url: formData.image_url,
        target_url: formData.target_url,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        display_locations: formData.display_locations,
      };

      if (editingAd) {
        const { error } = await supabase
          .from('advertisements')
          .update(adData)
          .eq('id', editingAd.id);

        if (error) throw error;

        toast({
          title: 'تم التحديث',
          description: 'تم تحديث الإعلان بنجاح',
        });
      } else {
        const { error } = await supabase
          .from('advertisements')
          .insert([adData]);

        if (error) throw error;

        toast({
          title: 'تم الإنشاء',
          description: 'تم إنشاء الإعلان بنجاح',
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الإعلان',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الإعلان بنجاح',
      });

      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف الإعلان',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !currentActive })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: currentActive ? 'تم التعطيل' : 'تم التفعيل',
        description: currentActive ? 'تم تعطيل الإعلان' : 'تم تفعيل الإعلان',
      });

      fetchAds();
    } catch (error) {
      console.error('Error toggling ad:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الإعلان',
        variant: 'destructive',
      });
    }
  };

  const handleLocationChange = (locationId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      display_locations: checked
        ? [...prev.display_locations, locationId]
        : prev.display_locations.filter(l => l !== locationId)
    }));
  };

  const getAdStatus = (ad: Advertisement) => {
    const now = new Date();
    const start = new Date(ad.start_date);
    const end = new Date(ad.end_date);

    if (!ad.is_active) {
      return { label: 'غير نشط', variant: 'secondary' as const };
    }
    if (now < start) {
      return { label: 'مجدول', variant: 'outline' as const };
    }
    if (now > end) {
      return { label: 'منتهي', variant: 'destructive' as const };
    }
    return { label: 'نشط', variant: 'default' as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الإعلانات</h2>
          <p className="text-muted-foreground">إنشاء وإدارة الإعلانات المعروضة على الموقع</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إعلان جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'تعديل الإعلان' : 'إنشاء إعلان جديد'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الإعلان *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="أدخل عنوان الإعلان"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>صورة الإعلان *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  {formData.image_url ? (
                    <div className="relative">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-8 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      ) : (
                        <>
                          <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">اضغط لرفع صورة</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG حتى 5 ميجابايت</p>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>

              {/* Target URL */}
              <div className="space-y-2">
                <Label htmlFor="target_url">رابط الوجهة *</Label>
                <div className="relative">
                  <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="target_url"
                    value={formData.target_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                    placeholder="https://example.com"
                    className="pr-10"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">تاريخ البداية *</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">تاريخ الانتهاء *</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              {/* Display Locations */}
              <div className="space-y-2">
                <Label>أماكن العرض</Label>
                <div className="grid grid-cols-2 gap-3">
                  {DISPLAY_LOCATIONS.map((location) => (
                    <div key={location.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={location.id}
                        checked={formData.display_locations.includes(location.id)}
                        onCheckedChange={(checked) => handleLocationChange(location.id, checked as boolean)}
                      />
                      <Label htmlFor={location.id} className="cursor-pointer">
                        {location.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>حالة الإعلان</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_active ? 'الإعلان نشط ويظهر للزوار' : 'الإعلان معطل ولا يظهر'}
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingAd ? 'تحديث الإعلان' : 'إنشاء الإعلان'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ads.length}</p>
                <p className="text-sm text-muted-foreground">إجمالي الإعلانات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {ads.filter(ad => {
                    const now = new Date();
                    return ad.is_active && new Date(ad.start_date) <= now && new Date(ad.end_date) >= now;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">إعلانات نشطة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {ads.filter(ad => new Date(ad.start_date) > new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">إعلانات مجدولة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MousePointer className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {ads.reduce((sum, ad) => sum + ad.click_count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">إجمالي النقرات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ads Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الإعلانات</CardTitle>
        </CardHeader>
        <CardContent>
          {ads.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد إعلانات بعد</p>
              <p className="text-sm text-muted-foreground">أنشئ إعلانك الأول للبدء</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الصورة</TableHead>
                  <TableHead>العنوان</TableHead>
                  <TableHead>الفترة</TableHead>
                  <TableHead>أماكن العرض</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>النقرات</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => {
                  const status = getAdStatus(ad);
                  return (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(ad.start_date), 'dd/MM/yyyy', { locale: ar })}</p>
                          <p className="text-muted-foreground">
                            إلى {format(new Date(ad.end_date), 'dd/MM/yyyy', { locale: ar })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ad.display_locations.slice(0, 2).map((loc) => (
                            <Badge key={loc} variant="outline" className="text-xs">
                              {DISPLAY_LOCATIONS.find(l => l.id === loc)?.label || loc}
                            </Badge>
                          ))}
                          {ad.display_locations.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{ad.display_locations.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MousePointer className="h-4 w-4 text-muted-foreground" />
                          {ad.click_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(ad.id, ad.is_active)}
                            title={ad.is_active ? 'تعطيل' : 'تفعيل'}
                          >
                            <Eye className={`h-4 w-4 ${ad.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(ad)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(ad.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAdvertisements;
