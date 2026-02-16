import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { addUserLocationMarker } from "@/lib/mapUserLocation";

interface PropertyLocationMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
}

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const PropertyLocationMap = ({ latitude, longitude, title, address }: PropertyLocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize the map
    mapInstance.current = L.map(mapRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    // Add marker with custom icon
    const customIcon = L.divIcon({
      className: 'custom-property-marker',
      html: `<div style="
        background-color: #14B8A6;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(mapInstance.current);

    // Add popup
    const popupContent = `
      <div style="direction: rtl; text-align: right; min-width: 150px;">
        <h3 style="margin: 0 0 4px; font-weight: bold; font-size: 14px;">${title}</h3>
        ${address ? `<p style="margin: 0; color: #666; font-size: 12px;">${address}</p>` : ''}
      </div>
    `;
    marker.bindPopup(popupContent).openPopup();

    // Add user location marker
    addUserLocationMarker(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [latitude, longitude, title, address]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: '300px' }} />
  );
};

export default PropertyLocationMap;
