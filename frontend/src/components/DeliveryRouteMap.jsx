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

const deliveryIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995574.png", 
  iconSize: [32, 32],
  iconAnchor: [18, 32],
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

export default function DeliveryRouteMap({ 
  farmers, 
  buyer, 
  routeOrder, initialLocation = null, locationType = "buyer"}) {

  const center = initialLocation
    ? [initialLocation.lat, initialLocation.lng]
    : buyer
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

  const getInitialIcon = () => {
    if (locationType === "delivery") return deliveryIcon;
    return buyerIcon;
  };

  const getInitialLabel = () => {
    if (locationType === "delivery") return "Delivery Location";
    return "Your Location";
  };

  return (
    <MapContainer
      center={center}
      zoom={initialLocation? 13 : 10}
      style={{ width: "100%", height: "100%", borderRadius: "0.75rem" }}
    >
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

      
      <FitBounds
        coords={[
          ...(farmers?.map((f) => [f.latitude, f.longitude]) || []),
          ...(buyer ? [[buyer.lat, buyer.lng]] : []),
          ...(initialLocation ? [[initialLocation.lat, initialLocation.lng]] : []),
        ]}
      />

      
      {initialLocation && !routeOrder && (
        <Marker position={[initialLocation.lat, initialLocation.lng]} icon={getInitialIcon()}>
          <Popup>{getInitialLabel()}</Popup>
        </Marker>
      )}

      {buyer && routeOrder && (
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
            {f.nearestTown || f.town}, {f.county}
          </Popup>
        </Marker>
      ))}

      
      {routeCoords.length > 1 && (
        <Polyline
          positions={routeCoords}
          color="blue"
          weight={5}
          opacity={0.6}
          className="route-animation"
        />
      )}
    </MapContainer>
  );
}
