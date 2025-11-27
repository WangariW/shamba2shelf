import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


const farmerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/619/619034.png", 
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const buyerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", 
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [coords, map]);
  return null;
}

export default function DeliveryRouteMap({ farmers, buyer, routeOrder }) {
  const center = buyer
    ? [buyer.lat, buyer.lng]
    : farmers?.length
    ? [farmers[0].latitude, farmers[0].longitude]
    : [-1.2921, 36.8219];

  const routeCoords = useMemo(() => {
    if (!farmers || !routeOrder || routeOrder.length === 0) return [];
    const coords = routeOrder.map((idx) => [
      farmers[idx].latitude,
      farmers[idx].longitude,
    ]);
    if (buyer) coords.push([buyer.lat, buyer.lng]);
    return coords;
  }, [farmers, routeOrder, buyer]);

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ width: "100%", height: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

      
      <FitBounds
        coords={[
          ...(farmers?.map((f) => [f.latitude, f.longitude]) || []),
          ...(buyer ? [[buyer.lat, buyer.lng]] : []),
        ]}
      />

      
      {buyer && (
        <Marker position={[buyer.lat, buyer.lng]} icon={buyerIcon}>
          <Popup>Buyer Location</Popup>
        </Marker>
      )}

      
      {farmers?.map((f) => (
        <Marker
          key={f._id}
          position={[f.latitude, f.longitude]}
          icon={farmerIcon}
        >
          <Popup>
            {f.firstName} {f.lastName} <br />
            {f.town}, {f.county}
          </Popup>
        </Marker>
      ))}

      
      {routeCoords.length > 1 && (
        <Polyline
          positions={routeCoords}
          color="blue"
          weight={5}
          opacity={0.8}
          className="route-animation"
        />
      )}
    </MapContainer>
  );
}
