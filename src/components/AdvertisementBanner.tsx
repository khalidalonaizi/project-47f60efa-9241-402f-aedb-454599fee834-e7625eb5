import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  display_locations: string[];
}

interface AdvertisementBannerProps {
  location?: string;
  className?: string;
  variant?: 'banner' | 'sidebar' | 'inline';
}

const AdvertisementBanner = ({ 
  location = 'homepage', 
  className,
  variant = 'banner' 
}: AdvertisementBannerProps) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, [location]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

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
    // Open target URL first for better UX
    window.open(ad.target_url, '_blank', 'noopener,noreferrer');
    
    // Increment click count in background
    try {
      // Get current click count and increment
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

  const visibleAds = ads.filter(ad => !dismissed.includes(ad.id));

  if (loading || visibleAds.length === 0) {
    return null;
  }

  const currentAd = visibleAds[currentAdIndex % visibleAds.length];

  if (!currentAd) return null;

  const variantStyles = {
    banner: 'w-full h-24 md:h-32 lg:h-40',
    sidebar: 'w-full h-64',
    inline: 'w-full h-48 md:h-56'
  };

  return (
    <div 
      className={cn(
        "relative group overflow-hidden rounded-lg cursor-pointer transition-all hover:shadow-lg",
        variantStyles[variant],
        className
      )}
      onClick={() => handleAdClick(currentAd)}
    >
      <img
        src={currentAd.image_url}
        alt={currentAd.title}
        className="w-full h-full object-cover"
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Ad badge */}
      <span className="absolute top-2 left-2 bg-background/80 text-foreground text-xs px-2 py-1 rounded">
        إعلان
      </span>
      
      {/* Dismiss button */}
      <button
        onClick={(e) => handleDismiss(currentAd.id, e)}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 text-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Title on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white font-medium text-sm truncate">{currentAd.title}</p>
      </div>
      
      {/* Dots indicator for multiple ads */}
      {visibleAds.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          {visibleAds.map((_, index) => (
            <span
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === currentAdIndex % visibleAds.length
                  ? "bg-white"
                  : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvertisementBanner;
