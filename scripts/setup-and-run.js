#!/usr/bin/env node
// Полный цикл: проверка окружения -> PostgreSQL -> .env -> БД -> npm install ->
// db:generate -> db:migrate -> db:seed -> dev. Одна команда: npm run setup.

const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const net = require("net");

const ROOT = path.resolve(__dirname, "..");
const MIN_NODE = [20, 9, 0];
const PG_DATABASE = "kosmocapital";
const DEV_PORT = 3010;
const EXPECTED_OBJECTS = 6; // prisma/seed.ts — демо-набор, а не 44 из SQL-файлов

const PG_USER = process.env.PG_USER || "postgres";
const pw = process.env.PG_PASSWORD || "postgres";
const PG_HOST = process.env.PG_HOST || "localhost";
const PG_PORT = process.env.PG_PORT || "5432";

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

function psqlEnv() {
  const env = { ...process.env };
  env.PGPASSWORD = pw;
  return env;
}

// Запуск настоящих .exe (psql и т.п.) с наследуемым stdio — БЕЗ shell.
// args передаются как есть, без склейки в строку и без экранирования —
// shell не участвует, поэтому ни DEP0190, ни риск инъекции не возникают.
function run(cmd, args, { env } = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: ROOT, stdio: "inherit", env: env || process.env });
    child.on("exit", (code) => resolve(code === null ? 1 : code));
    child.on("error", (err) => {
      log(`❌ Не удалось запустить "${cmd}": ${err.message}`);
      resolve(1);
    });
  });
}

// То же самое с захватом вывода — для внутренних проверок (список БД и т.п.).
function runCapture(cmd, args, { env } = {}) {
  return spawnSync(cmd, args, { cwd: ROOT, encoding: "utf-8", env: env || process.env });
}

// npm на Windows — это npm.cmd, spawn без shell его не резолвит (проверено
// эмпирически), поэтому shell:true здесь необходим. Но shell:true + args-массив
// даёт предупреждение DEP0190 (Node не экранирует args, только склеивает
// пробелом — https://nodejs.org/api/deprecations.html#DEP0190). Аргументы
// команды 'npm' простые (без пробелов/спецсимволов), поэтому собираем всю
// команду одной строкой сами и передаём БЕЗ args-массива — DEP0190 не бьёт
// по этому пути вообще.
function runNpm(npmArgs) {
  const commandLine = ["npm", ...npmArgs].join(" ");
  return new Promise((resolve) => {
    const child = spawn(commandLine, { cwd: ROOT, stdio: "inherit", shell: true });
    child.on("exit", (code) => resolve(code === null ? 1 : code));
    child.on("error", (err) => {
      log(`❌ Не удалось запустить "${commandLine}": ${err.message}`);
      resolve(1);
    });
  });
}

// ── 1. Node.js / package.json / schema.prisma / migrations ─────────────────
function checkEnvironment() {
  const [major, minor] = process.version.replace(/^v/, "").split(".").map(Number);
  const okVersion = major > MIN_NODE[0] || (major === MIN_NODE[0] && minor >= MIN_NODE[1]);
  if (!okVersion) {
    fail([`❌ Node.js ${process.version} (требуется ≥ 20.9.0) → установи Node 20+`]);
  }
  log(`✅ Node.js ${process.version.replace(/^v/, "")} (требуется ≥ 20.9.0)`);

  if (!fs.existsSync(path.join(ROOT, "package.json"))) {
    fail(["❌ package.json не найден → находишься не в корне проекта"]);
  }
  log("✅ package.json найден");

  const schemaPath = path.join(ROOT, "prisma", "schema.prisma");
  if (!fs.existsSync(schemaPath)) {
    fail(["❌ prisma/schema.prisma отсутствует → что-то не то с репозиторием"]);
  }
  const modelCount = (fs.readFileSync(schemaPath, "utf-8").match(/^model\s+\w+/gm) || []).length;
  log(`✅ prisma/schema.prisma найден (${modelCount} моделей)`);

  const migrationsDir = path.join(ROOT, "prisma", "migrations");
  const migrations = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir, { withFileTypes: true }).filter((e) => e.isDirectory())
    : [];
  if (migrations.length === 0) {
    fail(["❌ prisma/migrations/ пусто или отсутствует → проблема с репо"]);
  }
  log(`✅ prisma/migrations/ найден (${migrations.length} миграций)`);
}

