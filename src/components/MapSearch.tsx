import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Home, Loader2, X, Navigation } from "lucide-react";
import { Link } from "react-router-dom";

interface Property {
  id: string;
  title: string;
  price: number;
  listing_type: string;
  neighborhood: string | null;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  images: string[] | null;
  latitude: number | null;
  longitude: number | null;
  property_type: string;
}

interface MapSearchProps {
  onClose?: () => void;
}

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

const MapSearch = ({ onClose }: MapSearchProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(price);
  };

  // Fetch API key (requires authentication)
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        // Check if user is authenticated first
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('User not authenticated, map key not available');
          return;
        }

        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        if (error) {
          if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            console.log('Unauthorized to fetch map key');
          } else {
            throw error;
          }
          return;
        }
        setApiKey(data.apiKey);
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    };
    fetchApiKey();
  }, []);

  // Fetch properties with coordinates
  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_approved', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (!error && data) {
        setProperties(data);
      }
      setLoading(false);
    };
    fetchProperties();
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey || mapLoaded) return;

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      if (window.google) {
        setMapLoaded(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ar`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, [apiKey, mapLoaded]);

  // Initialize map and markers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return;

    // Initialize map centered on Saudi Arabia
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 24.7136, lng: 46.6753 },
      zoom: 6,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
      ],
      mapTypeControl: false,
      fullscreenControl: false,
    });

    infoWindowRef.current = new window.google.maps.InfoWindow();

    // Add markers for properties
    properties.forEach(property => {
      if (!property.latitude || !property.longitude) return;

      const marker = new window.google.maps.Marker({
        position: { lat: property.latitude, lng: property.longitude },
        map: mapInstance.current,
        title: property.title,
        icon: {
          url: property.listing_type === 'sale' 
            ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
            : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
        },
      });

      marker.addListener('click', () => {
        setSelectedProperty(property);
        
        const content = `
          <div style="direction: rtl; min-width: 200px; padding: 8px;">
            <h3 style="margin: 0 0 8px; font-weight: bold;">${property.title}</h3>
            <p style="margin: 0 0 4px; color: #3b82f6; font-weight: bold;">
              ${formatPrice(property.price)} ر.س
              ${property.listing_type === 'rent' ? '/ شهري' : ''}
            </p>
            <p style="margin: 0; color: #666; font-size: 12px;">
              ${property.city} ${property.neighborhood ? '- ' + property.neighborhood : ''}
            </p>
          </div>
        `;
        
        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (properties.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      properties.forEach(p => {
        if (p.latitude && p.longitude) {
          bounds.extend({ lat: p.latitude, lng: p.longitude });
        }
      });
      mapInstance.current?.fitBounds(bounds);
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [mapLoaded, properties]);

  if (loading || !apiKey) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-[600px] rounded-xl overflow-hidden border border-border">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-card rounded-lg shadow-lg p-3 z-10">
        <p className="text-sm font-bold mb-2">دليل الألوان</p>
        <div className="flex items-center gap-2 text-sm mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>للبيع</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>للإيجار</span>
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-4 left-4 z-10"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      {/* Selected Property Card */}
      {selectedProperty && (
        <Card className="absolute bottom-4 right-4 left-4 md:left-auto md:w-80 z-10">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <img
                src={selectedProperty.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200"}
                alt={selectedProperty.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm line-clamp-1">{selectedProperty.title}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{selectedProperty.city}</span>
                </div>
                <p className="text-primary font-bold text-sm mt-1">
                  {formatPrice(selectedProperty.price)} ر.س
                  {selectedProperty.listing_type === 'rent' && <span className="text-xs font-normal"> / شهري</span>}
                </p>
                <Link to={`/property/${selectedProperty.id}`}>
                  <Button size="sm" className="mt-2 w-full">
                    عرض التفاصيل
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No properties message */}
      {properties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <Home className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">لا توجد عقارات مع إحداثيات الموقع</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSearch;
