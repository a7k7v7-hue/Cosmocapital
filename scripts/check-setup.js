#!/usr/bin/env node
// Проверка готовности окружения kosmocapital перед локальным запуском.
// Не трогает .env, node_modules, БД и миграции — только читает и, если нужно,
// создаёт .env.example.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MIN_NODE = [20, 9, 0];

const ENV_EXAMPLE_VARS = [
  ["DATABASE_URL", "postgresql://user:password@localhost:5432/kosmocapital"],
  ["NEXTAUTH_SECRET", "generate-a-random-secret-here"],
  ["NEXTAUTH_URL", "http://localhost:3000"],
  ["API_TOKEN", "dev-api-token-12345"],
  ["ADMIN_EMAIL", "admin@kosmocapital.local"],
  ["ADMIN_PASSWORD", "change-me-in-production"],
  ["SUPABASE_URL", "https://your-project.supabase.co"],
  ["SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key"],
  ["TELEGRAM_BOT_TOKEN", "your-bot-token"],
  ["TELEGRAM_CHAT_ID", "your-chat-id"],
];
const ENV_EXAMPLE_CONTENT =
  ENV_EXAMPLE_VARS.map(([key, value]) => [key, value].join("=")).join("\n") + "\n";

const results = [];
let ok = true;

function pass(message) {
  results.push(`✅ ${message}`);
}

function fail(message) {
  results.push(`❌ ${message}`);
  ok = false;
}

// 1. Версия Node.js
function parseVersion(v) {
  return v.replace(/^v/, "").split(".").map(Number);
}

function versionGte(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return true;
}

const nodeVersion = parseVersion(process.version);
if (versionGte(nodeVersion, MIN_NODE)) {
  pass(`Node.js ${process.version.replace(/^v/, "")} (требуется ≥ 20.9.0)`);
} else {
  fail(`Node.js ${process.version.replace(/^v/, "")} (требуется ≥ 20.9.0) → установи Node 20+`);
}

// 2. package.json в корне
const packageJsonPath = path.join(ROOT, "package.json");
if (fs.existsSync(packageJsonPath)) {
  pass("package.json найден");
} else {
  fail("package.json не найден → находишься не в корне проекта");
}

// 3. prisma/schema.prisma
const schemaPath = path.join(ROOT, "prisma", "schema.prisma");
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");
  const modelCount = (schemaContent.match(/^model\s+\w+/gm) || []).length;
  pass(`prisma/schema.prisma найден (${modelCount} моделей)`);
} else {
  fail("prisma/schema.prisma отсутствует → что-то не то с репозиторием");
}

// 4. prisma/migrations/
const migrationsDir = path.join(ROOT, "prisma", "migrations");
if (fs.existsSync(migrationsDir) && fs.statSync(migrationsDir).isDirectory()) {
  const migrationFiles = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".sql")) migrationFiles.push(full);
    }
  })(migrationsDir);

  if (migrationFiles.length > 0) {
    pass(`prisma/migrations/ найден (${migrationFiles.length} миграций)`);
  } else {
    fail("prisma/migrations/ пусто → проблема с репо");
  }
} else {
  fail("prisma/migrations/ отсутствует → проблема с репо");
}

// 5. .env.example
const envExamplePath = path.join(ROOT, ".env.example");
if (fs.existsSync(envExamplePath)) {
  pass(".env.example уже существует");
} else {
  fs.writeFileSync(envExamplePath, ENV_EXAMPLE_CONTENT, "utf-8");
  pass(".env.example создан");
}

// Вывод
console.log("");
for (const line of results) console.log(line);
console.log("");

if (ok) {
  console.log("📋 Следующие шаги:");
  console.log("1. Скопируй .env.example в .env");
  console.log("2. Заполни DATABASE_URL (локальный или прод PostgreSQL)");
  console.log("3. Запусти: npm install");
  console.log("4. Запусти: npm run db:generate");
  console.log("5. Запусти: npm run db:migrate");
  console.log("6. Запусти: npm run db:seed");
  console.log("7. Запусти: npm run dev");
} else {
  console.log("Окружение не готово — исправь ошибки выше и запусти проверку снова.");
}
console.log("");

process.exit(ok ? 0 : 1);
