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
  if (!token || !chatId) return;

  const lines = [
    "📩 *Новая заявка*",
    `👤 ${data.name}`,
    `📞 ${data.phone}`,
    data.email ? `✉️ ${data.email}` : null,
    data.objectTitle ? `🏢 ${data.objectTitle}` : null,
    data.message ? `💬 ${data.message.slice(0, 200)}` : null,
    `📍 Источник: ${data.source}`,
  ].filter(Boolean).join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lines, parse_mode: "Markdown" }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[notify] Telegram error:", err);
    }
  } catch (e) {
    console.error("[notify] Telegram fetch failed:", e);
  }
}
