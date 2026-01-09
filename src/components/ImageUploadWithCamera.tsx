import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
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

  const startCamera = async () => {
    if (images.length >= maxImages) {
      toast({
        title: 'خطأ',
        description: `لا يمكنك إضافة المزيد من الصور. الحد الأقصى ${maxImages}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'لم نتمكن من الوصول إلى الكاميرا. يرجى التأكد من منح الإذن.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      stopCamera();
      setUploading(true);

      try {
        const url = await uploadImage(blob);
        const updatedImages = [...images, url];
        setImages(updatedImages);
        onImagesChange(updatedImages);
        toast({
          title: 'تم الرفع',
          description: 'تم رفع الصورة بنجاح',
        });
      } catch (error) {
        toast({
          title: 'خطأ',
          description: 'حدث خطأ أثناء رفع الصورة',
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
      }
    }, 'image/jpeg', 0.9);
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
            onChange={handleFileChange}
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
        
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1 gap-2" 
          onClick={startCamera}
          disabled={uploading || images.length >= maxImages}
        >
          <Camera className="h-4 w-4" />
          التقاط بالكاميرا
        </Button>
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

      {/* Camera Dialog */}
      <Dialog open={showCamera} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>التقاط صورة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={stopCamera}
              >
                إلغاء
              </Button>
              <Button 
                type="button" 
                variant="hero" 
                className="flex-1 gap-2"
                onClick={capturePhoto}
              >
                <Camera className="h-4 w-4" />
                التقاط
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUploadWithCamera;