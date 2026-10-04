# RetailServices

Premium digital products and gaming services marketplace — refined dark, minimal, champagne-gold branded (RS logo).

Customers register, top up their **Retail Wallet** with a **manual Discord payment** (admin verifies and credits the balance), then buy digital products. Orders are fulfilled manually by an administrator.

**Currency: EUR (€) only.** All money is handled with `Decimal` — never JavaScript floating point.

---

## 1. Features

**Customer flow (MVP):**

1. Register / login (secure email + password, bcrypt-hashed)
2. Browse the store, search, filter by category, sort by price
3. Open a product, see live wallet balance vs. price
4. Request a deposit (€5 / €10 / €20 / €50 / €100 / custom) — pay manually through Discord
5. Admin reviews the deposit → wallet credited atomically with an audited transaction
6. Buy the product → wallet debited, order `RS-2026-XXXXXX` created, stock decremented — one atomic transaction
7. Admin fulfills the order → `PROCESSING` → `COMPLETED`

**Admin:**

- Dashboard (customers, orders, pending deposits, revenue…)
- Product CRUD (soft-deactivate, featured, stock, price, image)
- Deposit review (approve / reject with note) — a deposit can only be reviewed **once**
- Order management (status + internal notes, `completedAt` set on completion)
- Customer detail (orders, deposits, full transaction history)
- Manual wallet adjustments (`ADMIN_ADJUSTMENT`, audited with admin id + reason)

**Security:** server-side sessions (httpOnly cookie), role checks on every `/admin` route and every admin action, Zod validation, rate limiting, security headers, atomic conditional money movements (no negative balances, no overselling, no double approval — safe under concurrency), and a server that never trusts client-sent prices, balances or user ids.

---

## 2. Tech stack

| Layer      | Choice                                   |
| ---------- | ---------------------------------------- |
| Framework  | Next.js 15 (App Router) + React 19      |
| Language   | TypeScript (strict)                      |
| Styling    | Tailwind CSS v4 (design tokens in CSS)   |
| Database   | PostgreSQL 17 + Prisma ORM               |
| Auth       | bcryptjs + opaque session tokens in DB   |
| Validation | Zod                                      |
| Tests      | tsx test runner (`tests/flows.test.ts`)  |

No UI kit dependency — the component layer (`src/components/ui`) is hand-built on the design tokens.

---

## 3. Project structure

```
prisma/
  schema.prisma           # User, Product, Order, WalletTransaction, DepositRequest, Session
  seed.ts                 # admin (env vars) + example products
  migrations/             # SQL migrations
src/
  middleware.ts           # session gate for /wallet /orders /profile /admin
  actions/                # Server Actions (auth, shop, admin) — Zod-validated, rate-limited
  app/                    # Routes (public, customer, admin)
  components/             # UI, forms, cards, navbar, toaster
  lib/
    auth.ts               # session cookie, requireUser / requireAdmin
    db.ts                 # Prisma singleton
    password.ts           # bcrypt hash / verify
    rate-limit.ts         # in-memory fixed-window limiter
    validators.ts         # Zod schemas
    money.ts              # EUR formatting
    constants.ts          # categories, presets, id prefixes
    services/             # business logic (no next/* imports — testable)
      auth.service.ts
      product.service.ts
      deposit.service.ts
      order.service.ts
      wallet.service.ts
      admin.service.ts
tests/
  flows.test.ts           # TEST 1–12 + extra invariants (41 assertions)
```

**Layering rule:** pages call server actions, actions call services, services touch the database. Services never import `next/headers`, so the whole business layer runs under plain `tsx` in tests.

---

## 4. Prerequisites

- **Node.js 20+** — check with `node -v`
- **PostgreSQL 14+** running locally (or any reachable PostgreSQL)

> This machine already has a portable PostgreSQL 17 in `.tools/` (see section 6).

---

## 5. Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable            | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string (Supabase pooler URL)  |
| `DIRECT_URL`        | Direct Postgres URL (Supabase) — used by Prisma CLI |
| `AUTH_SECRET`       | Reserved secret for future token signing            |
| `DISCORD_INVITE_URL`| Invite link used by every "Open Discord" button     |
| `ADMIN_EMAIL`       | Seeded admin account email                          |
| `ADMIN_PASSWORD`    | Seeded admin password (hashed before storage)       |

The admin password is **never** stored in source code — only hashed in the database.

---

## 6. Database setup

**Supabase (free tier — recommended):** create a free project at supabase.com, then
copy the *Connection string* twice from Project Settings → Database: the **pooler**
URL (port 6543, with `?pgbouncer=true`) goes in `DATABASE_URL`, and the **direct**
URL (port 5432) goes in `DIRECT_URL`. Then run:

```bash
npx prisma migrate deploy   # create tables on Supabase
npm run db:seed             # admin account + example products
```

With any PostgreSQL available:

```bash
# example: create the database
psql -U postgres -c "CREATE DATABASE crystalboost;"
```

Then, from the project root:

```bash
npx prisma migrate dev     # create tables
npm run db:seed            # admin account + example products
```

