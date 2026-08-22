# agent-pet-testing

Full-stack scaffold: **NestJS** backend + **React (Vite)** frontend, wired together via a `/api/health` endpoint.

## Structure

```
├── backend/     NestJS API (TypeScript)
│   ├── src/
│   │   ├── main.ts, app.module.ts
│   │   ├── config/          env-based configuration
│   │   ├── common/          exception filter + logging interceptor
│   │   └── modules/health/  sample module (controller/service/spec)
│   └── test/                e2e setup + spec
└── frontend/    React + Vite SPA (TypeScript)
    └── src/
        ├── api/         HTTP client + typed endpoints
        ├── hooks/       useHealth hook
        ├── components/  StatusBadge
        └── pages/       HomePage
```

## Getting started

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

The frontend calls the backend's `/api/health` endpoint; in dev, Vite proxies `/api` to the backend (configurable via `VITE_API_BASE_URL`).

All configuration comes from `.env` files — see each `.env.example`. No values are hardcoded.
