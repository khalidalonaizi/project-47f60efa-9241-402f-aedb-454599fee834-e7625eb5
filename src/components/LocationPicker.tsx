import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { MapPin, LocateFixed } from 'lucide-react';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
}

const LocationPicker = ({ latitude, longitude, onLocationChange }: LocationPickerProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Default to center of Saudi Arabia
  const defaultLat = latitude || 24.7136;
  const defaultLng = longitude || 46.6753;

  const updateMarker = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapRef.current);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current?.getLatLng();
        if (pos) {
          onLocationChange(pos.lat, pos.lng);
        }
      });
    }
    
    mapRef.current.setView([lat, lng], 15);
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current).setView([defaultLat, defaultLng], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(mapRef.current);

    // Add click handler
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      updateMarker(e.latlng.lat, e.latlng.lng);
    });

    // If initial coordinates provided, add marker
    if (latitude && longitude) {
      updateMarker(latitude, longitude);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('الموقع الجغرافي غير مدعوم في متصفحك');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateMarker(position.coords.latitude, position.coords.longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsLocating(false);
        alert('لم نتمكن من الحصول على موقعك. يرجى التأكد من تفعيل خدمة الموقع.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>انقر على الخريطة لتحديد الموقع أو اسحب العلامة</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="gap-2"
        >
          <LocateFixed className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating ? 'جاري التحديد...' : 'موقعي الحالي'}
        </Button>
      </div>
      
      <div 
        ref={containerRef} 
        className="h-[300px] rounded-lg border border-border overflow-hidden"
        style={{ zIndex: 0 }}
      />
      
      {latitude && longitude && (
        <div className="text-sm text-muted-foreground text-center">
          الإحداثيات: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;