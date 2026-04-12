# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## ShopNow — Shopping Website

**Artifact:** `artifacts/shopping-site` (react-vite, served at `/`)

### Features
- Login page with username/password authentication
- Product listing (12 products seeded) with search, star ratings, and Buy button
- Shopping cart with quantity controls, remove items, total price
- Checkout with payment form (bank name, account number, holder name)
- Account page with editable name, email, phone, age
- Navigation bar with cart item count badge

### Demo Credentials
- Username: `demo`, Password: `demo123`
- Username: `admin`, Password: `admin123`

### Architecture
- **Frontend**: React + Vite + Tailwind (framer-motion for animations)
- **Backend**: Express 5 routes in `artifacts/api-server/src/routes/`
  - `auth.ts` — login, logout, /me
  - `products.ts` — product listing with search
  - `cart.ts` — cart CRUD + checkout
  - `account.ts` — account view/update
- **Session**: Custom cookie-based sessions (signed cookies via cookieParser)
- **DB Schema**: `lib/db/src/schema/` — users, products, cart_items tables
