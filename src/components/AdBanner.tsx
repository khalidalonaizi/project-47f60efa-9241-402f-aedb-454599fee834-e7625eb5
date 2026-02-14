import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

/**
 * Google AdSense Banner component.
 * To activate: Add your AdSense client ID in the admin panel and include the AdSense script in index.html.
 * For now, this renders a placeholder banner.
 */
const AdBanner = ({ slot, format = 'auto', className = '' }: AdBannerProps) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Try to load AdSense ad if available
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        (window as any).adsbygoogle.push({});
      }
    } catch (e) {
      // AdSense not loaded
    }
  }, []);

  // If no slot configured, show placeholder
  if (!slot) {
    return (
      <div className={`w-full bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center py-3 ${className}`}>
        <p className="text-xs text-muted-foreground">مساحة إعلانية</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format={format}
        data-ad-slot={slot}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
