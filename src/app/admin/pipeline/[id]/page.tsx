import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { canEdit as roleCanEdit, canDelete as roleCanDelete } from "@/lib/roles";

const OBJ_TYPE_LABELS: Record<string, string> = { RENT: "Аренда", SALE: "Продажа" };
const OBJ_CAT_LABELS: Record<string, string> = {
  OFFICE: "Офис", RETAIL: "Ритейл", WAREHOUSE: "Склад",
  FREE_PURPOSE: "СНП", PRODUCTION: "Производство",
};
import { prisma } from "@/lib/prisma";
import {
  STAGES,
  DEAL_TYPE_LABELS,
  SEGMENT_LABELS,
  LOSS_REASON_LABELS,
  STAGE_COLORS,
  SEGMENT_COLORS,
  getWeightedGci,
  getDaysOnStage,
  isStuck,
  formatGci,
  STUCK_DAYS_THRESHOLD,
} from "@/lib/pipeline";
import StageChanger from "@/components/admin/pipeline/StageChanger";
import ActivityLog from "@/components/admin/pipeline/ActivityLog";
import DealForm from "@/components/admin/pipeline/DealForm";
import QualificationChecklist from "@/components/admin/pipeline/QualificationChecklist";
import type { QualData } from "@/components/admin/pipeline/QualificationChecklist";
import CloseWithGci from "@/components/admin/pipeline/CloseWithGci";
import ReEngagementDate from "@/components/admin/pipeline/ReEngagementDate";
import DeleteDealButton from "@/components/admin/pipeline/DeleteDealButton";
import DuplicateDealButton from "@/components/admin/pipeline/DuplicateDealButton";

