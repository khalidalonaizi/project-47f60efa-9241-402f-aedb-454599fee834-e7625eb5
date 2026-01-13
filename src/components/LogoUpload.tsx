import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2, Building2 } from 'lucide-react';

interface LogoUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
  onRemove?: () => void;
}

const LogoUpload = ({ onUpload, currentUrl, onRemove }: LogoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار ملف صورة صالح',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'خطأ',
        description: 'حجم الملف يجب أن يكون أقل من 2 ميجابايت',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('financing-logos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('financing-logos')
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onUpload(publicUrl);

      toast({
        title: 'تم الرفع',
        description: 'تم رفع الشعار بنجاح',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء رفع الشعار',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="relative w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Logo preview"
                className="w-full h-full object-contain p-2"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={handleRemove}
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <Building2 className="h-8 w-8 text-muted-foreground/50" />
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                رفع الشعار
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG أو SVG (الحد الأقصى 2MB)
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoUpload;
