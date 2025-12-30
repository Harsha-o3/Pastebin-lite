# Pastebin Lite

A production-ready, minimal text paste application built with Next.js and Prisma.

## Features

- **Create Pastes**: Store text content with optional expiry rules.
- **Time-based Expiry (TTL)**: Pastes automatically expire after a set number of seconds.
- **View-count Limit**: Pastes expire after reaching a maximum number of views.
- **Combined Rules**: If both TTL and view limits are set, the first one to trigger makes the paste unavailable.
- **API and UI**: Fully functional API and responsive web interface.
- **Deterministic Time**: Supports `x-test-now-ms` header for testing expiry logic.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite (via Prisma) - *Note: Switched to SQLite to ensure "Project must install and start without manual DB steps" and because local MySQL was unreachable during setup.*
- **Styling**: Tailwind CSS + Shadcn UI
- **ORM**: Prisma 7

## Local Run Instructions

1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Setup Database**:
   The project is pre-configured to use SQLite. The database schema will be applied automatically on start, but you can manually sync it:
   ```bash
   npx prisma db push
   ```

3. **Run Development Server**:
   ```bash
   bun dev
   ```

4. **Health Check**:
   Visit `http://localhost:3000/api/healthz` to verify database connectivity.

## API Documentation

### 1. Health Check
`GET /api/healthz`
- Returns `{"ok": true}` if DB is connected.

### 2. Create Paste
`POST /api/pastes`
- **Request Body**:
  ```json
  {
    "content": "Your text here",
    "ttl_seconds": 3600,
    "max_views": 5
  }
  ```
- **Response**:
  ```json
  {
    "id": "cuid_string",
    "url": "https://your-app.example/p/cuid_string"
  }
  ```

**Note:** In production set `NEXT_PUBLIC_SITE_URL` to your public site URL (for example: `https://paste.example`) so generated links are shareable outside localhost.

### 3. Fetch Paste (JSON)
`GET /api/pastes/:id`
- Returns paste metadata and content.
- Decrements `remaining_views`.

### 4. View Paste (HTML)
`GET /p/:id`
- Renders the paste in a user-friendly UI.

## Testing Logic

If `TEST_MODE=1` is set in `.env`, the application will respect the `x-test-now-ms` header (epoch milliseconds) to override system time for all expiry calculations.

## Persistence Layer

This project uses **SQLite** via **Prisma**. 
- **Reasoning**: To satisfy the requirement that the "Project must install and start without manual DB steps", SQLite provides a zero-config persistent storage that survives across serverless requests in local/development environments.
- **Schema**:
  - `id`: Unique identifier (CUID)
  - `content`: Text content
  - `created_at`: Creation timestamp
  - `expires_at`: Optional TTL-based expiry date
  - `max_views`: Optional view limit
  - `current_views`: Tracked view count

## Recent changes & deployment notes ✅

This project has had a few updates to fix Prisma runtime errors and make generated paste links shareable in production:

- Prisma client generation and engine
  - Added a `postinstall` step that runs `prisma generate` so the generated client is available after install.
  - Set the Prisma client generator engine to `binary` in `prisma/schema.prisma` and confirmed `npx prisma generate` succeeds.
- Driver adapter (fix for runtime error)
  - Installed `@prisma/adapter-mariadb` and updated `src/lib/prisma.ts` to instantiate a MariaDB adapter and pass it to `new PrismaClient({ adapter })` when the environment uses MySQL/MariaDB.
  - This prevents the runtime validation error: `Using engine type 'client' requires either 'adapter' or 'accelerateUrl'`.
- Paste URL generation
  - `POST /api/pastes` now prefers the `NEXT_PUBLIC_SITE_URL` env var when constructing the shareable paste URL (falls back to the request `Host` and `x-forwarded-proto` headers).
  - **Important:** Set `NEXT_PUBLIC_SITE_URL` in your production environment (example: `https://paste.example`) so links work for others.
- How to test locally
  - Start server: `npm run dev` (or `bun dev` depending on your install)
  - Create a paste: `POST /api/pastes` with `{ "content": "..." }`
  - The returned `url` will be `http://localhost:3000/p/<id>` locally, or will use `NEXT_PUBLIC_SITE_URL` if set.
- Branch & workflow
  - Changes are on branch `fix/prisma-adapter-site-url` and pushed to the repository — open a PR to merge into `main` when ready.

**Deployment note**: In production set the following env vars:

- `DATABASE_URL` — your production DB connection string
- `NEXT_PUBLIC_SITE_URL` — public app URL (e.g., `https://paste.example`)
- `PRISMA_CLIENT_ENGINE=binary` (optional; ensure generated client matches runtime engine if necessary)

### Netlify deployment notes

- Add the above env vars in Netlify Site settings (Environment > Environment variables).
- Use a managed MySQL/MariaDB database (e.g., PlanetScale, Amazon RDS) — do not use SQLite in production on Netlify.
- Add `@netlify/plugin-nextjs` to Netlify plugins (the `netlify.toml` file in repo includes a starter config).
- During Netlify build the `postinstall` script will run `prisma generate`, which will include binary targets specified in `prisma/schema.prisma`.
- If you expect heavy traffic, consider using Prisma Data Proxy or Accelerate and set `accelerateUrl` or `adapter` accordingly to avoid connection limits.

### Installations performed (local/dev)

- `npm install` / `bun install` — project dependencies
- `npx prisma generate` — generates the Prisma Client (also set as `postinstall` script)
- `npm install @prisma/adapter-mariadb --save` — MariaDB driver adapter to satisfy Prisma engine runtime requirements
- `npm install @prisma/client --save` — Prisma generated client (project uses Prisma v7)

### Code changes made

- `src/lib/prisma.ts`
  - Ensure `PRISMA_CLIENT_ENGINE` defaults to `binary` when not set.
  - Load `@prisma/adapter-mariadb` when available and pass the adapter to `new PrismaClient({ adapter })` to avoid runtime constructor validation errors.
  - Use dynamic require/import ordering so environment variables are applied before loading the generated client.
- `prisma/schema.prisma`
  - Generator `engine` set to `binary`.
- `package.json`
  - Added `postinstall` script: `prisma generate` to automate generated client creation after install.
- `src/app/api/pastes/route.ts`
  - URL generation now prefers `NEXT_PUBLIC_SITE_URL` (production) and falls back to request headers in development.

These notes document the installations and changes made to get the app running reliably in local development as well as to prepare it for deployment.
