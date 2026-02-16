import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';

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
  autoDetectLocation?: boolean;
}

const LocationPicker = ({ latitude, longitude, onLocationChange, autoDetectLocation = true }: LocationPickerProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Default to center of Saudi Arabia
  const defaultLat = 24.7136;
  const defaultLng = 46.6753;

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

  const getCurrentLocation = useCallback(() => {
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
        // If auto-detecting failed, center on default location
        if (mapRef.current && !latitude && !longitude) {
          mapRef.current.setView([defaultLat, defaultLng], 10);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [updateMarker, latitude, longitude]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map with a temporary view
    const initialLat = latitude || defaultLat;
    const initialLng = longitude || defaultLng;
    const initialZoom = latitude && longitude ? 15 : 6;

    mapRef.current = L.map(containerRef.current).setView([initialLat, initialLng], initialZoom);
    
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

    setMapReady(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Auto-detect location on mount if no coordinates provided
  useEffect(() => {
    if (mapReady && autoDetectLocation && !latitude && !longitude) {
      getCurrentLocation();
    }
  }, [mapReady, autoDetectLocation, latitude, longitude, getCurrentLocation]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
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
          {isLocating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري التحديد...
            </>
          ) : (
            <>
              <LocateFixed className="h-4 w-4" />
              موقعي الحالي
            </>
          )}
        </Button>
      </div>
      
      <div 
        ref={containerRef} 
        className="h-[400px] rounded-lg border border-border overflow-hidden"
        style={{ zIndex: 0 }}
      />
      
      {latitude && longitude && (
        <div className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">
            الإحداثيات: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
