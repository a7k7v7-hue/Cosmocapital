"use client";

import { useState } from "react";
import Image from "next/image";

interface PhotoGalleryProps {
  photos: string[];
  title: string;
}

export default function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (photos.length === 0) {
    return (
      <div className="h-80 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 text-6xl">
        🏢
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div
          className="relative h-80 bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={photos[active]}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        </div>

        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === active ? "border-blue-600" : "border-transparent"
                }`}
              >
                <Image
                  src={src}
                  alt={`${title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl leading-none"
            onClick={() => setLightbox(false)}
          >
            ×
          </button>
          {active > 0 && (
            <button
              className="absolute left-4 text-white text-3xl px-3 py-2"
              onClick={(e) => { e.stopPropagation(); setActive(active - 1); }}
            >
              ‹
            </button>
          )}
          <div
            className="relative w-full max-w-4xl h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[active]}
              alt={title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          {active < photos.length - 1 && (
            <button
              className="absolute right-4 text-white text-3xl px-3 py-2"
              onClick={(e) => { e.stopPropagation(); setActive(active + 1); }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </>
  );
}