async function getDeal(id: string) {
  try {
    return await prisma.deal.findUnique({
      where: { id },
      include: {
        stageChanges: { orderBy: { changedAt: "desc" } },
        activities: { orderBy: { activityDate: "desc" } },
        linkedObject: { select: { id: true, title: true, address: true, type: true, category: true } },
      },
    });
  } catch {
    return null;
  }
}

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, sessionUser] = await Promise.all([params, getSessionUser()]);
  const userCanEdit = roleCanEdit(sessionUser?.role ?? "RESEARCH");
  const userCanDelete = roleCanDelete(sessionUser?.role ?? "RESEARCH");
  const deal = await getDeal(id);
  if (!deal) notFound();

  const daysOnStage = getDaysOnStage(deal.lastStageChangedAt);
  const stuck = isStuck(deal.lastStageChangedAt);
  const weightedGci = getWeightedGci(deal.expectedGci, deal.stage);
  const stage = STAGES[deal.stage - 1];
  const sc = STAGE_COLORS[deal.stage] ?? STAGE_COLORS[1];
  const segColor = SEGMENT_COLORS[deal.segment] ?? "bg-gray-50 text-gray-600";

  const serializedActivities = deal.activities.map((a) => ({
    ...a,
    activityDate: a.activityDate.toISOString(),
    createdAt: a.createdAt.toISOString(),
  }));

  const serializedInitialData = {
    id: deal.id,
    brokerName: deal.brokerName,
    segment: deal.segment,
    dealType: deal.dealType,
    clientName: deal.clientName,
    objectDescription: deal.objectDescription,
    areaSqm: deal.areaSqm,
    expectedGci: deal.expectedGci,
    expectedCloseDate: deal.expectedCloseDate?.toISOString() ?? null,
    lprContact: deal.lprContact,
    leadSource: deal.leadSource,
    nextActionDate: deal.nextActionDate?.toISOString() ?? null,
    nextActionDesc: deal.nextActionDesc,
    notes: deal.notes,
    objectId: deal.objectId,
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/pipeline" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Пайплайн
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-sm text-gray-600 truncate max-w-xs">{deal.clientName}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-gray-900 truncate">{deal.clientName}</h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${segColor}`}>
              {SEGMENT_LABELS[deal.segment]}
            </span>
            <span className="text-xs text-gray-400">{DEAL_TYPE_LABELS[deal.dealType]}</span>
          </div>
          <p className="text-sm text-gray-500">{deal.objectDescription}</p>
          {deal.areaSqm && (
            <p className="text-xs text-gray-400 mt-0.5">{deal.areaSqm.toLocaleString("ru")} кв.м</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {stuck && !deal.isLost && !deal.isClosed && (
            <span className="text-xs font-medium bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Завис {daysOnStage}д
            </span>
          )}
          {!deal.isLost && !deal.isClosed && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {stage?.num}. {stage?.name}
            </span>
          )}
          {userCanEdit && (
            <DuplicateDealButton deal={{
              brokerName: deal.brokerName,
              segment: deal.segment,
              dealType: deal.dealType,
              clientName: deal.clientName,
              objectDescription: deal.objectDescription,
              areaSqm: deal.areaSqm,
              expectedGci: deal.expectedGci,
              lprContact: deal.lprContact,
              leadSource: deal.leadSource,
            }} />
          )}
          {userCanDelete && <DeleteDealButton dealId={deal.id} />}
        </div>
      </div>

      {/* Loss info banner */}
      {deal.isLost && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm">
          <span className="font-medium text-red-700">Сделка проиграна.</span>{" "}
          {deal.lossReason && (
            <span className="text-red-600">{LOSS_REASON_LABELS[deal.lossReason]}</span>
          )}
          {deal.lossComment && (
            <span className="text-red-500"> — {deal.lossComment}</span>
          )}
        </div>
      )}

      {deal.isClosed && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 text-sm">
          <span className="font-medium text-green-700">Сделка закрыта.</span>{" "}
          {deal.actualGci && (
            <span className="text-green-600">GCI получен: {formatGci(deal.actualGci)}</span>
          )}
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border px-4 py-3" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <div className="text-xs text-gray-500 mb-0.5">Ожидаемый GCI</div>
          <div className="font-bold" style={{ color: "#166534" }}>{formatGci(deal.expectedGci)}</div>
        </div>
        <div className="rounded-xl border px-4 py-3" style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>
          <div className="text-xs text-gray-500 mb-0.5">Взвешенный GCI</div>
          <div className="font-bold" style={{ color: "#1e40af" }}>{formatGci(weightedGci)}</div>
          <div className="text-xs text-gray-400">{Math.round((stage?.probability ?? 0) * 100)}% вероятность</div>
        </div>
        <div
          className="rounded-xl border px-4 py-3"
          style={{
            background: stuck ? "#fef2f2" : "#f8fafc",
            borderColor: stuck ? "#fecaca" : "#e2e8f0",
          }}
        >
          <div className="text-xs text-gray-500 mb-0.5">Дней на стадии</div>
          <div className="font-bold" style={{ color: stuck ? "#991b1b" : "#1e293b" }}>{daysOnStage}</div>
          {stuck && <div className="text-xs" style={{ color: "#f87171" }}>порог {STUCK_DAYS_THRESHOLD}д</div>}
        </div>
        <div className="rounded-xl border px-4 py-3" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
          <div className="text-xs text-gray-500 mb-0.5">Брокер</div>
          <div className="font-medium text-gray-900 text-sm truncate">{deal.brokerName}</div>
        </div>
      </div>

      {/* Next action alert */}
      {deal.nextActionDate && !deal.isLost && !deal.isClosed && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          <div>
            <span className="text-sm font-medium text-blue-800">
              Следующий шаг:{" "}
              {new Date(deal.nextActionDate).toLocaleDateString("ru-RU", {
                day: "numeric", month: "long",
              })}
            </span>
            {deal.nextActionDesc && (
              <span className="text-sm text-blue-600"> — {deal.nextActionDesc}</span>
            )}
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Stage + details */}
        <div className="lg:col-span-1 space-y-4">
          {userCanEdit ? (
            <StageChanger
              dealId={deal.id}
              currentStage={deal.stage}
              isLost={deal.isLost}
              isClosed={deal.isClosed}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-gray-500">
              Стадия: <strong className="text-gray-800">{stage?.num}. {stage?.name}</strong>
            </div>
          )}

          {/* Deal metadata */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 text-sm">
            <h3 className="font-semibold text-gray-900">Детали</h3>
            {deal.lprContact && (
              <Row label="ЛПР" value={deal.lprContact} />
            )}
            {deal.leadSource && (
              <Row label="Источник лида" value={deal.leadSource} />
            )}
            {deal.expectedCloseDate && (
              <Row
                label="Дата закрытия"
                value={new Date(deal.expectedCloseDate).toLocaleDateString("ru-RU", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              />
            )}
            <Row
              label="Создана"
              value={new Date(deal.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric", month: "short", year: "numeric",
              })}
            />
            <Row label="Касаний" value={String(deal.activities.length)} />
          </div>

          {/* Linked catalog object */}
          {deal.linkedObject && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Объект из каталога</h3>
              <Link
                href={`/admin/catalog/${deal.linkedObject.id}`}
                className="block hover:bg-blue-50 rounded-xl p-3 -m-3 transition-colors group"
              >
                <div className="text-sm font-medium text-gray-800 group-hover:text-blue-700 truncate">
                  {deal.linkedObject.title}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">
                  {deal.linkedObject.address}
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    {OBJ_TYPE_LABELS[deal.linkedObject.type] ?? deal.linkedObject.type}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                    {OBJ_CAT_LABELS[deal.linkedObject.category] ?? deal.linkedObject.category}
                  </span>
                </div>
              </Link>
            </div>
          )}

          {/* Stage history */}
          {deal.stageChanges.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">История стадий</h3>
              <div className="space-y-2">
                {deal.stageChanges.map((sc) => (
                  <div key={sc.id} className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">
                      {STAGES[sc.fromStage - 1]?.name ?? sc.fromStage} → {STAGES[sc.toStage - 1]?.name ?? sc.toStage}
                    </span>
                    <span className="text-gray-400 ml-2">
                      {new Date(sc.changedAt).toLocaleDateString("ru-RU", {
                        day: "numeric", month: "short",
                      })}
                    </span>
                    {sc.comment && <p className="text-gray-400 mt-0.5 italic">{sc.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Edit form + activity log */}
        <div className="lg:col-span-2 space-y-4">
          {userCanEdit ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Редактировать сделку</h3>
              <DealForm initialData={serializedInitialData} mode="edit" />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-amber-700">
              Просмотр — редактирование недоступно для вашей роли.
            </div>
          )}

          <ActivityLog dealId={deal.id} activities={serializedActivities} canEdit={userCanEdit} />

          <QualificationChecklist
            dealId={deal.id}
            initialData={(deal.qualificationData as unknown as QualData) ?? null}
            stage={deal.stage}
            canEdit={userCanEdit}
          />

          {userCanEdit && deal.isClosed && (
            <CloseWithGci dealId={deal.id} currentActualGci={deal.actualGci} />
          )}

          {userCanEdit && deal.isLost && (
            <ReEngagementDate
              dealId={deal.id}
              currentDate={deal.reEngagementDate?.toISOString() ?? null}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 flex-shrink-0 w-28">{label}</span>
      <span className="text-gray-700 flex-1">{value}</span>
    </div>
  );
}
