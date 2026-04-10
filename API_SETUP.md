# API Integration Setup

## Frontend environment variable

Create `.env.development` (or `.env`) in the frontend project root with the **API root only** (no `/api/v1` suffix):

```
VITE_API_BASE=http://127.0.0.1:5000
```

Use the **backend** host and port (`PORT` in `backend/.env`, often `5000`). **Do not** set this to the Vite URL (`http://localhost:5173`); that breaks the dev proxy and causes `ENOBUFS` / 500-style errors on Windows. Prefer `127.0.0.1` over `localhost` if you see DNS/proxy issues locally.

**Important:** After changing env vars, restart the Vite dev server.

The app builds API paths as `VITE_API_BASE` + `/api/v1` (see `src/config/api.js`).

## Vite dev proxy

`vite.config.js` proxies these paths to `VITE_API_BASE`:

- `/api` — REST API
- `/uploads` — uploaded media
- `/test-email` — optional SMTP smoke test (`GET /test-email?to=...`)

## Dev-only email test page

When running `npm run dev`, open:

[http://localhost:5173/dev/email-test](http://localhost:5173/dev/email-test)

This calls the backend `GET /test-email` endpoint. Configure SMTP in `backend/.env` (`EMAIL_*` variables). In production, the same route may require `TEST_EMAIL_SECRET` as a query parameter.

## Production

Set `VITE_API_BASE` to your public API URL (e.g. `https://your-backend.up.railway.app`) at build time. The `/dev/email-test` route is not included in production builds.

## API Integration Status

### Phase 1

- **API Client**: `src/api/client.js` — Axios instance with error handling
- **Config**: `src/config/api.js` — `API_BASE` and `API_BASE_URL`
- **Auth**: `src/api/auth.api.js` — signup returns `emailSent` and `message` for welcome-email status

### Local quick check

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd sctsinstitute-fronend-new && npm run dev`
3. Register a user at `/register` or use `/dev/email-test` if `NODE_ENV=development` on the API
