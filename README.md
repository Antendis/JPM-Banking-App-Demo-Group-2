# OnePot Banking

A full-stack demo banking application built with Next.js 15, Prisma, and SQLite.

> **Demo only** — this application does not handle real money. All accounts and transactions are simulated in a local database.

---

## Current status

| Feature | Status |
|---|---|
| Homepage (marketing) | Done |
| User registration | Done |
| Login with OTP (2-step) | Done — OTP printed to dev console, no real email yet |
| Dashboard | Stub — placeholder only |
| Pot (shared savings groups) | Schema defined, not yet built |
| Route protection (auth middleware) | Not yet built |
| Email sending | Planned |
| Charts, statements, cards pages | Planned |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | SQLite via Prisma ORM |
| Auth | Custom (bcrypt password hashing + 6-digit OTP) |
| Styling | Tailwind CSS v4 |

**Planned additions:** Resend (email), Recharts, @react-pdf/renderer, Vitest

---

## Local setup

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Antendis/JPM-Banking-App-Demo-Group-2.git
cd JPM-Banking-App-Demo-Group-2

# 2. Install dependencies
npm install

# 3. Set up environment variables
echo 'DATABASE_URL="file:./prisma/dev.db"' > .env

# 4. Run database migrations
npx prisma migrate dev

# 5. Generate the Prisma client
npx prisma generate

# 6. Start the development server
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

> **Note:** After pulling changes that include schema updates in `prisma/schema.prisma`, always run `npx prisma generate` to regenerate the TypeScript client types.

---

## Environment variables

Create a `.env` file at the project root:

```env
# SQLite file path for local development
DATABASE_URL="file:./prisma/dev.db"
```

Additional variables will be required as features are added (email sending, deployment, etc.).

---

## Project structure

```
src/
  app/
    page.tsx                    # Homepage (marketing)
    login/page.tsx              # Login UI (email/password → OTP)
    register/page.tsx           # Registration UI
    dashboard/page.tsx          # Dashboard (placeholder)
    layout.tsx                  # Root layout — wraps all pages with Navbar
    api/
      auth/
        login/route.ts          # POST /api/auth/login
        verify-otp/route.ts     # POST /api/auth/verify-otp
      register/route.ts         # POST /api/register
  components/
    Navbar.tsx                  # Shared navigation bar
  lib/
    prisma.ts                   # Singleton Prisma client
prisma/
  schema.prisma                 # Database schema (User, Pot, PotMember)
  migrations/                   # SQL migration history
  dev.db                        # Local SQLite database file
```

---

## Branch workflow

This project uses a feature branch workflow tied to Jira tickets.

### Picking up a ticket

1. Go to the [Jira board](https://jpmbankingapp.atlassian.net) and find a ticket in **To Do**
2. Move it to **In Progress** and assign it to yourself
3. Create a branch from `main` following the naming convention below
4. Build the feature, commit regularly, then open a pull request

### Branch naming

```
feature/JBAD-{ticket-number}-short-description
```

Examples:
```
feature/JBAD-6-user-registration-api
feature/JBAD-16-dashboard-page
feature/JBAD-20-atomic-transfer-endpoint
```

### Commit messages

Reference the ticket number in every commit:

```
feat: JBAD-6 user registration API with bcrypt password hashing
fix: JBAD-20 ensure transfer is atomic when recipient not found
chore: JBAD-2 add prisma schema and initial migration
```

### Pull requests

- Open a PR against `main` when your ticket is complete
- At least one other team member must review before merging
- The PR description should link to the Jira ticket
- All checks must pass before merging
- **No direct pushes to `main`** — branch protection is enabled

### WIP limit

**One ticket In Progress per person at a time.** If you want to pick up a new ticket, your current one must be moved to Done or explicitly marked as Blocked with a reason.

---

## Jira board

All tickets are managed in Jira: [jpmbankingapp.atlassian.net](https://jpmbankingapp.atlassian.net)

| Sprint | Tickets | Focus |
|---|---|---|
| Sprint 1 | JBAD-1 to JBAD-10 | Setup, auth, homepage |
| Sprint 2 | JBAD-11 to JBAD-23 | Dashboard, transactions, payments |
| Sprint 3 | JBAD-24 to JBAD-38 | Cards, account section, polish, deploy |

---

## Team

| Name | Role |
|---|---|
| Rohail | Project manager & scrum lead |
| *(teammate 2)* | Developer |
| *(teammate 3)* | Developer |
| *(teammate 4)* | Developer |
