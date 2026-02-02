# Flow247

**AI-Powered Freight Management Platform** by FreightFlow AI / Ape Global

React + Vite + Tailwind + shadcn/ui frontend with Supabase auth and Xano business logic.

## Quick Start

```bash
# Install dependencies
npm install

# Copy env and fill in your keys
cp .env.example .env

# Start dev server
npm run dev
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Flow247 (React)                    │
│  Auth (Supabase) │ UI/UX │ Realtime │ React Query    │
└────────┬──────────────────┬──────────────────────────┘
         │                  │
    Supabase Auth      Xano v1 API
    (JWT tokens)       (business logic)
         │                  │
         ▼                  ▼
┌────────────────┐  ┌──────────────────┐
│   Supabase DB  │  │   Xano Backend   │
│ (profiles,     │  │ (quotes, bookings│
│  subscriptions,│  │  carriers, agents│
│  realtime)     │  │  integrations)   │
└────────────────┘  └──────────────────┘
```

**Principle:** Supabase = auth + user-local data + realtime. Xano = all business logic + carrier integrations. Frontend stays thin.

## Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite 7 + Tailwind + shadcn/ui | UI |
| Auth | Supabase Auth | JWT, Email, Google OAuth |
| Realtime | Supabase Realtime | Live tracking, notifications |
| Storage | Supabase Storage | Documents, avatars |
| User Data | Supabase Postgres | Profiles, preferences, subscriptions |
| Business Logic | Xano v1 API | Quotes, bookings, carriers, AI agents |
| Payments | Stripe (via Supabase Edge Functions) | Subscriptions, payments |
| AI | Xano AI Agents | Natural language freight ops |

## Pages

### Public
- `/` — Flow247 landing
- `/flow247` — Flow247 landing
- `/amass` — Amass operations landing
- `/ape-global` — Ape Global services landing
- `/pricing` — Plans & pricing
- `/auth/login` — Login (Email + Google)
- `/auth/signup` — Signup + trial init

### App (Protected)
- `/app` — Dashboard
- `/app/quotes` — Quote history
- `/app/quotes/new` — Multi-modal quote form
- `/app/shipments` — Shipment list
- `/app/shipments/new` — New shipment
- `/app/chat` — AI assistant (Xano agents)
- `/app/analytics` — Analytics & reports
- `/app/customers` — Customer CRM
- `/app/tracking` — Shipment tracking
- `/app/billing` — Subscription & billing (Stripe)
- `/app/profile` — User profile
- `/app/settings` — App settings

### CFS Operations
- `/app/cfs/control-tower` — CFS control tower
- `/app/cfs/lfd-monitor` — LFD monitor
- `/app/cfs/lfd-alerts` — LFD alerts
- `/app/cfs/container-tracking` — Container/HBL search
- `/app/cfs/tasks` — Task queue
- `/app/cfs/dispatch` — Dispatch center

### Ocean Booking
- `/app/ocean/bookings` — Bookings
- `/app/ocean/schedules` — Sailing schedules
- `/app/ocean/warehouse` — Warehouse receipts
- `/app/ocean/consolidation` — Consolidation
- `/app/ocean/documents` — Documentation

### Admin (Super Admin only)
- `/app/admin` — Admin dashboard
- `/app/admin/users` — User management
- `/app/admin/subscriptions` — Subscription management

## Supabase Setup

### Migrations

Run migrations in order:

```bash
# From project root
supabase db push --project-ref chpeeawrdhjfqgdhqhsr
```

Migrations include:
1. `20260201000000_create_subscriptions.sql` — Subscriptions table + RLS
2. `20260202000000_stripe_tables_from_xano.sql` — Plans, rate limits, payments
3. `20260202100000_security_lockdown.sql` — RLS on all tables + schema upgrades
4. `20260202200000_profile_trigger.sql` — Auto-create profile on signup
5. `20260202300000_storage_buckets.sql` — Documents & avatars storage

### Edge Functions

Deploy Stripe Edge Functions:

```bash
supabase functions deploy stripe-checkout --project-ref chpeeawrdhjfqgdhqhsr
supabase functions deploy stripe-webhook --project-ref chpeeawrdhjfqgdhqhsr --no-verify-jwt
supabase functions deploy stripe-portal --project-ref chpeeawrdhjfqgdhqhsr
```

Set secrets:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_... --project-ref chpeeawrdhjfqgdhqhsr
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --project-ref chpeeawrdhjfqgdhqhsr
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `VITE_XANO_API_BASE` | ✅ | Xano main API endpoint |
| `VITE_XANO_AGENT_BASE` | ✅ | Xano AI agent endpoint |
| `VITE_XANO_DASHBOARD_BASE` | ✅ | Xano dashboard/CFS endpoint |
| `VITE_XANO_STG_OPS_BASE` | ✅ | Xano STG operations endpoint |
| `VITE_STRIPE_PUBLISHABLE_KEY` | For billing | Stripe publishable key |
| `VITE_GOOGLE_MAPS_API_KEY` | Optional | Google Maps for tracking |

## i18n

Supported languages: English, Spanish, Portuguese (Brazil), Chinese (Simplified).

## License

Proprietary — Ape Global / FreightFlow AI
