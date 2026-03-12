# Cardo — CRE Operations Platform

A demo platform for managing maintenance requests, vendor accountability, and SLA compliance across commercial real estate portfolios.

**Live Demo:** [cre-ticket-system.vercel.app](https://cre-ticket-system.vercel.app) &nbsp;|&nbsp; **Repo:** [GitHub](https://github.com/AdamRehman-Create/CRE_Ticket_System)

---

## Demo Accounts

Log in as any role to walk through the full workflow:

| Role | Email | What they can do |
|------|-------|-----------------|
| Asset Manager | `sarah.chen@cardo.com` | Full portfolio view, analytics, vendor scorecards |
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
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| Database schema | Prisma + PostgreSQL |
| Deployment | Vercel |

> The live demo runs on mock in-memory data. The Prisma schema defines the production data model.

---

## Getting Started

```bash
git clone https://github.com/AdamRehman-Create/CRE_Ticket_System.git
cd CRE_Ticket_System
npm install
npm run dev
```

Open `http://localhost:5173` and log in with any account from the table above.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Project Structure

```
src/
├── components/       # Modals, cards, badges, layout
├── pages/            # One file per route/role view
├── domain/           # Business logic (state machine, SLA, scoring)
├── contexts/         # Auth context
├── data/             # Mock data (users, properties, work orders)
└── types/            # TypeScript interfaces

prisma/
└── schema.prisma     # Full production data model
```

### Domain Layer

| File | Responsibility |
|------|---------------|
| `workOrderStateMachine.ts` | Role-gated state transitions and validation |
| `slaTracker.ts` | Response/resolution time computation |
| `vendorScoringEngine.ts` | Quality, speed, consistency, volume scoring |
| `repeatIssueDetector.ts` | Recurring issue detection (90-day window) |

---

## Data Model

Core entities: `User`, `Property`, `Space`, `WorkOrder`, `WorkOrderPhoto`, `WorkOrderAuditLog`, `Vendor`, `VendorScoreRecord`, `RecurringTemplate`

See [`prisma/schema.prisma`](prisma/schema.prisma) for the full schema.
