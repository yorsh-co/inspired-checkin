# Changelog

## [0.0.2] - 2026-06-25

### Added

- Postgres-backed checkin schema (sequential checkin numbers, ticket/user fields) with a migration runner (`scripts/migrate.js`)
- Role-based session system replacing single-JWT auth: independent `checkin`, `user`, and `admin` sessions, each with its own cookie and TTL
- Stateful, resumable checkin flow (ticket → phone verification → QR) that persists progress server-side across requests and devices
- Phone-based verification step (last 4 digits) between ticket entry and QR scan
- Sequential check-in numbering, assigned atomically on flow completion
- Role-scoped routers: `/api/v1/admin` and `/api/v1` (user), gated by `requireRole`
- Debug endpoints for inspecting/clearing sessions in non-production environments
- Resilient startup: server waits for Redis and Postgres to be ready (with retry/backoff) before accepting traffic
- Rebuilt checkin UI as a step-based flow with shared idle/processing/success/error states, skeleton loading states, and a boot screen
- Top bar with debug and logout actions
- Stub admin and user-dashboard pages
- `dotenv-cli` and Docker-based `dev:redis` / `dev:postgres` scripts for local development

### Changed

- Renamed package from `gps.inspire` to `inspired-checkin`
- Replaced `DATABASE_URL` with discrete Postgres connection settings; restructured Redis config; added per-session-type TTLs to `.env.example`
- Reorganized frontend UI/utility modules into namespaced subfolders (`modules/ui/*`, `modules/utils/*`)

### Removed

- Old single-JWT auth flow (`modules/auth/*`)
- Old single-page checkin view and scripts, including dead/commented-out exploratory code
- Unused `dev.server.js` and `TODO.html`

### Security

- Checkin sessions are rotated after phone verification to limit replay of a partially-completed flow

---

## [0.0.1] - 2026-04-08

### Added

- Initial Express app with EJS views and static checkin page
- Single JWT-based auth flow (`auth_token` cookie) covering ticket validation and QR scan
- Basic ticket and QR services backed by Postgres and Redis
- Local dev tooling: `nodemon`, `concurrently`, Cloudflare tunnel script
