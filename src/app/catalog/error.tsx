"use client";

export default function CatalogError({ reset }: { reset: () => void }) {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-sm">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Не удалось загрузить каталог</h2>
        <p className="text-gray-500 text-sm mb-6">Попробуйте обновить страницу</p>
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
