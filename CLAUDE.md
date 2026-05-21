# Космокапитал - навигация

## Что это за проект

Корпоративный сайт компании **Космокапитал**.
Стек: Next.js 15 (App Router) + TypeScript + Tailwind CSS.

## Стек

- **Framework**: Next.js 15 (App Router), `src/` директория
- **Styles**: Tailwind CSS v4
- **Lang**: TypeScript
- **Deploy**: Vercel (планируется)

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
npm run dev      # локальный сервер http://localhost:3000
npm run build    # production build
npm run lint     # ESLint проверка
```

## Правила репо

1. **Перед коммитом** - `npm run build` проходит без ошибок.
2. **`git add` поимённо** - никогда `git add .`.
3. **Не деплоить без явной команды.**
4. **Большая фича = план в `plans/`** (создать папку при необходимости).
5. **Компоненты** - в `src/components/`, страницы - в `src/app/`.

## Язык

Всегда отвечай на русском. Без длинного тире (-), только дефис (-).
