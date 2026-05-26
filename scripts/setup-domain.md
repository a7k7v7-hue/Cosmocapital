# Подключение домена cosmacapital.ru

## Шаг 1 — Render Dashboard

1. Открыть https://dashboard.render.com → сервис `cosmacapital`
2. Settings → Custom Domains → Add Custom Domain
3. Ввести `cosmacapital.ru` и `www.cosmacapital.ru`
4. Render покажет CNAME-значение вида `cosmacapital.onrender.com`

## Шаг 2 — DNS у регистратора

Добавить записи (в панели управления доменом):

| Тип | Имя | Значение |
|-----|-----|---------|
| CNAME | www | cosmacapital.onrender.com |
| CNAME | @ (или A) | cosmacapital.onrender.com |

> Если регистратор не поддерживает CNAME для @, использовать A-запись.
> IP Render узнать: `nslookup cosmacapital.onrender.com`

## Шаг 3 — Обновить NEXTAUTH_URL

В Render Dashboard → сервис `cosmacapital` → Environment:
```
NEXTAUTH_URL = https://cosmacapital.ru
```

## Шаг 4 — Проверка (после смены DNS, ~10-60 мин)

```bash
curl -I https://cosmacapital.ru
# Ожидается: HTTP/2 200, Server: cloudflare
```

## Шаг 5 — Supabase Storage (после создания проекта Supabase)

```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=xxx \
node scripts/setup-supabase-storage.js
```

Затем добавить в Render Environment:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
