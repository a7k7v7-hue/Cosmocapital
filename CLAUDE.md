# Космокапитал - навигация

> Второй мозг владельца: `C:\My Project\_brain\owner.md`
> Рабочий процесс: `C:\My Project\_brain\workflow.md`
> Полная карта всех бизнесов владельца: `C:\My Project\PROJECTS.md`

## Что это за проект

Корпоративный сайт компании **Космокапитал**.
Стек: Next.js 15 (App Router) + TypeScript + Tailwind CSS.

## Стек

- **Framework**: Next.js 15 (App Router), `src/` директория
- **Styles**: Tailwind CSS v4
- **Lang**: TypeScript
- **Deploy**: Render (cosmacapital.onrender.com), сервисы `cosmacapital` (веб) + `cosmacapital-db` (БД) — см. `render.yaml`
- **DB**: Render PostgreSQL (через Prisma ORM). `railway.json`/`.env.railway.example` — вестижи первой попытки деплоя 21.05.2026, реально в GitHub Deployments Railway ни разу не задеплоена
- **Storage**: Supabase Storage (фото объектов)

## Структура

```
kosmocapital/
├── CLAUDE.md            <- этот файл
├── src/
│   └── app/             <- App Router страницы
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── public/              <- статика
├── next.config.ts
└── tsconfig.json
```

## Команды

```bash
npm run dev      # локальный сервер http://localhost:3010
npm run build    # production build
npm run lint     # ESLint проверка
```

## Данные (сид)

- `npm run db:seed` → 6 демо-объектов из `prisma/seed.ts`.
- 44 объекта → ручной импорт `prisma/import-from-old-site.sql` через `psql -f` (не подключён к db:seed).
- `prisma/crm-seed.sql` → 32 объекта, отдельный ранний ручной сид.

### Защита db:seed от прод-БД

`prisma/seed.ts` первой строкой в `main()` проверяет `DATABASE_URL` через `assertNotProduction()`:
если хост похож на облачный (`railway.app`, `render.com`, `neon.tech`, `supabase.co`) — сид
останавливается с `process.exit(1)`, чтобы не досеять демо-объекты поверх реальных данных.
Обход осознанно: `ALLOW_SEED_PROD=true npm run db:seed`.

Список доменов покрывает реальный прод (`cosmacapital.onrender.com`, БД на `*.render.com`
через `render.yaml` → `fromDatabase: cosmacapital-db`) — расширять не требуется, пока прод
не переедет на другой хостинг.

**Важно (подтверждено на практике, не гипотеза):** локальный `.env` в этом репозитории
СЕЙЧАС указывает `DATABASE_URL` на `localhost:5432` — реальный локальный PostgreSQL с
210 настоящими объектами Praedium (импорт 20.06.2026). Guard по домену это не ловит:
localhost не похож на облачный хост, а данные там боевые. Так уже случалось (13-14.08.2026,
найдено при тестировании guard'а, устранено вручную через DELETE по id, с pg_dump-бэкапом
перед удалением).

### Вторая защита: db:seed требует пустую БД

И `prisma/seed.ts` (первой строкой после `assertNotProduction`), и `scripts/setup-and-run.js`
(перед npm-шагом db:seed) проверяют `SELECT COUNT(*) FROM objects` — если там уже есть строки,
сид останавливается с `process.exit(1)` независимо от того, похож ли хост на облачный.
Это ловит именно тот случай, который guard по домену пропускает: localhost с реальными данными.
Обход осознанно: `ALLOW_SEED_NONEMPTY=true npm run db:seed`.

**Асимметрия:** `scripts/start-local.js` этой второй проверки не получил — просили добавить
только в `seed.ts` и `setup-and-run.js`. Если пользуешься `start-local.js` — это не защищено.

Отдельно: `.env` в этом репо начинается с UTF-8 BOM — `grep`/regex с `^`-якорем не видят
первую строку файла без явного strip() (см. `readEnvFile()` в `scripts/*.js`). Если пишешь
свой скрипт для чтения `.env` — учитывай это.

## Правила репо

1. **Перед коммитом** - `npm run build` проходит без ошибок.
2. **`git add` поимённо** - никогда `git add .`.
3. **Не деплоить без явной команды.**
4. **Большая фича = план в `plans/`** (создать папку при необходимости).
5. **Компоненты** - в `src/components/`, страницы - в `src/app/`.

## Язык

Всегда отвечай на русском. Без длинного тире (-), только дефис (-).
