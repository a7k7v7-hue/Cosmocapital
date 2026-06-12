"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DealFields {
  brokerName: string;
  segment: string;
  dealType: string;
  clientName: string;
  objectDescription: string;
  areaSqm: number | null;
  expectedGci: number;
  lprContact: string | null;
  leadSource: string | null;
}

export default function DuplicateDealButton({ deal }: { deal: DealFields }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function duplicate() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brokerName: deal.brokerName,
          segment: deal.segment,
          dealType: deal.dealType,
          clientName: `Копия: ${deal.clientName}`,
          objectDescription: deal.objectDescription,
          areaSqm: deal.areaSqm ?? undefined,
          expectedGci: deal.expectedGci,
          lprContact: deal.lprContact ?? undefined,
          leadSource: deal.leadSource ?? undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/pipeline/${data.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={duplicate}
      disabled={loading}
      className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
    >
      {loading ? "Создаём..." : "Дублировать"}
    </button>
  );
}
