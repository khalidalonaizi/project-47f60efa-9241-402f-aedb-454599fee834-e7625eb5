import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  display_locations: string[];
}

interface AdvancedAdvertisementProps {
  location?: string;
  className?: string;
  variant?: 'slider' | 'banner' | 'sidebar' | 'inline' | 'between-sections';
  userType?: 'individual' | 'real_estate_office' | 'financing_provider' | 'appraiser' | 'guest';
  autoSlide?: boolean;
  slideInterval?: number;
}

const AdvancedAdvertisement = ({ 
  location = 'homepage', 
  className,
  variant = 'banner',
  userType,
  autoSlide = true,
  slideInterval = 5000
}: AdvancedAdvertisementProps) => {
  const { user } = useAuth();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [profileType, setProfileType] = useState<string | null>(null);

  useEffect(() => {
    fetchAds();
    if (user) {
      fetchUserProfile();
    }
  }, [location, user]);

  useEffect(() => {
    if (ads.length > 1 && autoSlide && variant === 'slider' && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, slideInterval);
      return () => clearInterval(interval);
    }
  }, [ads.length, autoSlide, slideInterval, isPaused, variant]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setProfileType(data.account_type);
    }
  };

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('id, title, image_url, target_url, display_locations')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .contains('display_locations', [location]);

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = async (ad: Advertisement) => {
    window.open(ad.target_url, '_blank', 'noopener,noreferrer');
    
    try {
      const { data } = await supabase
        .from('advertisements')
        .select('click_count')
        .eq('id', ad.id)
        .single();
      
      if (data) {
        await supabase
          .from('advertisements')
          .update({ click_count: (data.click_count || 0) + 1 })
          .eq('id', ad.id);
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleDismiss = (adId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed([...dismissed, adId]);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % visibleAds.length);
  };

  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + visibleAds.length) % visibleAds.length);
  };

  const goToSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const visibleAds = ads.filter(ad => !dismissed.includes(ad.id));

  if (loading || visibleAds.length === 0) {
    return null;
  }

  const currentAd = visibleAds[currentIndex % visibleAds.length];

  if (!currentAd) return null;

  const variantStyles = {
    slider: 'w-full h-48 md:h-64 lg:h-80',
    banner: 'w-full h-24 md:h-32 lg:h-40',
    sidebar: 'w-full h-64',
    inline: 'w-full h-48 md:h-56',
    'between-sections': 'w-full h-32 md:h-40',
  };

  return (
    <div 
      className={cn(
        "relative group overflow-hidden rounded-lg cursor-pointer transition-all hover:shadow-lg",
        variantStyles[variant],
        className
      )}
      onClick={() => handleAdClick(currentAd)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Image with smooth transition */}
      <div className="relative w-full h-full">
        {visibleAds.map((ad, index) => (
          <img
            key={ad.id}
            src={ad.image_url}
            alt={ad.title}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
              index === currentIndex ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
      </div>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Ad badge with user type */}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <span className="bg-background/90 text-foreground text-xs px-2 py-1 rounded backdrop-blur-sm">
          إعلان
        </span>
        {(userType || profileType) && (
          <span className="bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded backdrop-blur-sm">
            {profileType === 'real_estate_office' ? 'للمكاتب' :
             profileType === 'financing_provider' ? 'للجهات التمويلية' :
             profileType === 'appraiser' ? 'للمقيمين' : 'للأفراد'}
          </span>
        )}
      </div>
      
      {/* Dismiss button */}
      <button
        onClick={(e) => handleDismiss(currentAd.id, e)}
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background backdrop-blur-sm"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Navigation arrows for slider */}
      {variant === 'slider' && visibleAds.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </>
      )}
      
      {/* Title and bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-semibold text-lg drop-shadow-lg">{currentAd.title}</p>
        
        {/* Dots indicator */}
        {visibleAds.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {visibleAds.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToSlide(index, e)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/75"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress bar for auto-slide */}
      {autoSlide && variant === 'slider' && visibleAds.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-primary transition-all ease-linear"
            style={{
              animation: `progress ${slideInterval}ms linear infinite`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default AdvancedAdvertisement;