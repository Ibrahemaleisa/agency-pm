# AgencyOS — agency project management MVP

One web app to replace the agency's Google Sheets: clients → projects → modules → tasks,
with approvals, chat, notifications, dashboards and an activity log.

**Stack:** Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS 4 · PostgreSQL · Drizzle ORM · cookie sessions (bcrypt + DB-backed session table).

## Run it locally

Requires Node 20+ and PostgreSQL 14+.

```bash
npm install
docker compose up -d          # or point DATABASE_URL at any Postgres
cp .env.example .env          # DATABASE_URL, UPLOAD_DIR
npm run setup                 # run migrations + seed demo data
npm run dev                   # http://localhost:3000
```

`npm run db:seed` resets the database to the demo state at any time.

### Demo accounts (password: `password`)

| Role     | Email                    | What to look at                                   |
|----------|--------------------------|---------------------------------------------------|
| Admin    | `sara@northwind.agency`  | Agency dashboard, workload, clients, users, templates |
| Employee | `omar@northwind.agency`  | My tasks, due/overdue, "waiting for me"            |
| Client   | `lina@bloomcafe.com`     | Client portal, pending approval on "Hero photo selects" |

Other staff: `karim@` (admin), `maya@`, `yusuf@`, `nour@`, `adam@`, `leila@` (all `@northwind.agency`).
Other clients: `daniel@atlasfitness.com`, `rana@verde-re.com`.

## Deploy to Vercel

1. In Vercel, **Add New → Project** and import `Ibrahemaleisa/agency-pm`. Keep the defaults.
2. In the project's **Storage** tab, create a **Neon** (Postgres) database and connect it to the
   project. This sets `DATABASE_URL`. That's the only required setup.
3. **Redeploy** (Deployments → ⋯ → Redeploy) so the build sees the database.

The build (`npm run vercel-build`) runs migrations, loads demo data **only if the database is
empty**, then builds the app. Later deploys never reset data.

Uploaded files are stored in the database by default on Vercel (4 MB limit per file). For larger
volumes, add a **Blob** store in the Storage tab (sets `BLOB_READ_WRITE_TOKEN`) and redeploy — new
uploads then go to Vercel Blob. Set `SHOW_DEMO_ACCOUNTS=true` to list the demo logins on the login page.

**Change the demo passwords** (Team & Users → Edit) before sharing the URL — every demo account uses `password`.

## How it's organized

```
src/
  db/schema.ts          Tables. Every major entity carries org_id (multi-agency ready)
  db/seed.ts            Realistic demo data (dates relative to today)
  lib/permissions.ts    Role → permission policy (the single place roles are defined)
  lib/access.ts         Row-level scoping: which projects/tasks a user may see
  lib/auth.ts           Sessions, login, requireUser / requirePermission
  lib/events.ts         Activity log, notifications, @mention resolution
  lib/modules.ts        Instantiates a module template onto a project
  lib/default-templates.ts  Content / Production / Paid Media / Account Management
  server/queries.ts     Read-side queries (always scoped through lib/access)
  server/*-actions.ts   Server Actions (mutations) — each checks a permission
  app/(app)/...         Pages; app/api/files/[id] serves access-checked downloads
  components/           UI primitives, tables, forms, chat, module card
```

### Key concepts

- **Modules & workflows.** A module template defines workflow stages and custom fields.
  Adding a module to a project snapshots the template and creates one task per stage.
  Stages marked as client-approval stages become client-visible approval tasks.
- **Approvals.** A task that requires approval enters *Awaiting approval* when moved to
  **Waiting for Client**. The client approves (→ Completed) or requests changes with
  feedback (→ In Progress). Both notify the team and are logged.
- **Client visibility.** Clients only see tasks/files/comments explicitly shared with them.
  Comments default to internal notes; staff choose "Reply visible to client".
  Project chat has an internal *Team* channel and a *Client conversation* channel.
- **Permissions.** UI and actions call `can(user, "tasks.assign")` etc.; resource scoping lives in
  `lib/access.ts`. Admins see everything in their agency, employees see projects they own or
  are members of, clients see their own company's projects only.
