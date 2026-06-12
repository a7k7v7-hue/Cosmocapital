"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function BrokerChips({
  brokers,
  current,
}: {
  brokers: string[];
  current: string | undefined;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function select(broker: string | null) {
    const next = new URLSearchParams(params.toString());
    if (broker) next.set("broker", broker);
    else next.delete("broker");
    router.push(`/admin/pipeline?${next.toString()}`);
  }

  if (brokers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-5">
      <span className="text-xs text-gray-400 shrink-0">Брокер:</span>
      <button
        onClick={() => select(null)}
        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
          !current
            ? "bg-gray-900 text-white border-gray-900"
            : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
        }`}
      >
        Все
      </button>
      {brokers.map((b) => (
        <button
          key={b}
          onClick={() => select(b)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            current === b
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
          }`}
        >
          {b}
        </button>
      ))}
    </div>
  );
}
