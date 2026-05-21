# Деплой Cosmo Capital — Render.com

## Обзор

| Компонент | Сервис |
|---|---|
| Next.js приложение | Render (Web Service, free tier) |
| PostgreSQL | Render (PostgreSQL, free tier, 90 дней) |
| Хранилище фото | Supabase Storage |

> Free tier засыпает после 15 мин без запросов. Для продакшна — перейди на Starter ($7/мес).

---

## Шаг 1 — Blueprint (автодеплой через render.yaml)

`render.yaml` в корне репозитория описывает весь стек. Railway создаст веб-сервис и PostgreSQL за один клик.

1. Render Dashboard → **New** → **Blueprint**
2. Подключи репозиторий `Cosmocapital`
3. Render прочитает `render.yaml` и создаст оба сервиса автоматически

---

## Шаг 2 — Переменные окружения (после Blueprint)

Render → сервис `cosmacapital` → **Environment** → добавь вручную (они не в render.yaml из соображений безопасности):

| Переменная | Откуда взять |
|---|---|
| `ADMIN_EMAIL` | твой email |
| `ADMIN_PASSWORD` | надёжный пароль |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `NEXT_PUBLIC_SUPABASE_URL` | то же что `SUPABASE_URL` |

`DATABASE_URL`, `NEXTAUTH_SECRET` и `API_TOKEN` — Render генерирует автоматически из `render.yaml`.

---

## Шаг 3 — Миграция БД

После первого успешного деплоя: Render → сервис → **Shell**:

```
npx prisma migrate deploy
npm run db:seed
```

---

## Шаг 4 — Supabase Storage

1. Supabase → **Storage** → **New bucket**
2. Имя: `objects`, **Public bucket**: включить
3. Разрешённые MIME-типы: `image/jpeg`, `image/png`, `image/webp`

---

## Шаг 5 — Домен cosmacapital.ru

1. Render → сервис → **Settings** → **Custom Domain** → добавь `cosmacapital.ru`
2. В DNS-регистраторе: CNAME `@` → адрес из Render
3. Обнови `NEXTAUTH_URL` на `https://cosmacapital.ru`

---

## Smoke Test

- [ ] `https://cosmacapital.onrender.com` — главная открывается
- [ ] `/catalog` — каталог загружается
- [ ] `/admin` — редирект на `/admin/login`
- [ ] Вход работает
- [ ] Форма на главной — заявка в `/admin/leads`
- [ ] `GET /api/objects` — список объектов

---

## API для Telegram-бота

```js
const res = await fetch("https://cosmacapital.onrender.com/api/objects", {
  headers: { Authorization: "Bearer <значение API_TOKEN из Render>" }
});
const { objects, total } = await res.json();
```
