"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TYPE_LABELS, CATEGORY_LABELS } from "@/types/objects";

interface MapObject {
  id: string;
  title: string;
  address: string;
  type: string;
  category: string;
  areaTotal: number;
  price: number;
  photos: string[];
  lat: number;
  lng: number;
}

// Custom marker using KK dark blue
function createMarker(featured: boolean) {
  const color = featured ? "#7cb342" : "#0e2a5e";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="38" viewBox="0 0 28 38">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 24 14 24S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="5.5" fill="#fff"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -40],
  });
}

function FitBounds({ objects }: { objects: MapObject[] }) {
  const map = useMap();
  useEffect(() => {
    if (objects.length === 0) return;
    const bounds = L.latLngBounds(objects.map((o) => [o.lat, o.lng]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
  }, [map, objects]);
  return null;
}

export default function MapClient({ objects }: { objects: MapObject[] }) {
  return (
    <MapContainer
      center={[55.75, 37.62]}
      zoom={11}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds objects={objects} />
      {objects.map((obj) => (
        <Marker
          key={obj.id}
          position={[obj.lat, obj.lng]}
          icon={createMarker(false)}
        >
          <Popup maxWidth={260} minWidth={220}>
            <div style={{ fontFamily: "system-ui, sans-serif" }}>
              {obj.photos[0] && (
                <img
                  src={obj.photos[0]}
                  alt={obj.title}
                  style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 6, marginBottom: 10, display: "block" }}
                />
              )}
              <div style={{ fontSize: 12, color: "#6b7080", marginBottom: 3 }}>
                {CATEGORY_LABELS[obj.category as keyof typeof CATEGORY_LABELS]} · {TYPE_LABELS[obj.type as keyof typeof TYPE_LABELS]}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0e2a5e", marginBottom: 4, lineHeight: 1.3 }}>
                {obj.title}
              </div>
              <div style={{ fontSize: 12, color: "#6b7080", marginBottom: 6 }}>{obj.address}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10 }}>
                <span style={{ color: "#1a1f2e" }}>{obj.areaTotal} м²</span>
                <span style={{ fontWeight: 600, color: "#0e2a5e" }}>
                  По запросу
                </span>
              </div>
              <a
                href={`/catalog/${obj.id}`}
                style={{
                  display: "block", textAlign: "center", background: "#0e2a5e", color: "#fff",
                  padding: "8px 0", borderRadius: 6, fontSize: 12, fontWeight: 500, textDecoration: "none",
                }}
              >
                Подробнее
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
