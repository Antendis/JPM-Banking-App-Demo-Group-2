# Original Project Spec / Reference

> This file preserves the original project spec README. Items here are not yet built but represent the intended end state of the app. The live README.md reflects what is actually built.

---

## Live demo

[greenbank.vercel.app](https://greenbank.vercel.app) *(update once deployed)*

### Demo accounts

| Email | Password |
|---|---|
| demo1@greenbank.com | GreenBank1! |
| demo2@greenbank.com | GreenBank2! |
| demo3@greenbank.com | GreenBank3! |

---

## Full planned tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | SQLite via Prisma ORM (local) / Turso (production) |
| Auth | NextAuth.js v5 — email/password + OTP |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| PDF generation | @react-pdf/renderer |
| Email | Resend |
| Deployment | Vercel + Turso |
| Testing | Vitest + React Testing Library |

---

## Full planned project structure

```
src/
  app/
    (public)/           # Homepage, login, register
    (authenticated)/    # All protected pages
      layout.tsx        # Shared header + bottom nav
      dashboard/
      transactions/
      payments/
      cards/
      account/
      statements/
      help/
    api/                # API route handlers
  components/
    ui/                 # Button, Input, Card, Badge, Toggle, etc.
    layout/             # Header, BottomNav, AccountDropdown
    features/           # SpendingChart, CardGraphic, etc.
  lib/
    prisma.ts           # Singleton Prisma client
    email.ts            # Resend OTP helper
    auth.ts             # NextAuth config
  types/                # Shared TypeScript types
prisma/
  schema.prisma         # Database schema
  seed.ts               # Demo data seeder
tests/                  # Test utilities and setup
```

---

## Running tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Check for TypeScript errors
npx tsc --noEmit
```

---

## Seeding demo data

```bash
npx prisma db seed
```

---

## Full environment variables (production)

```env
# Generate with: openssl rand -base64 32
AUTH_SECRET=

# Get from resend.com (free tier — 100 emails/day)
RESEND_API_KEY=

# SQLite file path for local development
DATABASE_URL=file:./dev.db

# Your local dev URL
NEXTAUTH_URL=http://localhost:3000
```

For production (Vercel + Turso), replace `DATABASE_URL` with your Turso connection string and add `TURSO_AUTH_TOKEN`.

---

## Screenshots

*(Add screenshots of the dashboard, payments page, and cards page once built)*
