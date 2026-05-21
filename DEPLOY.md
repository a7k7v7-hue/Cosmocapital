# Деплой Cosmo Capital — Railway

## Обзор

| Компонент | Сервис |
|---|---|
| Next.js приложение | Railway (GitHub repo) |
| PostgreSQL | Railway (встроенная БД) |
| Хранилище фото | Supabase Storage |

---

## Шаг 1 — Добавить репозиторий в Railway

В проекте `pretty-enjoyment` (там уже есть Postgres):

1. Нажми **+** на канвасе
2. Выбери **GitHub Repo** → `Cosmocapital`
3. Railway автоматически добавит `DATABASE_URL` в переменные приложения

---

## Шаг 2 — Переменные окружения

Railway → выбери сервис приложения → **Variables** → добавь по одной:

| Переменная | Откуда взять |
|---|---|
| `NODE_ENV` | `production` |
| `NEXTAUTH_URL` | URL вида `https://xxx.railway.app` (после первого деплоя) |
| `NEXTAUTH_SECRET` | результат `openssl rand -hex 32` в терминале |
| `ADMIN_EMAIL` | твой email |
| `ADMIN_PASSWORD` | надёжный пароль |
| `API_TOKEN` | результат `openssl rand -hex 24` в терминале |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `NEXT_PUBLIC_SUPABASE_URL` | то же что `SUPABASE_URL` |

`DATABASE_URL` добавляется автоматически при связке с Postgres-сервисом.

---

## Шаг 3 — Первый деплой

Railway деплоит автоматически при каждом пуше в `main`.

Либо вручную: Railway → сервис приложения → **Deploy** → **Deploy Now**.

---

## Шаг 4 — Миграция и сид БД

После успешного деплоя: Railway → сервис приложения → **Shell**:

```
npx prisma migrate deploy
npm run db:seed
```

---

## Шаг 5 — Supabase Storage

1. Supabase → **Storage** → **New bucket**
2. Имя bucket: `objects`
3. **Public bucket**: включить
4. Разрешённые MIME-типы: `image/jpeg`, `image/png`, `image/webp`

---

## Шаг 6 — Домен cosmacapital.ru

1. Railway → сервис → **Settings** → **Custom Domain** → добавь `cosmacapital.ru`
2. В DNS-регистраторе добавь CNAME-запись `@` на адрес из Railway
3. Обнови переменную `NEXTAUTH_URL` на `https://cosmacapital.ru`

---

## Smoke Test

После деплоя проверь:

- [ ] Главная `https://cosmacapital.ru` открывается
- [ ] `/catalog` — каталог с объектами загружается
- [ ] `/admin` — редирект на `/admin/login`
- [ ] Вход через `/admin/login` работает
- [ ] Форма на главной — заявка сохраняется в `/admin/leads`
- [ ] `GET /api/objects` — возвращает список объектов

---

## API для Telegram-бота

```js
const res = await fetch("https://cosmacapital.ru/api/objects", {
  headers: { Authorization: "Bearer <твой API_TOKEN>" }
});
const { objects, total } = await res.json();
```

Значение `API_TOKEN` — то же что задал в переменных Railway.
