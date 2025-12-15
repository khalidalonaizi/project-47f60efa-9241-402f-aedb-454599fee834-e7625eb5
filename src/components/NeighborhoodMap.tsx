import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';

interface Neighborhood {
  id: number;
  name: string;
  city: string;
  lat: number;
  lng: number;
  avgPrice: number;
  rating: number;
}

interface NeighborhoodMapProps {
  neighborhoods: Neighborhood[];
  selectedNeighborhood?: number | null;
  onNeighborhoodSelect?: (id: number) => void;
}

const NeighborhoodMap = ({ neighborhoods, selectedNeighborhood, onNeighborhoodSelect }: NeighborhoodMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Fetch API key from edge function
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        if (error) throw error;
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        } else {
          setError('لم يتم تكوين مفتاح Google Maps');
        }
      } catch (err) {
        console.error('Error fetching API key:', err);
        setError('خطأ في جلب مفتاح الخريطة');
      }
    };
    fetchApiKey();
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) return;

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      if ((window as any).google?.maps) {
        initMap();
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ar`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap();
    script.onerror = () => setError('خطأ في تحميل خريطة Google');
    document.head.appendChild(script);
  }, [apiKey]);

  const initMap = () => {
    if (!mapRef.current || !(window as any).google?.maps) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 24.7136, lng: 46.6753 }, // الرياض
      zoom: 6,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    setMap(mapInstance);
    setLoading(false);
  };

  // Add markers
  useEffect(() => {
    if (!map || !(window as any).google?.maps) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const infoWindow = new google.maps.InfoWindow();

    neighborhoods.forEach((neighborhood) => {
      const marker = new google.maps.Marker({
        position: { lat: neighborhood.lat, lng: neighborhood.lng },
        map,
        title: neighborhood.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: selectedNeighborhood === neighborhood.id ? 12 : 8,
          fillColor: selectedNeighborhood === neighborhood.id ? '#22c55e' : '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        animation: selectedNeighborhood === neighborhood.id ? google.maps.Animation.BOUNCE : undefined,
      });

      marker.addListener('click', () => {
        const content = `
          <div style="direction: rtl; text-align: right; padding: 8px; min-width: 150px;">
            <h3 style="font-weight: bold; margin-bottom: 4px; color: #1f2937;">${neighborhood.name}</h3>
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">${neighborhood.city}</p>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
              <span style="color: #f59e0b;">★</span>
              <span style="font-size: 12px;">${neighborhood.rating}</span>
            </div>
            <p style="font-size: 12px; color: #3b82f6;">متوسط السعر: ${new Intl.NumberFormat('ar-SA').format(neighborhood.avgPrice)} ر.س</p>
          </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        
        if (onNeighborhoodSelect) {
          onNeighborhoodSelect(neighborhood.id);
        }
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      neighborhoods.forEach((n) => bounds.extend({ lat: n.lat, lng: n.lng }));
      map.fitBounds(bounds, 50);
    }
  }, [map, neighborhoods, selectedNeighborhood]);

  // Center on selected neighborhood
  useEffect(() => {
    if (!map || !selectedNeighborhood) return;
    
    const neighborhood = neighborhoods.find(n => n.id === selectedNeighborhood);
    if (neighborhood) {
      map.panTo({ lat: neighborhood.lat, lng: neighborhood.lng });
      map.setZoom(12);
    }
  }, [map, selectedNeighborhood, neighborhoods]);

  if (error) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <CardContent className="text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative h-[400px] rounded-lg overflow-hidden border">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default NeighborhoodMap;
