import L from 'leaflet';

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="
    width: 20px;
    height: 20px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.3), 0 2px 6px rgba(0,0,0,0.3);
    animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  "></div>
  <style>
    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 3px rgba(59,130,246,0.3), 0 2px 6px rgba(0,0,0,0.3); }
      50% { box-shadow: 0 0 0 8px rgba(59,130,246,0.1), 0 2px 6px rgba(0,0,0,0.3); }
      100% { box-shadow: 0 0 0 3px rgba(59,130,246,0.3), 0 2px 6px rgba(0,0,0,0.3); }
    }
  </style>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function addUserLocationMarker(
  map: L.Map,
  existingMarker?: L.Marker | null
): Promise<L.Marker | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (existingMarker) {
          existingMarker.setLatLng([latitude, longitude]);
          resolve(existingMarker);
          return;
        }

        const marker = L.marker([latitude, longitude], {
          icon: userLocationIcon,
          zIndexOffset: 1000,
        }).addTo(map);

        marker.bindPopup(
          '<div style="direction: rtl; text-align: center; font-weight: bold;">📍 موقعك الحالي</div>'
        );

        resolve(marker);
      },
      () => {
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  });
}

export { userLocationIcon };
