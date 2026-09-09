# kashGo

kashGo is a customer wallet experience based on the supplied KolaKash mobile screens, with the brand renamed to kashGo and new accounts starting empty.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/kashgo/src/App.tsx` — the customer app shell, reference-aligned screens, routes, and local account interactions
- `artifacts/kashgo/src/index.css` — kashGo visual tokens, responsive shell, and motion styles
- `artifacts/kashgo/.replit-artifact/artifact.toml` — managed web artifact and preview routing
- `attached_assets/` and `.local/conversation-workspace/files/attached_assets/` — original visual references supplied by the user

## Architecture decisions

- The first customer release is frontend-first and uses localStorage-backed account state so a new customer starts with no seeded identity, funds, transactions, beneficiaries, or promotional records.
- Money movement validates against the customer’s available balance; all wallet balances begin at zero until a funding service is connected.
- The layout follows the supplied mobile screen structure: purple status bar, gray header, branded logo strip, plum balance card, service panels, and bottom navigation.
- The app keeps the supplied magenta, plum, green, and ink direction while using kashGo-only branding.

## Product

kashGo includes the supplied welcome flow, phone sign-in, PIN entry, balance visibility controls, home services, transfers, account balances and statements, options, menu navigation, fees, notifications, profile, gift cards, vouchers, donations, and account sign-out.

## User preferences

- The user wants the product name to be kashGo and the customer experience to follow the supplied mobile screen references.

## Gotchas

- Account state is intentionally local to the browser until production authentication, funding, and transaction providers are connected.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
