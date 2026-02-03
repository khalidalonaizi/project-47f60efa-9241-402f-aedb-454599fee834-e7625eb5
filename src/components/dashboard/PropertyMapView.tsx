import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin } from "lucide-react";

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const propertyIcon = createCustomIcon("#22c55e"); // Green for properties
const financingIcon = createCustomIcon("#ef4444"); // Red for financing
const appraisalIcon = createCustomIcon("#3b82f6"); // Blue for appraisals
const userLocationIcon = createCustomIcon("#8b5cf6"); // Purple for user location

interface MapItem {
  id: string;
  title: string;
  price?: number;
  latitude: number;
  longitude: number;
  type: "property" | "financing" | "appraisal" | "user";
}

interface PropertyMapViewProps {
  properties: MapItem[];
  onMarkerClick?: (id: string) => void;
  showUserLocation?: boolean;
}

const PropertyMapView = ({ properties, onMarkerClick, showUserLocation = false }: PropertyMapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Default center (Riyadh)
  const defaultCenter = { lat: 24.7136, lng: 46.6753 };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(containerRef.current).setView(
      [defaultCenter.lat, defaultCenter.lng],
      6
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(mapRef.current);

    setLoading(false);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Get user location
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  }, [showUserLocation]);

  // Add markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    const bounds = L.latLngBounds([]);

    // Add property markers
    properties.forEach((item) => {
      let icon;
      switch (item.type) {
        case "financing":
          icon = financingIcon;
          break;
        case "appraisal":
          icon = appraisalIcon;
          break;
        case "user":
          icon = userLocationIcon;
          break;
        default:
          icon = propertyIcon;
      }

      const marker = L.marker([item.latitude, item.longitude], { icon }).addTo(
        mapRef.current!
      );

      const formatPrice = (price?: number) => {
        if (!price) return "";
        return new Intl.NumberFormat("ar-SA").format(price) + " ر.س";
      };

      marker.bindPopup(`
        <div style="direction: rtl; text-align: right; min-width: 150px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${item.title}</h3>
          ${item.price ? `<p style="color: #22c55e; font-weight: bold;">${formatPrice(item.price)}</p>` : ""}
        </div>
      `);

      if (onMarkerClick) {
        marker.on("click", () => onMarkerClick(item.id));
      }

      bounds.extend([item.latitude, item.longitude]);
    });

    // Add user location marker
    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], { icon: userLocationIcon })
        .addTo(mapRef.current)
        .bindPopup("<div style='direction: rtl;'>موقعك الحالي</div>");
      bounds.extend([userLocation.lat, userLocation.lng]);
    }

    // Fit bounds if we have markers
    if (properties.length > 0 || userLocation) {
      try {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      } catch (e) {
        // If bounds are invalid, center on default
        mapRef.current.setView([defaultCenter.lat, defaultCenter.lng], 6);
      }
    }
  }, [properties, userLocation, onMarkerClick]);

  return (
    <div className="relative h-[400px] rounded-lg overflow-hidden border">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" style={{ zIndex: 0 }} />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
        <p className="text-xs font-semibold mb-2">دليل الألوان</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>عقارات</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>عروض تمويل</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>طلبات تقييم</span>
          </div>
          {showUserLocation && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>موقعك</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyMapView;
