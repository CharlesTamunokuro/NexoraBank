# Nexora Safe Bank demo

This is a fictional, local demo application. The React/Vite client is in [`react/`](./react/), and its Express/Prisma API is in [`server/`](./server/), a sibling folder as requested. PostgreSQL stores demo profiles, accounts, ledger entries, transfer requests, beneficiaries, notifications, admin records, and audit events.

**This is not a bank or a payment service.** There is no connection to a bank or payment network. Demo funding is a simulated ledger adjustment; internal transfers only move balances between demo accounts owned by the same customer; domestic and international requests remain pending internal review and do not send or reserve money. An approval or review status is not proof of sending, settlement, or completion. The app does not require or collect an AMF code or a release levy.

## Local setup

Prerequisites: Node.js and npm, plus PostgreSQL. On Windows, download the PostgreSQL installer from the [official PostgreSQL Windows download page](https://www.postgresql.org/download/windows/), which links to the EDB installer. Run the installer and include the PostgreSQL Server and command-line tools; pgAdmin is optional but makes creating the database easier. Choose and remember the password for the PostgreSQL `postgres` user, and keep the default port `5432` unless you have a reason to change it.

After installation, create an empty database named `nexora_demo`. In pgAdmin, connect to your local server, right-click **Databases**, choose **Create > Database**, enter `nexora_demo`, and save. Alternatively, in SQL Shell (`psql`), connect to the local server and run:

```sql
CREATE DATABASE nexora_demo;
```

1. Configure the API:

   ```powershell
   Copy-Item server\.env.example server\.env
   ```

   Edit `server\.env`: set `DATABASE_URL` to your PostgreSQL connection string, including the password you chose during installation. For a local install using the defaults, it will look like:

   ```dotenv
   DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/nexora_demo?schema=public"
   ```

   Replace `YOUR_POSTGRES_PASSWORD` with your actual local database password. If it contains URL-special characters such as `@`, `:`, `/`, or `#`, URL-encode those characters in the connection string. Also replace `JWT_SECRET` with a unique random secret of at least 32 characters, and set a unique `ADMIN_EMAIL` and `ADMIN_PASSWORD` (at least 16 characters). Keep `.env` local; never commit credentials.

2. Install and initialize the backend:

   ```powershell
   cd server
   npm install
   npm run db:generate
   npm run db:migrate -- --name init
   npm run admin:create
   npm run dev
   ```

   `db:generate` downloads Prisma's platform engine. `db:migrate` creates/applies the schema to the configured database. The admin provisioning script creates or updates the admin using the environment variables.

### Troubleshooting Prisma engine downloads

If `npm run db:generate` fails with `getaddrinfo ENOTFOUND binaries.prisma.sh`, your computer could not resolve Prisma's engine-download host through DNS. This is a network/DNS or firewall issue, not a Prisma schema error. In PowerShell, check whether the host resolves and accepts HTTPS:

```powershell
Resolve-DnsName binaries.prisma.sh
Test-NetConnection binaries.prisma.sh -Port 443
```

If name resolution fails, check your internet connection and retry, or try a network permitted for developer downloads. On a managed/corporate network, ask IT to allow HTTPS access to `binaries.prisma.sh` or provide the approved proxy configuration. Once the host is reachable, rerun `npm run db:generate` from `server`, then continue with `npm run db:migrate -- --name init`. Do not skip engine verification or download Prisma engine binaries from unofficial sources.

3. In a second terminal, start the client:

   ```powershell
   cd react
   npm install
   npm run dev
   ```

   Vite proxies `/api` requests to `http://localhost:5000`; start the API before using the client. The API health check is `http://localhost:5000/api/health`.

## Checks

Run these from their respective folders:

```powershell
# react
npm run lint
npm run build

# server
npm test
```

## Backend overview

- The Prisma schema is [`server/prisma/schema.prisma`](./server/prisma/schema.prisma). It defines users, accounts, transactions, balanced ledger entries, transfers and reviews, beneficiaries, admins, simulated funding, notifications, transaction PINs/attempts, and audit logs.
- API endpoints are registered in [`server/src/routes/api.js`](./server/src/routes/api.js) under `/api`. The frontend API wrapper is [`react/src/api.js`](./react/src/api.js).
- Customer authentication, demo profile creation, sessions, CSRF checks, role checks, rate limits, and HTTP hardening are implemented in `server/src/`. Admin bootstrap is in [`server/prisma/create-admin.js`](./server/prisma/create-admin.js).
- The customer dashboard, account, transfer, and beneficiary flows use API data. Customers can see their complete fictional demo account numbers on the overview and Accounts page; do not use real account details. Transaction PIN creation/change is in Settings; all transfer submissions require that PIN.
- Transfer behavior and ledger writes are in [`server/src/services/transferService.js`](./server/src/services/transferService.js); simulated admin funding and internal review are in [`server/src/services/adminService.js`](./server/src/services/adminService.js).
- The admin's **Administer demo credits** workflow searches for one exact customer account number, then records an audited simulated ledger credit. Super Administrators and Operations Administrators are authorized; it does not initiate a real payment or confirm external funds.

### Main API routes

| Area | Routes |
|---|---|
| Session | `GET /api/health`, `GET /api/auth/csrf`, `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/admin/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Customer | `GET /api/customer/dashboard`, `GET /api/customer/transactions`, `GET/POST/PATCH /api/customer/pin`, `POST /api/customer/pin/verify`, `GET/POST/PATCH/DELETE /api/customer/beneficiaries`, `PATCH /api/customer/notifications/:id/read` |
| Transfers | `POST /api/transfers/domestic`, `POST /api/transfers/international`, `POST /api/transfers/internal`, `GET /api/transfers` |
| Administration | `GET /api/admin/state`, `GET /api/admin/accounts/search`, `POST /api/admin/funding`, status/note updates, transfer review, audit, notifications, and summary endpoints |

Mutating routes use the CSRF token returned by `/api/auth/csrf`; authenticated routes use an HTTP-only session cookie. Do not expose this demo service to public traffic or reuse its patterns as a substitute for a production security review.

## Demo safety wording

To change customer-facing transfer safety and review wording, edit [`react/src/dashboard/transferNotices.js`](./react/src/dashboard/transferNotices.js):

- `transferSafetyNotice` is the warning shown in the transfer flow.
- `transferReviewNotice` clarifies that internal review is not external settlement.
- The admin transfer list includes additional status copy in [`react/src/admindashboard/pages/AdminBankingRecords.jsx`](./react/src/admindashboard/pages/AdminBankingRecords.jsx).

Keep the distinction between internal review and external settlement explicit. Do not describe a transfer as sent or completed unless an authorized payment integration confirms that state. This demo must not collect fees or unlock codes.

## Known demo limitations

No external money movement, real identity verification, customer password-change flow, statements, card services, persistent notification preferences, support ticket/chat service, or real-time event delivery is implemented. Admin interfaces for unsupported operations should not imply a successful backend action. Do not enter real financial or identity details into the demo.
