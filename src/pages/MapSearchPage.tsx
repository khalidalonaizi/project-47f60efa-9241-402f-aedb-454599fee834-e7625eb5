import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Home, Loader2, X, Building2, Eye, Filter, ArrowRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
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

const cities = [
  { value: "all", label: "جميع المدن" },
  { value: "الرياض", label: "الرياض" },
  { value: "جدة", label: "جدة" },
  { value: "الدمام", label: "الدمام" },
  { value: "مكة المكرمة", label: "مكة المكرمة" },
  { value: "المدينة المنورة", label: "المدينة المنورة" },
  { value: "الخبر", label: "الخبر" },
  { value: "الطائف", label: "الطائف" },
];

const propertyTypes = [
  { value: "all", label: "جميع الأنواع" },
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "land", label: "أرض" },
  { value: "building", label: "عمارة" },
  { value: "office", label: "مكتب" },
  { value: "shop", label: "محل تجاري" },
];

const MapSearchPage = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedListing, setSelectedListing] = useState("all");

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
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        cursor: pointer;
      "></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  // Fetch properties with coordinates
  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(200);

      if (!error && data) {
        setProperties(data);
      }
      setLoading(false);
    };
    fetchProperties();
  }, []);

  // Filter properties based on selections
  const filteredProperties = properties.filter(property => {
    if (selectedCity !== "all" && property.city !== selectedCity) return false;
    if (selectedType !== "all" && property.property_type !== selectedType) return false;
    if (selectedListing !== "all" && property.listing_type !== selectedListing) return false;
    return true;
  });

  // Initialize map after loading is complete
  useEffect(() => {
    if (loading) return;
    if (!mapContainerRef.current) return;
    if (mapInstance.current) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      
      try {
        // Initialize the map centered on Saudi Arabia
        mapInstance.current = L.map(mapContainerRef.current, {
          center: [24.7136, 46.6753],
          zoom: 6,
          zoomControl: true,
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapInstance.current);

        // Force a resize after initialization
        setTimeout(() => {
          mapInstance.current?.invalidateSize();
        }, 100);

        setMapReady(true);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        setMapReady(false);
      }
    };
  }, [loading]);

  // Add markers when map is ready and properties change
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each filtered property
    filteredProperties.forEach(property => {
      if (!property.latitude || !property.longitude) return;

      const marker = L.marker([property.latitude, property.longitude], {
        icon: createIcon(property.listing_type),
      }).addTo(mapInstance.current!);

      // Create popup content
      const popupContent = `
        <div style="direction: rtl; min-width: 200px; text-align: right; padding: 8px;">
          <h3 style="margin: 0 0 8px; font-weight: bold; font-size: 14px;">${property.title}</h3>
          <p style="margin: 0 0 4px; color: #14B8A6; font-weight: bold; font-size: 16px;">
            ${formatPrice(property.price)} ر.س
            ${property.listing_type === 'rent' ? '<span style="font-size: 12px; font-weight: normal;">/ شهري</span>' : ''}
          </p>
          <p style="margin: 0 0 8px; color: #666; font-size: 12px;">
            ${property.city} ${property.neighborhood ? '- ' + property.neighborhood : ''}
          </p>
          <div style="display: flex; gap: 12px; color: #888; font-size: 11px;">
            ${property.bedrooms ? `<span>${property.bedrooms} غرف</span>` : ''}
            ${property.bathrooms ? `<span>${property.bathrooms} حمام</span>` : ''}
            ${property.area ? `<span>${property.area} م²</span>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setSelectedProperty(property);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (filteredProperties.length > 0) {
      const bounds = L.latLngBounds(
        filteredProperties
          .filter(p => p.latitude && p.longitude)
          .map(p => [p.latitude!, p.longitude!] as [number, number])
      );
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [filteredProperties, mapReady]);

  const resetFilters = () => {
    setSelectedCity("all");
    setSelectedType("all");
    setSelectedListing("all");
  };

  const hasActiveFilters = selectedCity !== "all" || selectedType !== "all" || selectedListing !== "all";

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b px-4 py-3 flex items-center gap-4 z-20">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            البحث على الخريطة
          </h1>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Building2 className="h-3 w-3" />
          {filteredProperties.length} عقار
        </Badge>
      </div>

      {/* Filters */}
      <div className="bg-card border-b px-4 py-3 flex flex-wrap items-center gap-3 z-20">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter className="w-4 h-4" />
          <span>فلترة:</span>
        </div>
        
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="المدينة" />
          </SelectTrigger>
          <SelectContent>
            {cities.map(city => (
              <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="نوع العقار" />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedListing} onValueChange={setSelectedListing}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="نوع الإعلان" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="sale">للبيع</SelectItem>
            <SelectItem value="rent">للإيجار</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9">
            <X className="w-4 h-4 ml-1" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-muted/50">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div 
              ref={mapContainerRef} 
              className="w-full h-full" 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0,
                zIndex: 1 
              }} 
            />

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-card/95 backdrop-blur rounded-lg shadow-lg p-3 z-[1000]">
              <p className="text-sm font-bold mb-2">دليل الألوان</p>
              <div className="flex items-center gap-2 text-sm mb-1">
                <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
                <span>للبيع</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                <span>للإيجار</span>
              </div>
            </div>

            {/* Selected Property Card */}
            {selectedProperty && (
              <Card className="absolute bottom-4 right-4 left-4 md:left-auto md:w-96 z-[1000] shadow-xl">
                <CardContent className="p-4">
                  <button 
                    onClick={() => setSelectedProperty(null)}
                    className="absolute top-2 left-2 p-1 hover:bg-muted rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex gap-4">
                    <img
                      src={selectedProperty.images?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200"}
                      alt={selectedProperty.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <Badge variant={selectedProperty.listing_type === 'sale' ? 'default' : 'secondary'} className="mb-2">
                        {selectedProperty.listing_type === 'sale' ? 'للبيع' : 'للإيجار'}
                      </Badge>
                      <h3 className="font-bold text-base line-clamp-1">{selectedProperty.title}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{selectedProperty.city}</span>
                        {selectedProperty.neighborhood && <span>- {selectedProperty.neighborhood}</span>}
                      </div>
                      <p className="text-primary font-bold text-lg mt-2">
                        {formatPrice(selectedProperty.price)} ر.س
                        {selectedProperty.listing_type === 'rent' && <span className="text-sm font-normal"> / شهري</span>}
                      </p>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        {selectedProperty.bedrooms && <span>{selectedProperty.bedrooms} غرف</span>}
                        {selectedProperty.bathrooms && <span>{selectedProperty.bathrooms} حمام</span>}
                        {selectedProperty.area && <span>{selectedProperty.area} م²</span>}
                      </div>
                      <Link to={`/property/${selectedProperty.id}`}>
                        <Button size="sm" className="mt-3 w-full gap-2">
                          <Eye className="w-4 h-4" />
                          عرض التفاصيل
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No properties message */}
            {filteredProperties.length === 0 && !loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
                <div className="text-center p-6">
                  <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">لا توجد عقارات</h3>
                  <p className="text-muted-foreground mb-4">لا توجد عقارات مطابقة للفلاتر المحددة</p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={resetFilters}>
                      مسح الفلاتر
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MapSearchPage;
