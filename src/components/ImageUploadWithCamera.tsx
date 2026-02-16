import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';

interface ImageUploadWithCameraProps {
  userId: string;
  onImagesChange: (urls: string[]) => void;
  existingImages?: string[];
  maxImages?: number;
}

const ImageUploadWithCamera = ({ 
  userId, 
  onImagesChange, 
  existingImages = [], 
  maxImages = 10 
}: ImageUploadWithCameraProps) => {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadImage = useCallback(async (file: File | Blob, fileName?: string) => {
    const fileExt = fileName?.split('.').pop() || 'jpg';
    const finalFileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(finalFileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(finalFileName);

    return publicUrl;
  }, [userId]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast({
        title: 'خطأ',
        description: `يمكنك رفع ${maxImages} صور كحد أقصى`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file, file.name));
      const newUrls = await Promise.all(uploadPromises);
      const updatedImages = [...images, ...newUrls];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      toast({
        title: 'تم الرفع',
        description: 'تم رفع الصور بنجاح',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء رفع الصور',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Options */}
      <div className="flex gap-3">
        <label className="flex-1">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={uploading || images.length >= maxImages}
            className="hidden"
          />
          <Button 
            type="button" 
            variant="outline" 
            className="w-full gap-2" 
            disabled={uploading || images.length >= maxImages}
            asChild
          >
            <span>
              <Upload className="h-4 w-4" />
              رفع من الجهاز
            </span>
          </Button>
        </label>
        
        {/* Camera button - opens native camera directly on mobile */}
        <label className="flex-1">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={uploading || images.length >= maxImages}
            className="hidden"
          />
          <Button 
            type="button" 
            variant="outline" 
            className="w-full gap-2" 
            disabled={uploading || images.length >= maxImages}
            asChild
          >
            <span>
              <Camera className="h-4 w-4" />
              التقاط بالكاميرا
            </span>
          </Button>
        </label>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
            <img src={url} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {uploading && (
          <div className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
      </div>
      
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">لم يتم إضافة صور بعد</p>
          <p className="text-sm text-muted-foreground mt-1">
            يمكنك رفع حتى {maxImages} صور
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadWithCamera;
