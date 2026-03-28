# Casa — CRE Operations Platform

A demo platform for managing maintenance requests, vendor accountability, and SLA compliance across commercial real estate portfolios.

**Live Demo:** [cre-ticket-system.vercel.app](https://cre-ticket-system.vercel.app) &nbsp;|&nbsp; **Repo:** [GitHub](https://github.com/AdamRehman-Create/CRE_Ticket_System)

---

## Demo Accounts

Log in as any role to walk through the full workflow:

| Role | Email | What they can do |
|------|-------|-----------------|
| Asset Manager | `sarah.chen@casa.com` | Full portfolio view, analytics, vendor scorecards |
| Property Manager | `james.porter@meridianpm.com` | Assign tickets to vendors, review completed work |
| Vendor (HVAC) | `ops@alphahvac.com` | Submit proof of work, upload before/after photos |
| Vendor (Electrical) | `dispatch@sparkelectric.com` | Same as above |
| Tenant | `tenant@greenleafcorp.com` | Submit requests, track their own tickets |

---

## Full Ticket Workflow

```
Tenant creates request
        ↓
Property Manager assigns to a vendor
        ↓
Vendor marks in progress → submits evidence (photos + memo + cost)
        ↓
Asset Manager sees completed ticket with full audit trail
```

Each step triggers an audit log entry. Evidence photos are visible to all authorized roles on the ticket detail view.

---

## Features

- **Role-based access** — each user sees only what's relevant to their role
- **Work order state machine** — enforces valid transitions: `open → assigned → in_progress → needs_review → closed`
- **Vendor assignment** — PM selects from active vendors when assigning a ticket
- **Evidence collection** — vendors upload before/after photos and a service memo on close
- **SLA tracking** — response and resolution timers per ticket, color-coded by severity
- **Inspection correction loops** — high-liability tickets require both photos before moving to review
- **Vendor scoring** — automated performance scores based on rejections, lateness, and volume
- **Recurring PM templates** — scheduled preventative maintenance (HVAC filters, fire inspections, etc.)
- **Smart alerts** — flags repeated issues in the same location within 90 days

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite |
| Backend | Express, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT + bcrypt + httpOnly cookies |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| Validation | Zod |
| Deployment | Vercel (frontend), Fly.io (backend) |

---

## Getting Started

### Quick Start (Full Stack)

```bash
git clone https://github.com/AdamRehman-Create/CRE_Ticket_System.git
cd CRE_Ticket_System
npm install
```

**Start the backend** (embedded Postgres — no external DB needed):

```bash
cd server
npm install
npm run dev                   # Starts API on port 3001 with auto-seeded data
```

**Start the frontend** (in a separate terminal):

```bash
npm run dev                   # Vite dev server (port 5173 or next available)
```

Open the URL shown in the terminal and log in with any account from the table above. Default password: `Casa2025!`

The Vite dev server proxies `/api` requests to `localhost:3001` automatically — no CORS configuration needed.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server with HMR |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run lint` | Run ESLint |
| `cd server && npm run dev` | Start backend API server with embedded Postgres |
| `cd server && npm run seed` | Re-seed database with demo data |

---

## Project Structure

```
src/                          # Frontend (React)
├── components/               # Modals, cards, badges, layout
├── pages/                    # One file per route/role view
├── domain/                   # Pure business logic (shared with backend)
├── contexts/                 # Auth context (JWT session)
├── hooks/                    # React Query hooks (useWorkOrders, useVendors, etc.)
├── lib/                      # API client (Axios) and React Query config
├── data/                     # Legacy mock data
└── types/                    # TypeScript interfaces

server/                       # Backend (Express)
├── src/
│   ├── routes/               # REST API endpoints
│   ├── services/             # Business logic + Prisma queries
│   ├── middleware/            # Auth, RBAC, validation, errors
│   ├── validation/           # Zod schemas
│   └── errors/               # Typed error classes
├── prisma/seed.ts            # Demo data seeder
├── Dockerfile                # Multi-stage build for Fly.io
└── package.json

prisma/
└── schema.prisma             # 16 models (PostgreSQL)

fly.toml                      # Fly.io deployment config
```

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | JWT login (httpOnly cookie) |
| POST | `/api/auth/logout` | Revoke token |
| GET | `/api/auth/me` | Current user |
| GET/POST | `/api/work-orders` | List (filtered) / Create |
| GET/PATCH | `/api/work-orders/:id` | Get / Transition + update |
| POST | `/api/work-orders/:id/photos` | Upload evidence photo |
| GET | `/api/vendors` | List with scores |
| GET | `/api/properties` | List with spaces |
| GET | `/api/sla/compliance` | SLA metrics |
| GET | `/api/sla/analytics` | Portfolio analytics |
| GET/POST | `/api/recurring-templates` | PM schedules |
| GET/POST | `/api/preferred-vendor-mappings` | Vendor assignments |

### Domain Layer (Pure Functions — shared FE/BE)

| File | Responsibility |
|------|---------------|
| `workOrderStateMachine.ts` | Role-gated state transitions and validation |
| `slaTracker.ts` | Response/resolution time computation |
| `vendorScoringEngine.ts` | Quality, speed, consistency, volume scoring |
| `repeatIssueDetector.ts` | Recurring issue detection (90-day window) |
| `autoAssigner.ts` | Preferred vendor auto-assignment |
| `gpsValidator.ts` | GPS proximity validation (Haversine) |
| `portfolioAnalytics.ts` | Portfolio-level KPIs for asset managers |
| `propertyHealthCalculator.ts` | Property health scores and budgets |
| `vendorReferralEngine.ts` | Underperformer detection and alternatives |

---

## Data Model

16 models: `User`, `Property`, `Space`, `WorkOrder`, `WorkOrderPhoto`, `WorkOrderAuditLog`, `Vendor`, `VendorScoreRecord`, `RecurringTemplate`, `RecurringInstance`, `InspectionReport`, `SLAConfiguration`, `PreferredVendorMapping`, `RevokedToken`

See [`prisma/schema.prisma`](prisma/schema.prisma) for the full schema.

---

## Deployment

**Frontend:** Deployed on Vercel as static SPA.

**Backend:** Configured for Fly.io with `fly.toml` and multi-stage `Dockerfile`.

```bash
fly launch
fly postgres create && fly postgres attach
fly secrets set JWT_SECRET="..." FRONTEND_URL="https://your-app.vercel.app"
fly deploy
```
