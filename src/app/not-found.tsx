import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold text-blue-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Страница не найдена</h1>
        <p className="text-gray-500 mb-8">
          Возможно, объект был снят с публикации или ссылка устарела.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/catalog"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Смотреть каталог
          </Link>
          <Link
            href="/"
            className="border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
