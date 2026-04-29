# CalmLab 🧘‍♂️

E-commerce приложение для продажи витаминов и добавок (Recovery, Relax, Sleep, Focus).

## 🚀 Технологии

- Next.js 16
- TypeScript
- Prisma + PostgreSQL
- Stripe (оплата)
- Tailwind CSS + shadcn/ui
- Zustand (state management)

---

## ⚙️ Установка

```bash
git clone https://github.com/Kypiton/CalmLab.git
cd CalmLab

npm install
```

---

## 🔑 Переменные окружения

Создай `.env` файл:

```env
DATABASE_URL="your_database_url"
JWT_SECRET="your_secret"

STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_webhook_secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_publishable_key"
```

---

## 🗄️ Работа с базой данных

```bash
npx prisma generate
npx prisma db push
npx prisma studio
```

---

## 💳 Stripe (локальная разработка)

Установи Stripe CLI:

```bash
brew install stripe/stripe-cli/stripe
```

Запусти прослушку вебхуков:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

После запуска ты получишь:

```txt
whsec_...
```

👉 вставь его в `.env` как:

```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## ▶️ Запуск проекта

```bash
npm run dev
```

---

## 🔐 Аутентификация

- JWT хранится в httpOnly cookie
- Сервер определяет пользователя через `getCurrentUser()`
- Защита страниц через server components / redirect

---

## 📦 Основной функционал

- Регистрация / логин
- Корзина (Zustand)
- Checkout через Stripe
- Webhook для обработки платежей
- Orders (история заказов пользователя)

---

## 📌 TODO

- Админка для управления товарами
- Улучшение UX (loading, ошибки)
