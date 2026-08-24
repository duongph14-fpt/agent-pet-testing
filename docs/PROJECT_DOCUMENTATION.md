# agent-pet-testing — Project Documentation

Full-stack scaffold pairing a **NestJS** (TypeScript) backend with a **React + Vite** (TypeScript) frontend. The two are wired together through a single `GET /api/health` endpoint, which the SPA polls on load to display live backend status. All configuration is environment-driven; nothing is hardcoded.

---

## 1. Architecture Overview

```
┌──────────────────────────┐        /api/health        ┌──────────────────────────┐
│  Frontend (React + Vite) │ ─────────────────────────▶ │   Backend (NestJS)       │
│  http://localhost:5173   │   (Vite proxies /api in    │   http://localhost:3000  │
│                          │    dev to the backend)     │   prefix: /api           │
└──────────────────────────┘                            └──────────────────────────┘
```

- **Backend** exposes a REST API under a configurable prefix (default `/api`). It ships with global CORS, request-validation, a catch-all exception filter, and a request-timing logging interceptor.
- **Frontend** is a single-page app. In development, Vite proxies `/api/*` to the backend so requests stay same-origin; in production the SPA is expected to be served from the same origin as the API.

---

## 2. Repository Layout

```
├── backend/                     NestJS API (TypeScript)
│   ├── src/
│   │   ├── main.ts              Bootstrap: prefix, CORS, pipes, filters, interceptors
│   │   ├── app.module.ts        Root module (global ConfigModule + HealthModule)
│   │   ├── config/
│   │   │   └── configuration.ts Env-based config (port, nodeEnv, apiPrefix, corsOrigin)
│   │   ├── common/
│   │   │   ├── http-exception.filter.ts   Catch-all → structured JSON error
│   │   │   └── logging.interceptor.ts     Logs "METHOD url - <ms>ms" per request
│   │   └── modules/health/      Sample feature module
│   │       ├── health.controller.ts   GET /health
│   │       ├── health.service.ts       Returns { status, uptime, timestamp }
│   │       ├── health.module.ts
│   │       └── health.service.spec.ts  Unit test
│   └── test/
│       ├── health.e2e-spec.ts   e2e test hitting GET /api/health
│       └── jest-e2e.json
└── frontend/                    React + Vite SPA (TypeScript)
    ├── src/
    │   ├── main.tsx             React root mount
    │   ├── App.tsx              Renders HomePage
    │   ├── api/
    │   │   ├── client.ts        Typed fetch wrapper (apiGet<T>)
    │   │   └── health.ts        fetchHealth() → GET /api/health
    │   ├── hooks/useHealth.ts   loading | error | ready state machine
    │   ├── components/StatusBadge.tsx   Colored status pill
    │   └── pages/HomePage.tsx   Shows backend health status
    └── vite.config.ts           Dev server + /api proxy
```

---

## 3. Backend

### Bootstrap (`main.ts`)
On startup the app reads config via `ConfigService` and applies:
- **Global prefix** — `apiPrefix` (default `api`), so routes live under `/api/*`.
- **CORS** — restricted to the origins in `corsOrigin`.
- **ValidationPipe** — `whitelist: true`, `transform: true` (strips unknown properties, auto-transforms payloads).
- **AllExceptionsFilter** — global exception handling.
- **LoggingInterceptor** — global request timing.

### Configuration (`config/configuration.ts`)
| Field       | Env var       | Default                   | Notes                                    |
|-------------|---------------|---------------------------|------------------------------------------|
| `port`      | `PORT`        | `3000`                    | Parsed as integer                        |
| `nodeEnv`   | `NODE_ENV`    | `development`             |                                          |
| `apiPrefix` | `API_PREFIX`  | `api`                     | Global route prefix                      |
| `corsOrigin`| `CORS_ORIGIN` | `http://localhost:5173`   | Comma-separated list, trimmed/filtered   |

