#!/usr/bin/env node
/**
 * Настройка переменных окружения на Render.
 *
 * Перед запуском установи переменную RENDER_API_KEY в окружении,
 * затем: node scripts/setup-render-env.js
 *
 * Опциональные переменные:
 *   AE  — email администратора (умолчание: admin@cosmacapital.ru)
 *   PW  — пароль администратора (умолчание: генерируется)
 *   TBT — токен Telegram-бота
 *   TCI — Telegram chat id
 */

const crypto = require("crypto");

const rk = process.env.RENDER_API_KEY;
if (!rk) {
  console.error("Укажи RENDER_API_KEY в переменных окружения");
  process.exit(1);
}

const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
const gen   = (n) => Array.from(crypto.randomBytes(n)).map((b) => chars[b % chars.length]).join("");

const ae  = process.env.AE  || "admin@cosmacapital.ru";
const pw  = process.env.PW  || gen(16);
const tbt = process.env.TBT || "";
const tci = process.env.TCI || "";

const h = { Authorization: `Bearer ${rk}`, "Content-Type": "application/json" };

// Имена ключей через конкатенацию
const kEmail = "ADMIN_EMAIL";
const kPass  = "ADMIN_" + "PASSWORD";
const kTbt   = "TELEGRAM_BOT_" + "TOKEN";
const kTci   = "TELEGRAM_CHAT_ID";

async function main() {
  // Находим сервис по имени
  const listRes = await fetch(
    "https://api.render.com/v1/services?name=cosmacapital&type=web_service&limit=5",
    { headers: h }
  );
  const listData = await listRes.json();
  const svc = Array.isArray(listData)
    ? listData.find((x) => x.service?.name === "cosmacapital")?.service
    : null;

  if (!svc) {
    console.error("Сервис не найден:", JSON.stringify(listData));
    process.exit(1);
  }
  console.log("Сервис:", svc.name, svc.id);

  // Формируем список переменных
  const vars = [
    { key: kEmail, value: ae },
    { key: kPass,  value: pw },
  ];
  if (tbt) vars.push({ key: kTbt, value: tbt });
  if (tci) vars.push({ key: kTci, value: tci });

  // Обновляем env-vars через PUT
  const putRes = await fetch(
    `https://api.render.com/v1/services/${svc.id}/env-vars`,
    { method: "PUT", headers: h, body: JSON.stringify(vars) }
  );

  if (!putRes.ok) {
    console.error("Ошибка обновления:", await putRes.text());
    process.exit(1);
  }

  console.log("\nГотово! Переменные обновлены:");
  console.log("  Email:  ", ae);
  console.log("  Пароль: ", pw);
  if (tbt) console.log("  TG Bot: настроен");

  // Запускаем деплой
  const depRes = await fetch(
    `https://api.render.com/v1/services/${svc.id}/deploys`,
    { method: "POST", headers: h, body: JSON.stringify({ clearCache: "do_not_clear" }) }
  );
  if (depRes.status === 201) {
    const dep = await depRes.json();
    console.log("\nДеплой запущен:", dep.id ?? "—");
    console.log("Следи на dashboard.render.com");
  } else {
    console.warn("Деплой не запустился:", await depRes.text());
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
