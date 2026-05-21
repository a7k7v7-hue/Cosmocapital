"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export default function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        uploaded.push(data.url);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "Ошибка загрузки");
        break;
      }
    }

    setUploading(false);
    if (uploaded.length > 0) onChange([...photos, ...uploaded]);
  }

  function remove(url: string) {
    onChange(photos.filter((p) => p !== url));
  }

  function moveLeft(i: number) {
    if (i === 0) return;
    const next = [...photos];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((url, i) => (
            <div key={url} className="relative group">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                <Image src={url} alt={`Фото ${i + 1}`} fill className="object-cover" sizes="96px" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 bg-black/40 rounded-lg transition-opacity">
                {i > 0 && (
                  <button type="button" onClick={() => moveLeft(i)}
                    className="text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
                    ←
                  </button>
                )}
                <button type="button" onClick={() => remove(url)}
                  className="text-white text-xs bg-red-500/80 px-1.5 py-0.5 rounded">
                  ✕
                </button>
              </div>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-blue-600 text-white px-1 rounded">
                  Гл.
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl px-4 py-3 text-sm text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50"
      >
        {uploading ? "Загрузка..." : "+ Добавить фото (JPEG, PNG, WebP — до 10 МБ)"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
