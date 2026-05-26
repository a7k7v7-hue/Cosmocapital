"use client";

import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("@/components/MapClient"), { ssr: false });

type MapObject = {
  id: string; title: string; address: string; type: string;
  category: string; areaTotal: number; price: number;
  photos: string[]; lat: number; lng: number;
};

export default function MapWrapper({ objects }: { objects: MapObject[] }) {
  return <MapClient objects={objects} />;
}