// ── 2. PostgreSQL ────────────────────────────────────────────────────────
async function checkPostgres() {
  const code = await run("psql", ["--version"]);
  if (code !== 0) {
    fail([
      "❌ PostgreSQL не найден (psql --version вернул ошибку)",
      "",
      "Установи PostgreSQL:",
      "- Скачай с postgresql.org (версия 15+)",
      "- После установки перезагрузи PowerShell",
      "- Запусти заново: npm run setup",
      "",
      "Или используй облачную БД:",
      "- Render.com — создай PostgreSQL сервис",
      "- Скопируй DATABASE_URL из Render в .env",
      "- Запусти заново: npm run setup",
    ]);
  }
  log("✅ PostgreSQL найден");
}

// ── 3. .env ──────────────────────────────────────────────────────────────
function ensureEnv() {
  const envPath = path.join(ROOT, ".env");
  const examplePath = path.join(ROOT, ".env.example");

  if (fs.existsSync(envPath)) {
    log("✅ .env уже существует (не перезаписан)");
    return;
  }
  if (!fs.existsSync(examplePath)) {
    fail(["❌ .env.example не найден — создать .env нечем"]);
  }
  fs.copyFileSync(examplePath, envPath);
  const url = `postgresql://${PG_USER}:${pw}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}`;
  const filled = readEnvFile(envPath).replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${url}`);
  fs.writeFileSync(envPath, filled, "utf-8");
  log(`✅ .env создан из .env.example (DATABASE_URL=${url})`);
}

// ── 4. БД kosmocapital (создать, если не существует — Postgres не умеет
//       CREATE DATABASE IF NOT EXISTS, поэтому сперва проверяем список БД) ──
function ensureDatabase() {
  const baseArgs = ["-U", PG_USER, "-h", PG_HOST, "-p", String(PG_PORT)];
  const env = psqlEnv();

  const list = runCapture("psql", [...baseArgs, "-lqt"], { env });
  if (list.error || list.status !== 0) {
    fail([
      "❌ Не удалось подключиться к PostgreSQL:",
      (list.stderr || list.error?.message || "").toString().trim(),
      "",
      "Проверь:",
      `1. Логин/пароль — сейчас используется ${PG_USER} (задай PG_USER / PG_PASSWORD в переменных окружения, если у тебя другие)`,
      "2. PostgreSQL запущен и доступен",
      "3. Если используешь облачную БД — пропиши готовый DATABASE_URL прямо в .env",
    ]);
  }

  const exists = list.stdout.split("\n").some((line) => line.split("|")[0].trim() === PG_DATABASE);
  if (exists) {
    log(`✅ БД ${PG_DATABASE} уже существует`);
    return;
  }

  const create = runCapture("psql", [...baseArgs, "-c", `CREATE DATABASE ${PG_DATABASE};`], { env });
  if (create.error || create.status !== 0) {
    fail(["❌ Не удалось создать БД:", (create.stderr || create.error?.message || "").toString().trim()]);
  }
  log(`✅ БД ${PG_DATABASE} создана`);
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

  const result = runCapture("psql", [databaseUrl, "-t", "-c", "SELECT COUNT(*) FROM objects;"]);
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

// ── 5-6. Последовательные npm-команды с проверкой exit code ────────────────
async function runSteps() {
  const steps = [
    ["npm install", ["install"]],
    ["npm run db:generate", ["run", "db:generate"]],
    ["npm run db:migrate", ["run", "db:migrate"]],
    ["npm run db:seed", ["run", "db:seed"]],
  ];

  for (const [label, args] of steps) {
    if (label === "npm run db:seed") {
      assertEmptyBeforeSeed();
    }
    const code = await runNpm(args);
    if (code !== 0) {
      fail([`❌ ${label} завершился с ошибкой (exit code ${code}). Смотри лог выше.`]);
    }
    log(`✅ ${label} ✓`);
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

  const result = runCapture("psql", [databaseUrl, "-t", "-c", "SELECT COUNT(*) FROM objects;"]);
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

// ── 7. dev-сервер ────────────────────────────────────────────────────────
async function runDev() {
  const free = await checkPortFree(DEV_PORT);
  if (!free) {
    fail([
      `❌ Порт ${DEV_PORT} уже занят — npm run dev не запущен.`,
      `Останови процесс на порту ${DEV_PORT} или смени порт в package.json ("dev": "next dev -p <порт>") и NEXTAUTH_URL в .env.`,
    ]);
  }
  block([`▶️  Запускаю npm run dev...`, `Сервер на http://localhost:${DEV_PORT}`, "Ctrl+C — остановить."]);
  const code = await runNpm(["run", "dev"]);
  process.exit(code);
}

async function main() {
  checkEnvironment();
  await checkPostgres();
  ensureEnv();
  ensureDatabase();
  await runSteps();
  checkObjectsCount();
  await runDev();
}

main();
