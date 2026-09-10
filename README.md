# CalmLab 🧘‍♂️

### Full-stack E-commerce Web Application

CalmLab is a full-stack e-commerce application for wellness products built with **Next.js 16 and TypeScript**.

The project demonstrates real-world web development concepts such as authentication, payment processing, database management, server-side logic and order handling.

🌐 **Live Demo:** https://calm-lab.vercel.app

---

## ✨ Features

- 🔐 User registration and authentication
- 🍪 JWT authentication with httpOnly cookies
- 🛒 Shopping cart with Zustand
- 💳 Stripe Checkout integration
- 🔔 Stripe webhook processing
- 📦 User order history
- ✉️ Order confirmation emails
- 🛠 Admin product management
- 🗄 PostgreSQL database with Prisma ORM
- 📱 Responsive UI

---

## 🛠 Tech Stack

**Frontend**

`Next.js 16` • `React` • `TypeScript` • `Tailwind CSS` • `shadcn/ui` • `Zustand`

**Backend & Data**

`Next.js Route Handlers` • `Prisma` • `PostgreSQL` • `JWT`

**Services**

`Stripe` • `Resend`

**Tools**

`Git` • `GitHub` • `ESLint` • `Vercel`

---

## 🧠 Engineering Highlights

### 🔐 Authentication

Authentication is implemented using **JWT tokens stored in httpOnly cookies**.

Protected pages are checked on the server side, keeping authentication logic outside of client-side JavaScript where possible.

### 💳 Stripe Payments

The checkout flow uses **Stripe Checkout**.

After a successful payment, Stripe sends a webhook event to the application. The webhook signature is verified before the event is processed.

```text
Cart
 ↓
Stripe Checkout
 ↓
Payment
 ↓
Stripe Webhook
 ↓
Signature Verification
 ↓
Order Creation
 ↓
Confirmation Email
```


### 🔁 Duplicate Order Protection

The Stripe Checkout Session ID is stored as a unique value in the database.

Before creating an order, the application checks whether an order with the same session ID already exists, helping prevent duplicate orders when Stripe delivers the same webhook more than once.

### 🗄 Database

The application uses **PostgreSQL with Prisma ORM**.

Main entities:

- User
- Product
- Order
- OrderItem

Order items store product information at the time of purchase so previous orders are not affected by future product changes.

---

## 🛠 Admin Panel

The application includes an admin area for product management:

- View products
- Create products
- Edit products

---

## 📁 Project Structure

```text
app/
├── (admin)/
├── (auth)/
├── (main)/
└── api/

components/
features/
hooks/
lib/
prisma/
store/
types/
```

---

## ⚙️ Getting Started

```bash
git clone https://github.com/Kypiton/CalmLab.git
cd CalmLab

npm install
npm run dev
```

---

## 🚧 Future Improvements

- Automated tests
- CI/CD workflow
- Improved error handling and logging
- Additional payment edge-case handling

---

## 👨‍💻 Author

**Dan Glushchenko**

Frontend Developer focused on **React, Next.js and TypeScript**.

- GitHub: https://github.com/Kypiton
- LinkedIn: https://www.linkedin.com/in/dan-glushchenko-b87253245/
