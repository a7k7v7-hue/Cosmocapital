#!/usr/bin/env node
// Полный цикл локального запуска kosmocapital одной командой: npm run start-local
// PostgreSQL -> БД -> .env -> npm install -> db:generate -> db:migrate -> db:seed -> npm run dev
//
// Не трогает: существующий .env, node_modules, БД если она уже с данными.

const { spawn, spawnSync, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const net = require("net");

const ROOT = path.resolve(__dirname, "..");
const HANG_WARN_MS = 60_000;
const PG_CONNECT_TIMEOUT_MS = 15_000;
const DEV_PORT = 3010;
const EXPECTED_OBJECTS = 6; // prisma/seed.ts — демо-набор, а не 44 из SQL-файлов

const PG_USER = process.env.PG_USER || "postgres";
const pw = process.env.PG_PASSWORD || "postgres";
const PG_HOST = process.env.PG_HOST || "localhost";
const PG_PORT = process.env.PG_PORT || "5432";
const PG_DATABASE = "kosmocapital";

function log(line) {
  console.log(line);
}

function block(lines) {
  console.log(["", ...lines, ""].join("\n"));
}

function fail(lines) {
  block(lines);
  process.exit(1);
}

// Windows-редакторы часто пишут .env с UTF-8 BOM — без strip() ломает ^-якоря
// в регулярках (DATABASE_URL казался отсутствующим, хотя был первой строкой).
function readEnvFile(envPath) {
  const raw = fs.readFileSync(envPath, "utf-8");
  const bomCharCode = 0xfeff;
  return raw.charCodeAt(0) === bomCharCode ? raw.slice(1) : raw;
}

// ── 0. Node.js / структура репо (переиспользуем check-setup.js) ────────────
function runCheckSetup() {
  const result = spawnSync(process.execPath, [path.join(__dirname, "check-setup.js")], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    fail(["❌ check-setup не пройден — исправь ошибки выше и запусти npm run start-local заново."]);
  }
}

// ── 1. Проверка PostgreSQL ──────────────────────────────────────────────────
function checkPsqlVersion() {
  const result = spawnSync("psql", ["--version"], { encoding: "utf-8", timeout: PG_CONNECT_TIMEOUT_MS });
  if (result.error || result.status !== 0) {
    fail([
      "❌ PostgreSQL не найден (psql --version вернул ошибку)",
      "",
      "Установи PostgreSQL:",
      "- Скачай с postgresql.org (версия 15+)",
      "- После установки перезагрузи PowerShell",
      "- Запусти заново: npm run start-local",
      "",
      "Или используй облачную БД:",
      "- Render.com — создай PostgreSQL сервис",
      "- Скопируй DATABASE_URL из Render",
      "- Вставь в .env под переменную DATABASE_URL",
      "- Запусти заново: npm run start-local",
    ]);
  }
  log(`✅ ${result.stdout.trim()} найден`);
}

// ── 2. Проверка/создание БД kosmocapital ────────────────────────────────────
function psqlEnv() {
  const env = { ...process.env };
  env.PGPASSWORD = pw;
  return env;
}

function dbConnectionErrorHelp(detail) {
  fail([
    "❌ Не удалось подключиться к PostgreSQL:",
    (detail || "").toString().trim(),
    "",
    "Проверь:",
    `1. Логин/пароль — сейчас используется ${PG_USER} (задай PG_USER / PG_PASSWORD в переменных окружения, если у тебя другие)`,
    "2. PostgreSQL запущен и доступен",
    "3. Если используешь облачную БД — пропиши готовый DATABASE_URL прямо в .env",
  ]);
}

function checkOrCreateDatabase() {
  const baseArgs = ["-U", PG_USER, "-h", PG_HOST, "-p", String(PG_PORT)];
  const env = psqlEnv();

  const list = spawnSync("psql", [...baseArgs, "-lqt"], {
    encoding: "utf-8",
    env,
    timeout: PG_CONNECT_TIMEOUT_MS,
  });
  if (list.error || list.status !== 0) {
    dbConnectionErrorHelp(list.stderr || list.error?.message);
  }

  const exists = list.stdout.split("\n").some((line) => line.split("|")[0].trim() === PG_DATABASE);
  if (exists) {
    log(`✅ БД ${PG_DATABASE} уже существует`);
    return;
  }

  const create = spawnSync("psql", [...baseArgs, "-c", `CREATE DATABASE ${PG_DATABASE};`], {
    encoding: "utf-8",
    env,
    timeout: PG_CONNECT_TIMEOUT_MS,
  });
  if (create.error || create.status !== 0) {
    dbConnectionErrorHelp(create.stderr || create.error?.message);
  }
  log(`✅ БД ${PG_DATABASE} создана`);
}

// ── 3. .env ──────────────────────────────────────────────────────────────
function ensureEnvFile() {
  const envPath = path.join(ROOT, ".env");
  const envExamplePath = path.join(ROOT, ".env.example");

  if (fs.existsSync(envPath)) {
    const content = readEnvFile(envPath);
    const match = content.match(/^DATABASE_URL=(.*)$/m);
    log("✅ .env уже существует (не перезаписан)");
    if (match && match[1] && !/localhost|127\.0\.0\.1/.test(match[1])) {
      log("⚠️  DATABASE_URL в .env указывает не на localhost — миграции и сид отработают против этой БД.");
    } else {
      log("ℹ️  Проверь DATABASE_URL в .env, если используется не локальный PostgreSQL.");
    }
    return;
  }

  if (!fs.existsSync(envExamplePath)) {
    fail(["❌ .env.example не найден — сначала запусти: npm run check-setup"]);
  }

  fs.copyFileSync(envExamplePath, envPath);
  const url = `postgresql://${PG_USER}:${pw}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`;
  const filled = readEnvFile(envPath).replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${url}`);
  fs.writeFileSync(envPath, filled, "utf-8");
  log(`✅ .env создан из .env.example (DATABASE_URL=${url})`);
}

// ── 4-8. Последовательные npm-команды ───────────────────────────────────────
// npm на Windows — это npm.cmd, spawn без shell его не резолвит, поэтому
// shell:true необходим. Но shell:true + args-массив даёт предупреждение
// DEP0190 (Node не экранирует args, только склеивает пробелом). Аргументы
// npm простые (без пробелов/спецсимволов), поэтому собираем команду одной
// строкой сами и передаём БЕЗ args-массива — так DEP0190 не возникает.
function runCommand(label, npmArgs, { hangWarn = true, dbHelp = false } = {}) {
  return new Promise((resolve) => {
    const commandLine = ["npm", ...npmArgs].join(" ");
    const child = spawn(commandLine, { cwd: ROOT, stdio: "inherit", shell: true });

    let warnTimer = null;
    if (hangWarn) {
      warnTimer = setInterval(() => {
        log(`⏳ "${label}" выполняется дольше 60 сек. Если зависло — Ctrl+C, затем разберись по логу выше.`);
      }, HANG_WARN_MS);
    }

    const finish = (code) => {
      if (warnTimer) clearInterval(warnTimer);
      if (code === 0) {
        log(`✅ ${label} ✓`);
        resolve(true);
        return;
      }
      const lines = [`❌ ${label} завершился с ошибкой (exit code ${code}). Смотри лог выше.`];
      if (dbHelp) {
        lines.push(
          "",
          "Проверь:",
          "1. DATABASE_URL в .env правильный",
          "2. PostgreSQL запущен и доступен",
          "3. БД kosmocapital существует и пуста"
        );
      }
      block(lines);
      resolve(false);
    };

    child.on("exit", finish);
    child.on("error", (err) => finish(err.message === undefined ? 1 : 1));
  });
}

// ── проверка пустоты БД перед db:seed (отдельно от guard по домену —
//    тот не ловит localhost с реальными данными) ──────────────────────────
function assertEmptyBeforeSeed() {
  if (process.env.ALLOW_SEED_NONEMPTY === "true") {
    log("ℹ️  ALLOW_SEED_NONEMPTY=true — проверка пустоты БД перед db:seed пропущена осознанно.");
    return;
  }

  const databaseUrl = parseDatabaseUrl();
  if (!databaseUrl) {
    log("⚠️  DATABASE_URL не найден в .env — пропускаю проверку пустоты БД перед db:seed.");
    return;
  }

  const result = spawnSync("psql", [databaseUrl, "-t", "-c", "SELECT COUNT(*) FROM objects;"], {
    encoding: "utf-8",
    timeout: PG_CONNECT_TIMEOUT_MS,
  });
  if (result.error || result.status !== 0) {
    log("⚠️  Не удалось проверить count(*) объектов перед db:seed:");
    log((result.stderr || result.error?.message || "").toString().trim());
    return;
  }

  const count = parseInt((result.stdout || "").trim(), 10);
  if (Number.isNaN(count)) {
    log("⚠️  Не удалось разобрать результат подсчёта объектов перед db:seed.");
    return;
  }

  if (count > 0) {
    fail([
      `В таблице objects уже ${count} объектов. db:seed предназначен для пустой БД.`,
      "Если это осознанно — запусти с ALLOW_SEED_NONEMPTY=true.",
    ]);
  }
}

async function runSequence() {
  const steps = [
    { label: "npm install", args: ["install"], dbHelp: false },
    { label: "npm run db:generate", args: ["run", "db:generate"], dbHelp: false },
    { label: "npm run db:migrate", args: ["run", "db:migrate"], dbHelp: true },
    { label: "npm run db:seed", args: ["run", "db:seed"], dbHelp: true },
  ];

  for (const step of steps) {
    if (step.label === "npm run db:seed") {
      assertEmptyBeforeSeed();
    }
    const ok = await runCommand(step.label, step.args, { hangWarn: true, dbHelp: step.dbHelp });
    if (!ok) process.exit(1);
  }
}

// ── подсчёт объектов после сида ─────────────────────────────────────────
function parseDatabaseUrl() {
  const envPath = path.join(ROOT, ".env");
  const content = readEnvFile(envPath);
  const match = content.match(/^DATABASE_URL=(.*)$/m);
  return match ? match[1].trim() : null;
}

function checkObjectsCount() {
  const databaseUrl = parseDatabaseUrl();
  if (!databaseUrl) {
    log("⚠️  DATABASE_URL не найден в .env — пропускаю подсчёт объектов.");
    return;
  }

  const result = spawnSync("psql", [databaseUrl, "-t", "-c", "SELECT COUNT(*) FROM objects;"], {
    encoding: "utf-8",
    timeout: PG_CONNECT_TIMEOUT_MS,
  });
  if (result.error || result.status !== 0) {
    log("⚠️  Не удалось посчитать объекты в БД:");
    log((result.stderr || result.error?.message || "").toString().trim());
    return;
  }

  const count = parseInt((result.stdout || "").trim(), 10);
  if (Number.isNaN(count)) {
    log("⚠️  Не удалось разобрать результат подсчёта объектов.");
    return;
  }

  if (count < EXPECTED_OBJECTS) {
    block([
      `⚠️  В БД ${count} объектов, ожидалось ${EXPECTED_OBJECTS}.`,
      "Возможные причины:",
      "- DATABASE_URL указывает на другую БД",
      "- npm run db:seed не отработал (смотри лог шага db:seed выше)",
      "Скрипт продолжает работу — это предупреждение, не остановка.",
    ]);
  } else {
    log(`✅ Объектов в БД: ${count} (ожидалось ≥ ${EXPECTED_OBJECTS})`);
  }
}

// ── проверка порта перед запуском dev-сервера ───────────────────────────
function checkPortFree(port) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once("error", (err) => {
      resolve(err.code !== "EADDRINUSE");
    });
    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });
    tester.listen(port, "0.0.0.0");
  });
}

async function runDevServer() {
  const free = await checkPortFree(DEV_PORT);
  if (!free) {
    fail([
      `❌ Порт ${DEV_PORT} уже занят — npm run dev не запущен.`,
      `Останови процесс на порту ${DEV_PORT} или смени порт в package.json ("dev": "next dev -p <порт>") и NEXTAUTH_URL в .env.`,
    ]);
  }
  log(`▶️  npm run dev запущен → http://localhost:${DEV_PORT}`);
  log("");
  log(`Открой браузер. Сервер слушает на ${DEV_PORT}. Ctrl+C — остановить.`);
  log("");
  const ok = await runCommand("npm run dev", ["run", "dev"], { hangWarn: false });
  process.exit(ok ? 0 : 1);
}

// ── main ─────────────────────────────────────────────────────────────────
async function main() {
  runCheckSetup();
  checkPsqlVersion();
  checkOrCreateDatabase();
  ensureEnvFile();
  await runSequence();
  checkObjectsCount();
  await runDevServer();
}

main();