### Cross-cutting concerns (`common/`)
- **`AllExceptionsFilter`** (`@Catch()`) — normalizes every thrown error into a JSON body: `{ statusCode, timestamp, path, message }`. Uses the real HTTP status for `HttpException`s, otherwise `500`. Logs stack traces for 5xx errors.
- **`LoggingInterceptor`** — measures elapsed time per request and logs `METHOD url - <ms>ms`.

### Health module (`modules/health/`)
- **`GET /api/health`** → `HealthController.check()` → `HealthService.check()`.
- Response shape:
  ```json
  { "status": "ok", "uptime": 123.45, "timestamp": "2026-08-24T10:00:00.000Z" }
  ```

### API Reference
| Method | Path          | Response                                            |
|--------|---------------|-----------------------------------------------------|
| GET    | `/api/health` | `{ status: "ok", uptime: number, timestamp: ISO }`  |

---

## 4. Frontend

- **`api/client.ts`** — `apiGet<T>(path)`: a small typed `fetch` wrapper. Base URL comes from `VITE_API_BASE_URL` (empty by default so requests are relative and go through the Vite proxy). Throws on non-2xx responses.
- **`api/health.ts`** — `fetchHealth()` calls `GET /api/health`, typed as `HealthStatus`.
- **`hooks/useHealth.ts`** — encapsulates the fetch as a state machine: `loading → ready | error`. Guards against setting state after unmount.
- **`components/StatusBadge.tsx`** — presentational pill with `neutral | success | error` tones.
- **`pages/HomePage.tsx`** — renders the badge based on `useHealth()`: "Checking…", an error message, or the API status plus uptime and last-checked time.

### Vite dev proxy (`vite.config.ts`)
- Dev server port from `VITE_PORT` (default `5173`).
- Proxies `/api` → `VITE_API_BASE_URL` (default `http://localhost:3000`) with `changeOrigin: true`.

---

## 5. Configuration & Environment

All settings come from `.env` files — copy the provided `.env.example` in each package. No values are hardcoded.

**backend/.env**
```
PORT=3000
NODE_ENV=development
API_PREFIX=api
CORS_ORIGIN=http://localhost:5173   # comma-separated allowed origins
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:3000   # proxied target for /api in dev
VITE_PORT=5173
```

---

## 6. Getting Started

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run start:dev      # http://localhost:3000/api
npm test               # unit tests
npm run test:e2e       # e2e tests
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

Open http://localhost:5173 — the page fetches `/api/health` and shows a green "API: ok" badge when the backend is reachable.

---

## 7. Scripts Reference

**Backend**
| Script            | Purpose                              |
|-------------------|--------------------------------------|
| `npm run build`   | `nest build`                         |
| `npm run start`   | Start (no watch)                     |
| `npm run start:dev` | Start with watch mode              |
| `npm run start:prod`| Run compiled `dist/main.js`        |
| `npm run lint`    | ESLint (with `--fix`)                |
| `npm test`        | Jest unit tests                      |
| `npm run test:e2e`| Jest e2e tests                       |

**Frontend**
| Script            | Purpose                              |
|-------------------|--------------------------------------|
| `npm run dev`     | Vite dev server                      |
| `npm run build`   | Type-check (`tsc`) + Vite build      |
| `npm run preview` | Preview production build             |
| `npm run lint`    | ESLint                               |

---

## 8. Testing

- **Unit** (`health.service.spec.ts`) — verifies `HealthService.check()` returns `status: "ok"` with a numeric `uptime` and a valid `timestamp`.
- **e2e** (`health.e2e-spec.ts`) — boots the full app (with `/api` prefix) and asserts `GET /api/health` returns `200` and `status: "ok"`.

---

## 9. Tech Stack

| Layer     | Technology                                             |
|-----------|--------------------------------------------------------|
| Backend   | NestJS 10, TypeScript 5, Express, RxJS, Jest, Supertest|
| Frontend  | React 18, Vite 5, TypeScript 5                          |
| Config    | `@nestjs/config` (backend), Vite env loading (frontend) |
