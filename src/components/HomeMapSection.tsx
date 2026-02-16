import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Home, Loader2, Search, Building2, Eye, Filter, X, HardHat, LocateFixed } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import MapLegend from "@/components/MapLegend";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { addUserLocationMarker } from "@/lib/mapUserLocation";
import { saudiCitiesSelectOptions } from "@/lib/propertyTypes";

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

interface ProfessionalMarker {
  id: string;
  name: string;
  type: 'office' | 'appraiser' | 'financing';
  latitude: number;
  longitude: number;
}

interface DeveloperProject {
  id: string;
  title: string;
  city: string | null;
  latitude: number;
  longitude: number;
  user_id: string;
  images: string[] | null;
  status: string;
  completion_percentage: number | null;
  price_from: number | null;
  price_to: number | null;
}

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const cities = saudiCitiesSelectOptions;

const propertyTypes = [
  { value: "all", label: "جميع الأنواع" },
  { value: "apartment", label: "شقة" },
  { value: "villa", label: "فيلا" },
  { value: "land", label: "أرض" },
  { value: "building", label: "عمارة" },
  { value: "office", label: "مكتب" },
  { value: "shop", label: "محل تجاري" },
];

const HomeMapSection = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const initialBoundsFitted = useRef(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalMarker[]>([]);
  const [devProjects, setDevProjects] = useState<DeveloperProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedDevProject, setSelectedDevProject] = useState<DeveloperProject | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedListing, setSelectedListing] = useState("all");
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA").format(price);
  };

  const createIcon = (type: string) => {
    const colorMap: Record<string, string> = {
      sale: '#22c55e',
      rent: '#3b82f6',
      office: '#c0c0c0',
      appraiser: '#eab308',
      financing: '#ef4444',
      developer: '#8b5cf6',
    };
    const color = colorMap[type] || '#22c55e';
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

  // Fetch properties, professionals, and developer projects
  useEffect(() => {
    const fetchData = async () => {
      const [propertiesRes, professionalsRes, devProjectsRes] = await Promise.all([
        supabase
          .from('properties')
          .select('*')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .limit(100),
        supabase
          .from('profiles')
          .select('user_id, full_name, company_name, account_type, latitude, longitude')
          .in('account_type', ['real_estate_office', 'appraiser', 'financing_provider'])
          .not('latitude', 'is', null)
          .not('longitude', 'is', null),
        supabase
          .from('developer_projects')
          .select('id, title, city, latitude, longitude, user_id, images, status, completion_percentage, price_from, price_to')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null),
      ]);

      if (!propertiesRes.error && propertiesRes.data) {
        setProperties(propertiesRes.data);
      }
      if (!professionalsRes.error && professionalsRes.data) {
        setProfessionals(
          professionalsRes.data.map((p) => ({
            id: p.user_id,
            name: p.company_name || p.full_name || '',
            type: p.account_type === 'real_estate_office' ? 'office' as const
              : p.account_type === 'financing_provider' ? 'financing' as const
              : 'appraiser' as const,
            latitude: Number(p.latitude),
            longitude: Number(p.longitude),
          }))
        );
      }
      if (!devProjectsRes.error && devProjectsRes.data) {
        setDevProjects(
          devProjectsRes.data.map((d) => ({
            ...d,
            latitude: Number(d.latitude),
            longitude: Number(d.longitude),
          }))
        );
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredProperties = useMemo(() => properties.filter(property => {
    if (selectedCity !== "all" && property.city !== selectedCity) return false;
    if (selectedType !== "all" && property.property_type !== selectedType) return false;
    if (selectedListing !== "all" && property.listing_type !== selectedListing) return false;
    return true;
  }), [properties, selectedCity, selectedType, selectedListing]);

  // Initialize map
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapInstance.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      try {
        mapInstance.current = L.map(mapContainerRef.current, {
          center: [24.7136, 46.6753],
          zoom: 6,
          zoomControl: true,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(mapInstance.current);
        setTimeout(() => mapInstance.current?.invalidateSize(), 100);
        setMapReady(true);
        // Add user location marker automatically
        addUserLocationMarker(mapInstance.current).then(marker => {
          userMarkerRef.current = marker;
        });
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

  // Add markers
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const allBounds: [number, number][] = [];

    filteredProperties.forEach(property => {
      if (!property.latitude || !property.longitude) return;
      const marker = L.marker([property.latitude, property.longitude], {
        icon: createIcon(property.listing_type),
      }).addTo(mapInstance.current!);

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
      marker.on('click', () => { setSelectedProperty(property); setSelectedDevProject(null); });
      markersRef.current.push(marker);
      allBounds.push([property.latitude, property.longitude]);
    });

    // Professional markers
    professionals.forEach(prof => {
      const marker = L.marker([prof.latitude, prof.longitude], {
        icon: createIcon(prof.type),
      }).addTo(mapInstance.current!);
      const typeLabels: Record<string, string> = {
        office: 'مكتب عقاري',
        appraiser: 'مقيم عقاري',
        financing: 'جهة تمويلية',
      };
      marker.bindPopup(`
        <div style="direction: rtl; min-width: 150px; text-align: right;">
          <h3 style="margin: 0 0 4px; font-weight: bold; font-size: 14px;">${prof.name}</h3>
          <p style="margin: 0; color: #666; font-size: 12px;">${typeLabels[prof.type] || ''}</p>
        </div>
      `);
      markersRef.current.push(marker);
      allBounds.push([prof.latitude, prof.longitude]);
    });

    // Developer project markers
    devProjects.forEach(proj => {
      const marker = L.marker([proj.latitude, proj.longitude], {
        icon: createIcon('developer'),
      }).addTo(mapInstance.current!);
      marker.bindPopup(`
        <div style="direction: rtl; min-width: 150px; text-align: right;">
          <h3 style="margin: 0 0 4px; font-weight: bold; font-size: 14px;">${proj.title}</h3>
          <p style="margin: 0; color: #666; font-size: 12px;">مشروع تطوير عقاري</p>
          ${proj.city ? `<p style="margin: 0; color: #666; font-size: 12px;">${proj.city}</p>` : ''}
        </div>
      `);
      marker.on('click', () => { setSelectedDevProject(proj); setSelectedProperty(null); });
      markersRef.current.push(marker);
      allBounds.push([proj.latitude, proj.longitude]);
    });

    // Only fit bounds on initial load
    if (allBounds.length > 0 && !initialBoundsFitted.current) {
      const bounds = L.latLngBounds(allBounds);
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      initialBoundsFitted.current = true;
    }
  }, [filteredProperties, professionals, devProjects, mapReady]);

  // Fit bounds when filters change
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;
    const allBounds: [number, number][] = filteredProperties
      .filter(p => p.latitude && p.longitude)
      .map(p => [p.latitude!, p.longitude!] as [number, number]);
    if (allBounds.length > 0) {
      const bounds = L.latLngBounds(allBounds);
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [selectedCity, selectedType, selectedListing]);

  const resetFilters = () => {
    setSelectedCity("all");
    setSelectedType("all");
    setSelectedListing("all");
  };

  const hasActiveFilters = selectedCity !== "all" || selectedType !== "all" || selectedListing !== "all";

  // Update MapLegend to include developer projects
  const legendItems = [
    { color: '#22c55e', label: 'عقارات للبيع' },
    { color: '#3b82f6', label: 'عقارات للإيجار' },
    { color: '#ef4444', label: 'جهات تمويلية' },
    { color: '#eab308', label: 'مقيمون عقاريون' },
    { color: '#c0c0c0', label: 'مكاتب عقارية' },
    { color: '#8b5cf6', label: 'مشاريع تطوير' },
  ];

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

        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Filter className="w-4 h-4" />
                <span>فلترة:</span>
              </div>
              
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="نوع العقار" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedListing} onValueChange={setSelectedListing}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="نوع الإعلان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="sale">للبيع</SelectItem>
                  <SelectItem value="rent">للإيجار</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  <X className="w-4 h-4 ml-1" />
                  مسح الفلاتر
                </Button>
              )}

              <div className="mr-auto text-sm text-muted-foreground">
                عدد النتائج: <span className="font-bold text-foreground">{filteredProperties.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-lg">
          <div className="relative h-[500px]" style={{ minHeight: '500px' }}>
            {loading ? (
              <div className="flex items-center justify-center h-full bg-muted/50">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div 
                  ref={mapContainerRef} 
                  className="w-full h-full" 
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} 
                />

                {/* Legend */}
                <MapLegend items={legendItems} className="absolute top-4 right-4 z-[1000]" />

                {/* Locate Me Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-4 left-4 z-[1000] bg-card shadow-lg h-10 w-10"
                  onClick={() => {
                    if (mapInstance.current) {
                      addUserLocationMarker(mapInstance.current, userMarkerRef.current).then(marker => {
                        userMarkerRef.current = marker;
                        if (marker) {
                          const pos = marker.getLatLng();
                          mapInstance.current?.setView(pos, 13);
                          marker.openPopup();
                        }
                      });
                    }
                  }}
                >
                  <LocateFixed className="w-5 h-5" />
                </Button>

                {/* Stats */}
                <div className="absolute top-4 left-4 bg-card rounded-lg shadow-lg p-3 z-[1000]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="font-bold">{filteredProperties.length}</span>
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

                {/* Selected Developer Project Card */}
                {selectedDevProject && (
                  <Card className="absolute bottom-4 right-4 left-4 md:left-auto md:w-80 z-[1000] shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {selectedDevProject.images?.[0] ? (
                          <img src={selectedDevProject.images[0]} alt={selectedDevProject.title} className="w-20 h-20 rounded-lg object-cover" />
                        ) : (
                          <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                            <HardHat className="w-8 h-8 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm line-clamp-1">{selectedDevProject.title}</h3>
                          {selectedDevProject.city && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{selectedDevProject.city}</span>
                            </div>
                          )}
                          {selectedDevProject.price_from && selectedDevProject.price_to && (
                            <p className="text-primary font-bold text-xs mt-1">
                              {formatPrice(selectedDevProject.price_from)} - {formatPrice(selectedDevProject.price_to)} ر.س
                            </p>
                          )}
                          <Link to={`/developer/${selectedDevProject.user_id}`}>
                            <Button size="sm" className="mt-2 w-full">
                              <Eye className="w-3 h-3 ml-1" />
                              عرض المطور
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {filteredProperties.length === 0 && !loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
                    <div className="text-center">
                      <Home className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">لا توجد عقارات مطابقة للفلاتر المحددة</p>
                      {hasActiveFilters && (
                        <Button variant="outline" size="sm" onClick={resetFilters} className="mt-3">
                          مسح الفلاتر
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center mt-8 flex flex-wrap justify-center gap-4">
          <Button size="lg" onClick={() => navigate('/map-search')} variant="hero" className="gap-2">
            <MapPin className="w-4 h-4" />
            البحث على الخريطة
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/search')} className="gap-2">
            <Search className="w-4 h-4" />
            عرض جميع العقارات
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomeMapSection;
