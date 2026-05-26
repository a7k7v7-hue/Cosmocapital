"use client";

import { useState } from "react";

interface Props {
  objectId: string;
  objectTitle: string;
}

export default function TeaserButton({ objectId, objectTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function openTeaser() {
    setOpen(true);
    if (text) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/objects/${objectId}/teaser`);
      const data = await res.json();
      setText(data.text ?? "Ошибка генерации");
    } catch {
      setText("Ошибка загрузки тизера");
    }
    setLoading(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        onClick={openTeaser}
        className="text-green-600 hover:text-green-800 text-xs font-medium ml-3"
        title="Сгенерировать тизер для клиента"
      >
        Тизер
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-semibold text-gray-900 text-sm">Тизер для клиента</p>
                <p className="text-xs text-gray-400 truncate max-w-xs">{objectTitle}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-5 py-4">
              {loading ? (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  Генерация...
                </div>
              ) : (
                <textarea
                  readOnly
                  value={text}
                  rows={14}
                  className="w-full text-sm font-mono bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none"
                  onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                />
              )}
            </div>

            <div className="px-5 pb-4 flex gap-3">
              <button
                onClick={copy}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {copied ? "✓ Скопировано" : "Копировать"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
