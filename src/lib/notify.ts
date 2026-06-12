async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
    });
    if (!res.ok) console.error("[notify] Telegram error:", await res.text());
  } catch (e) {
    console.error("[notify] Telegram fetch failed:", e);
  }
}

export async function notifyStuckDeals(deals: {
  clientName: string;
  brokerName: string;
  stage: number;
  stageName: string;
  daysOnStage: number;
  expectedGci: number;
}[]) {
  if (deals.length === 0) return;
  const lines = [
    `⚠️ *Зависшие сделки (${deals.length})*`,
    "",
    ...deals.map((d) =>
      `• *${d.clientName}* — ${d.brokerName}\n  Стадия ${d.stage}: ${d.stageName}, ${d.daysOnStage}д`
    ),
    "",
    `Требуют решения на планёрке.`,
  ];
  await sendTelegram(lines.join("\n"));
}

type ActionDeal = {
  clientName: string;
  brokerName: string;
  stage: number;
  nextActionDate: Date | null;
  nextActionDesc: string | null;
};

function fmtDate(d: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export async function sendDailyDigest({
  overdue,
  today,
}: {
  overdue: ActionDeal[];
  today: ActionDeal[];
}) {
  if (overdue.length === 0 && today.length === 0) return;

  const lines: string[] = ["📋 *Ежедневный дайджест задач*", ""];

  if (overdue.length > 0) {
    lines.push(`🔴 *Просрочено (${overdue.length})*`);
    for (const d of overdue) {
      lines.push(
        `• *${d.clientName}* — ${d.brokerName} (ст. ${d.stage})` +
        (d.nextActionDesc ? `\n  ${d.nextActionDesc}` : "") +
        `\n  📅 ${fmtDate(d.nextActionDate)}`
      );
    }
    lines.push("");
  }

  if (today.length > 0) {
    lines.push(`📅 *Сегодня (${today.length})*`);
    for (const d of today) {
      lines.push(
        `• *${d.clientName}* — ${d.brokerName} (ст. ${d.stage})` +
        (d.nextActionDesc ? `\n  ${d.nextActionDesc}` : "")
      );
    }
  }

  await sendTelegram(lines.join("\n"));
}

// Auto-notify when a deal advances to a key stage (4 = КП, 6 = Договор, 7 = Закрытие).
export async function notifyStageAdvanced(deal: {
  clientName: string;
  brokerName: string;
  stage: number;
  stageName: string;
  expectedGci: number;
}) {
  const milestones: Record<number, string> = {
    4: "📄 *КП и переговоры*",
    5: "🤝 *Согласование / LOI*",
    6: "📝 *Договор подписан*",
    7: "🎉 *Сделка закрыта!*",
  };
  const emoji = milestones[deal.stage];
  if (!emoji) return;

  const gciM = (deal.expectedGci / 1_000_000).toFixed(1).replace(/\.0$/, "");
  const lines = [
    emoji,
    `👤 *${deal.clientName}* — ${deal.brokerName}`,
    `Стадия ${deal.stage}: ${deal.stageName}`,
    `GCI: ${gciM} млн ₽`,
  ];
  await sendTelegram(lines.join("\n"));
}

// Telegram notification for new leads.
// Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Render Environment to enable.
export async function notifyNewLead(data: {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  source: string;
  objectTitle?: string | null;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[notify] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipping");
    return;
  }

  const lines = [
    "📩 *Новая заявка*",
    `👤 ${data.name}`,
    `📞 ${data.phone}`,
    data.email ? `✉️ ${data.email}` : null,
    data.objectTitle ? `🏢 ${data.objectTitle}` : null,
    data.message ? `💬 ${data.message.slice(0, 200)}` : null,
    `📍 Источник: ${data.source}`,
  ].filter(Boolean).join("\n");

  await sendTelegram(lines);
}
