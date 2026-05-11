# OnePot Banking — Demo App

> A shared-banking demo built for the JPMorgan university programme. OnePot lets users pool money into shared pots for rent, bills, holidays, and more.

---

## Demo Accounts

All five accounts use the same password. Login → enter the OTP code shown on screen → dashboard.

| Name            | Email                   | Password    | Balance    | Notes                          |
|-----------------|-------------------------|-------------|------------|--------------------------------|
| Alice Johnson   | alice@onepot.com        | OnePot2026  | £3,542.18  | Creator of House Rent pot      |
| Bob Smith       | bob@onepot.com          | OnePot2026  | £1,823.45  | Member of House Rent pot       |
| Charlie Brown   | charlie@onepot.com      | OnePot2026  | £4,901.30  | Member of House Rent pot       |
| Diana Prince    | diana@onepot.com        | OnePot2026  | £6,218.77  | Solo pot: Ibiza 2026           |
| Evan Williams   | evan@onepot.com         | OnePot2026  | £2,156.90  | Solo pot: MacBook Pro          |

> **OTP note:** After entering your email/password, the OTP code is shown directly on screen in a green "Demo mode" banner — no email required.

---

## Seeding / Resetting Demo Data

The demo data (all 5 accounts, transactions, and pots) is loaded via a protected API endpoint.

**To seed or reset:**
```
GET https://your-vercel-url.vercel.app/api/reset-demo?secret=YOUR_SECRET
```

Replace `YOUR_SECRET` with the value of the `DEMO_RESET_SECRET` environment variable.

**On demo day** — if data gets messy, just open that URL in any browser tab. Takes ~3 seconds. No terminal needed.

---

## Environment Variables

Set these in your Vercel project settings:

| Variable            | Description                                   |
|---------------------|-----------------------------------------------|
| `DATABASE_URL`      | Neon PostgreSQL connection string             |
| `DEMO_RESET_SECRET` | Secret key for the reset endpoint (any string)|
| `RESEND_API_KEY`    | (Optional) For sending real OTP emails        |

> If `DEMO_RESET_SECRET` is not set, the default is `onepot-reset`.

---

## Features

- **Auth:** Email + password → 6-digit OTP (shown on screen in demo mode)
- **Dashboard:** Live balance, spending breakdown chart, recent transactions
- **Shared Pots:** Create pots, invite members (locked at creation), contribute any amount, dissolve to refund all members
- **Send Money:** Instant transfers between any two OnePot accounts
- **Transaction History:** Full history with category filtering and transaction detail modal
- **Statements:** Monthly grouped statements
- **Scheduled Payments:** Schedule future transfers from your account or a shared pot; cancel pending payments
- **Route Protection:** `src/proxy.ts` stub exists but is not registered as Next.js middleware (requires renaming to `middleware.ts`) — currently inactive
- **Mobile:** Full bottom tab navigation on mobile

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Framework  | Next.js 16 (App Router), React 19       |
| Language   | TypeScript 5                            |
| Database   | PostgreSQL (Neon serverless)            |
| ORM        | Prisma 7                                |
| Auth       | Custom (bcryptjs + OTP)                 |
| Email      | Resend (optional)                       |
| Styling    | Tailwind CSS v4                         |
| Animations | Framer Motion                           |
| Icons      | Lucide React                            |

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Add DATABASE_URL to .env.local

# 3. Push schema to database
npx prisma db push

# 4. Start dev server
npm run dev

# 5. Seed demo data (in a separate terminal or browser)
curl http://localhost:3000/api/reset-demo?secret=onepot-reset
```

---

*Demo application — not a real bank. Built for the JPMorgan university programme.*
