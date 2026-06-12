"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteDealButton({ dealId }: { dealId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    await fetch(`/api/admin/pipeline/${dealId}`, { method: "DELETE" });
    router.push("/admin/pipeline");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-xl transition-colors"
      >
        Удалить сделку
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 mb-2">Удалить сделку?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Это действие необратимо. Все данные по сделке, история стадий и
              активности будут удалены.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="text-sm border border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                {deleting ? "Удаляем..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
