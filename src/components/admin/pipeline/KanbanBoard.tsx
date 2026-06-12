import Link from "next/link";
import {
  STAGES,
  STAGE_COLORS,
  SEGMENT_COLORS,
  SEGMENT_LABELS,
  formatGci,
} from "@/lib/pipeline";

const APPROACHING_DAYS = 20;

interface KanbanDeal {
  id: string;
  clientName: string;
  brokerName: string;
  segment: string;
  dealType: string;
  stage: number;
  expectedGci: number;
  weightedGci: number;
  daysOnStage: number;
  isStuck: boolean;
  isApproachingStuck: boolean;
  isActionOverdue: boolean;
  hasNoNextAction: boolean;
}

export default function KanbanBoard({ deals }: { deals: KanbanDeal[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[400px]">
      {STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage.num);
        const sc = STAGE_COLORS[stage.num];
        const weightedSum = stageDeals.reduce((s, d) => s + d.weightedGci, 0);

        return (
          <div key={stage.num} className="flex-shrink-0 w-60">
            {/* Column header */}
            <div className={`rounded-xl px-3 py-2.5 mb-2 ${sc.bg}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${sc.text}`}>
                  {stage.num}. {stage.name}
                </span>
                <span className={`text-xs font-bold ${sc.text}`}>
                  {stageDeals.length}
                </span>
              </div>
              {weightedSum > 0 && (
                <div className={`text-xs mt-0.5 opacity-75 ${sc.text}`}>
                  {formatGci(weightedSum)}
                </div>
              )}
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2">
              {stageDeals.length === 0 && (
                <div className="text-xs text-gray-300 text-center py-4">—</div>
              )}
              {stageDeals.map((d) => (
                <KanbanCard key={d.id} deal={d} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ deal: d }: { deal: KanbanDeal }) {
  const segColor = SEGMENT_COLORS[d.segment] ?? "bg-gray-50 text-gray-600";

  const borderClass = d.isStuck
    ? "border-red-300 bg-red-50/30"
    : d.isApproachingStuck
    ? "border-amber-300 bg-amber-50/20"
    : "border-gray-100 bg-white";

  return (
    <Link
      href={`/admin/pipeline/${d.id}`}
      className={`block rounded-xl border p-3 hover:shadow-sm transition-all group ${borderClass}`}
    >
      <div className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-700 transition-colors">
        {d.clientName}
      </div>
      <div className="text-xs text-gray-400 mt-0.5 truncate">{d.brokerName}</div>

      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${segColor}`}>
          {SEGMENT_LABELS[d.segment] ?? d.segment}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs font-semibold text-gray-700">
          {formatGci(d.expectedGci)}
        </span>
        {d.isStuck ? (
          <span className="text-xs font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">
            {d.daysOnStage}д
          </span>
        ) : d.isApproachingStuck ? (
          <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
            {d.daysOnStage}д
          </span>
        ) : d.daysOnStage > 0 ? (
          <span className="text-xs text-gray-400">{d.daysOnStage}д</span>
        ) : null}
      </div>

      {(d.isActionOverdue || d.hasNoNextAction) && !d.isStuck && (
        <div className="mt-1.5 text-xs text-amber-600">
          {d.isActionOverdue ? "просрочен шаг" : "нет шага"}
        </div>
      )}
    </Link>
  );
}

export const APPROACHING_STUCK_DAYS = APPROACHING_DAYS;
