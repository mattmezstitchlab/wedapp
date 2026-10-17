# Le Grand Jour

Wedding planner built with Expo Router, React Native, tRPC and Express.

## Development

Use Node.js 24 and pnpm 9.12.0:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm test
pnpm lint
```

The Expo web dev server uses port 8081 and the API uses port 3000. For local
cross-origin API development, set the exact web origin in `EXPO_WEB_PREVIEW_URL`
and set `EXPO_PUBLIC_API_BASE_URL` to the API origin. Restart Expo after changing
public environment variables.

## Web deployment

`pnpm build` exports the web frontend into `dist`. `vercel.json` selects that
output and forwards `/api/*` requests to the Express function in `api/index.ts`.
The API keeps its `/api/health`, `/api/trpc` and OAuth routes. Vercel compiles the
function independently of the frontend export.

For a standalone API process, use `pnpm build:server && pnpm start`. Its output
is isolated in `dist-server`, never inside the public web output.

## Working features

- Personalize the wedding name, date and location from Planning → More options.
- Create, edit and delete vendors, filter/search them and update their status.
- Assign vendors to moments, move or remove assignments, undo the last change.
- Create, edit, delete and complete tasks.
- View estimated budgets, consolidated needs and scheduling warnings.
- Persist the workspace locally on the current device. Storage loads before
  editing is enabled; writes are serialized and failures are displayed.

The initial workspace contains **sample data**. Resetting the demo requires
confirmation and affects this device only. Editing or removing the browser's
site storage removes local data. Private browsing may not retain it. This is
not a cloud backup, and data is not synchronized across devices or users.

Budget deposits are **estimates**, not recorded bank transactions: paid vendors
count in full and other confirmed vendors assume a 30% deposit. Check invoices
before using these figures for financial decisions.

## External services not configured by this repository

The local workspace works without a database or login. Cloud synchronization,
shared accounts and event-member authorization are **not implemented**. The
starter's snapshot API is restricted to administrators and the client does not
automatically send local wedding data to it. Do not make it public or enable
collaboration without implementing per-event membership checks and conflict
handling first.

The starter uses MySQL/Drizzle (`DATABASE_URL`) and Manus OAuth (`MANUS_PROJECT_ID`,
`MANUS_JWT_SECRET`, `MANUS_OAUTH_API_URL`, `MANUS_OAUTH_PORTAL_URL`). These require
real services and protected environment-variable configuration. Never put secret
values in source or `EXPO_PUBLIC_*` variables. Schema migration is a separate,
explicit operation (`pnpm db:push`) against the intended database; deploying the
web frontend does not provision a database or run migrations.

OAuth, cloud collaboration, external media/storage, and native iOS/Android builds
need their own credentials and integration tests. A successful web build alone
does not validate those services.
