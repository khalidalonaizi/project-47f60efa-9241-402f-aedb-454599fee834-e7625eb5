import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Home, Loader2, Search, Building2, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const HomeMapSection = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(price);
  };

  // Create custom icons for sale and rent
  const createIcon = (type: string) => {
    const color = type === 'sale' ? '#22c55e' : '#3b82f6';
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Fetch properties with coordinates
  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_approved', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(50);

      if (!error && data) {
        setProperties(data);
      }
      setLoading(false);
    };
    fetchProperties();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize the map centered on Saudi Arabia
    mapInstance.current = L.map(mapRef.current, {
      center: [24.7136, 46.6753],
      zoom: 6,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Add markers when properties are loaded
  useEffect(() => {
    if (!mapInstance.current || loading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each property
    properties.forEach(property => {
      if (!property.latitude || !property.longitude) return;

      const marker = L.marker([property.latitude, property.longitude], {
        icon: createIcon(property.listing_type),
      }).addTo(mapInstance.current!);

      // Create popup content
      const popupContent = `
        <div style="direction: rtl; min-width: 180px; text-align: right;">
          <h3 style="margin: 0 0 8px; font-weight: bold; font-size: 14px;">${property.title}</h3>
          <p style="margin: 0 0 4px; color: #14B8A6; font-weight: bold;">
            ${formatPrice(property.price)} ر.س
            ${property.listing_type === 'rent' ? '/ شهري' : ''}
          </p>
          <p style="margin: 0; color: #666; font-size: 12px;">
            ${property.city} ${property.neighborhood ? '- ' + property.neighborhood : ''}
          </p>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setSelectedProperty(property);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (properties.length > 0) {
      const bounds = L.latLngBounds(
        properties
          .filter(p => p.latitude && p.longitude)
          .map(p => [p.latitude!, p.longitude!] as [number, number])
      );
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [properties, loading]);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            <MapPin className="w-3 h-3 ml-1" />
            البحث على الخريطة
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">اكتشف العقارات على الخريطة</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            تصفح العقارات المتاحة في جميع أنحاء المملكة العربية السعودية بطريقة تفاعلية
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="relative h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center h-full bg-muted/50">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Map Container */}
                <div ref={mapRef} className="w-full h-full z-0" />

                {/* Legend */}
                <div className="absolute top-4 right-4 bg-card rounded-lg shadow-lg p-3 z-[1000]">
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

                {/* Stats */}
                <div className="absolute top-4 left-4 bg-card rounded-lg shadow-lg p-3 z-[1000]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="font-bold">{properties.length}</span>
                    <span className="text-muted-foreground text-sm">عقار</span>
                  </div>
                </div>

                {/* Selected Property Card */}
                {selectedProperty && (
                  <Card className="absolute bottom-4 right-4 left-4 md:left-auto md:w-80 z-[1000] shadow-lg">
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
                              <Eye className="w-3 h-3 ml-1" />
                              عرض التفاصيل
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* No properties message */}
                {properties.length === 0 && !loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
                    <div className="text-center">
                      <Home className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">لا توجد عقارات مع إحداثيات الموقع</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center mt-8">
          <Button size="lg" onClick={() => navigate('/search')} className="gap-2">
            <Search className="w-4 h-4" />
            عرض جميع العقارات
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomeMapSection;
