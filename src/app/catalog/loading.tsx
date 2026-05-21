export default function CatalogLoading() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-4 flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
                  <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
