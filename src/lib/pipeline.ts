export const STAGES = [
  { num: 1, name: "Лид", probability: 0.05, color: "gray" },
  { num: 2, name: "Квалификация", probability: 0.15, color: "blue" },
  { num: 3, name: "Подбор / Показ", probability: 0.30, color: "indigo" },
  { num: 4, name: "КП и переговоры", probability: 0.50, color: "amber" },
  { num: 5, name: "Согласование / LOI", probability: 0.70, color: "orange" },
  { num: 6, name: "Договор", probability: 0.90, color: "teal" },
  { num: 7, name: "Закрытие / Комиссия", probability: 1.00, color: "green" },
] as const;

export const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.num, s]));

export const STUCK_DAYS_THRESHOLD = 30;

export const DEFAULT_GCI: Record<string, number> = {
  LI_RENT: 1_100_000,
  LI_SALE_LAND: 3_500_000,
  BB_RENT: 4_000_000,
  BB_SALE_LAND: 6_500_000,
  BTS_SLB_MANDATE: 10_000_000,
};

export const DEAL_TYPE_LABELS: Record<string, string> = {
  LI_RENT: "LI · Аренда",
  LI_SALE_LAND: "LI · Продажа / Земля",
  BB_RENT: "BB · Аренда",
  BB_SALE_LAND: "BB · Продажа / Земля",
  BTS_SLB_MANDATE: "BTS / SLB / Мандат",
};

export const SEGMENT_LABELS: Record<string, string> = {
  BIG_BOX: "Big Box",
  LIGHT_INDUSTRIAL: "Light Industrial",
  LAND: "Земля",
};

export const LOSS_REASON_LABELS: Record<string, string> = {
  CHOSE_ANOTHER_WITHOUT_US: "Выбрал другой объект без нас",
  WENT_TO_COMPETITOR: "Ушёл к конкуренту",
  POSTPONED_DECISION: "Отложил решение",
  BUDGET_NOT_CONFIRMED: "Бюджет не подтверждён",
  OWNER_REMOVED_OBJECT: "Собственник снял объект",
  OTHER: "Иное",
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  CALL: "Звонок",
  MEETING: "Встреча",
  VIEWING: "Показ",
  PROPOSAL_SENT: "Отправка КП",
  EMAIL: "Email",
  OTHER: "Прочее",
};

export const ACTIVITY_TYPE_ICONS: Record<string, string> = {
  CALL: "📞",
  MEETING: "🤝",
  VIEWING: "🏢",
  PROPOSAL_SENT: "📄",
  EMAIL: "✉️",
  OTHER: "📝",
};

export const STAGE_COLORS: Record<number, { bg: string; text: string; dot: string }> = {
  1: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  2: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  3: { bg: "bg-indigo-100", text: "text-indigo-700", dot: "bg-indigo-500" },
  4: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  5: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  6: { bg: "bg-teal-100", text: "text-teal-700", dot: "bg-teal-500" },
  7: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
};

export const SEGMENT_COLORS: Record<string, string> = {
  BIG_BOX: "bg-blue-50 text-blue-700",
  LIGHT_INDUSTRIAL: "bg-purple-50 text-purple-700",
  LAND: "bg-emerald-50 text-emerald-700",
};

export function getWeightedGci(expectedGci: number, stage: number): number {
  const prob = STAGE_MAP[stage]?.probability ?? 0;
  return Math.round(expectedGci * prob);
}

export function getDaysOnStage(lastChanged: Date | string): number {
  const ms = Date.now() - new Date(lastChanged).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function isStuck(lastChanged: Date | string): boolean {
  return getDaysOnStage(lastChanged) >= STUCK_DAYS_THRESHOLD;
}

export function formatGci(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")} млн ₽`;
  }
  return `${(amount / 1_000).toFixed(0)} тыс. ₽`;
}