**Using the bundled portable PostgreSQL (Windows, no admin rights):**

```bash
# start the server (already initialized in .tools/pgdata)
.tools/pgbin/pgsql/bin/pg_ctl.exe -D .tools/pgdata -l .tools/pg.log -o "-p 5432" start

# create the database (first time only)
.tools/pgbin/pgsql/bin/createdb.exe -h localhost -p 5432 -U postgres crystalboost

# stop the server later with:
# .tools/pgbin/pgsql/bin/pg_ctl.exe -D .tools/pgdata stop
```

---

## 7. Running the app

```bash
npm install        # first time only
npm run dev        # http://localhost:3000
```

Then open **http://localhost:3000**.

---

## 8. Admin access

The admin account comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` (created by `npm run db:seed`).

- Login at `/login` → you land on `/admin` automatically (role `ADMIN`).
- Every `/admin/*` page is protected **server-side** by `requireAdmin()` — customers are redirected to `/access-denied` even if they type the URL directly.

---

## 9. Scripts

| Command                 | What it does                              |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | Dev server on :3000                       |
| `npm run build`         | Production build                          |
| `npm start`             | Serve the production build                |
| `npm run lint`          | ESLint                                    |
| `npm test`              | Flow tests (TEST 1–12)                    |
| `npm run db:generate`   | Regenerate Prisma client                  |
| `npm run db:migrate`    | Apply migrations in dev                   |
| `npm run db:deploy`     | Apply migrations in production/CI         |
| `npm run db:seed`       | Seed admin + example products             |

---

## 10. Testing

```bash
npm test
```

`tests/flows.test.ts` exercises the real services against the real database (cleaned up afterwards). Coverage of the required tests:

| Test | Scenario                                            |
| ---- | --------------------------------------------------- |
| 1    | Register customer (account created, dup rejected)   |
| 2    | Login (valid + invalid password)                    |
| 3    | New customer starts at €0.00                        |
| 4    | €20 deposit request → `PENDING`, wallet stays €0.00 |
| 5    | Admin approves → wallet €20.00, transaction `+€20` |
| 6    | Buy €15 product → wallet €5.00, order `RS-2026-…`   |
| 7    | €10 purchase with €5.00 → rejected, balance intact  |
| 8    | Approving the same deposit twice → rejected         |
| 9    | Two simultaneous purchases → one wins, no oversell, balance ≥ 0 |
| 10   | Customer hits `/admin` → access denied (role check) |
| 11   | Client-side price manipulation → ignored            |
| 12   | Client-side balance manipulation → rejected         |

**TEST 10 over HTTP** (with the dev server running):

```bash
# login as a customer, keep the session cookie
curl -s -i -X POST http://localhost:3000/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=YOU@EXAMPLE.COM&password=YOURPASSWORD" -c cookies.txt | head -1

# try to open the admin dashboard with that cookie
curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" \
  http://localhost:3000/admin -b cookies.txt
# expected: 307 -> http://localhost:3000/access-denied
```

> Note: the login form is a React form, so for a manual check just log in as a customer in the browser and type `/admin` in the address bar — you are redirected to **Access Denied**.

Also covered beyond the required list: order fulfillment (`completedAt`), deposit rejection with note, admin wallet adjustment (credit + over-debit rejection), and the audit invariant *balance = Σ transactions*.

---

## 11. Security notes

- Passwords: bcrypt (12 rounds), never stored in plaintext.
- Sessions: 256-bit opaque tokens, httpOnly + sameSite cookie, DB-backed with expiry, `secure` in production.
- Authorization: role re-checked **server-side** on every admin page and action; middleware only redirects unauthenticated users.
- Money: `Decimal` everywhere; debits/credits are conditional (`balance >= amount`, `stock > 0`, `status = PENDING`) inside interactive transactions — no negative balances, no overselling, no double review, even under concurrent requests.
- Purchase function signature is `(userId, slug)` — there is **no** price/balance parameter to tamper with; both are re-read from the database inside the transaction.
- Rate limiting on auth, deposit, purchase and admin actions; Zod validation on all input; security headers in `next.config.ts`; generic error messages (no stack traces, no DB internals leaked).

---

## 12. Not implemented (MVP scope)

Kept architecturally ready, deliberately **not** built yet:

- Discord bot integration
- Automatic payment gateways (Stripe, etc.)
- Automatic digital delivery
- Coupons, referrals, gift cards, reviews
- Notifications / email
- Multi-language, multi-currency
- Advanced analytics

Order and product schemas already carry the fields (snapshots, `active`, `featured`, `adminNote`…) that these features will build on.

---

## 13. Troubleshooting

| Problem | Fix |
| ------- | --- |
| `PrismaClientInitializationError` | PostgreSQL is not running — start it (section 6) |
| `P1001: Can't reach database server` | Check `DATABASE_URL` port (default 5432) |
| `Seeded admin not found` when testing | Run `npm run db:seed` |
| Port 5432 already in use | Another PostgreSQL is installed — point `DATABASE_URL` at it, or stop it and use the bundled one |
| Changes to `schema.prisma` ignored | Run `npx prisma generate` |
