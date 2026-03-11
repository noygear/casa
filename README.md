# Cardo — Commercial Real Estate Operations Platform

A modern, full-stack web application for managing maintenance requests, vendor relationships, and operational efficiency across commercial real estate portfolios.

**Repository:** [GitHub - CRE_Ticket_System](https://github.com/AdamRehman-Create/CRE_Ticket_System)

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Core Workflows](#core-workflows)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)

---

## Overview

**Cardo** is a unified operational platform designed specifically for Commercial Real Estate (CRE) teams to eliminate silos and enforce accountability across maintenance workflows, vendor management, and compliance tracking. Built with modern web technologies and best practices, it delivers a seamless experience across property managers, vendors, and tenants.

The system provides **portfolio-wide visibility**, **real-time collaboration**, **audit trails**, and **performance analytics** to drive operational excellence in property management.

---

## Problem Statement

Commercial Real Estate property management teams face significant operational friction:
- ❌ Disconnected systems leading to ignored SLAs
- ❌ Lack of proof-of-work from third-party vendors
- ❌ Missed preventative maintenance schedules
- ❌ Repeated critical failures with no accountability
- ❌ Difficulty tracking costs and vendor performance
- ❌ Poor communication between stakeholders

**Cardo solves these challenges** through centralized tracking, mandatory evidence collection, and data-driven insights.

---

## Key Features

### 1. **Maintenance Request Tracking** 🎫
- Centralized reporting and routing for tenant-submitted issues
- Intelligent ticketing system with automatic categorization
- Priority levels and severity badges for quick triage
- Real-time status tracking and updates

### 2. **Vendor Accountability & Scoring** ⭐
- Mandatory before/after photo evidence for all work completions
- Automated vendor performance scoring based on quality, speed, cost, and consistency
- Vendor leaderboards and benchmarking
- Performance trends and historical metrics

### 3. **SLA Management & Compliance** 📊
- Automated SLA tracking with visual compliance indicators
- Alert system for approaching deadlines
- SLA compliance dashboards for portfolio overview
- Historical compliance reporting and analytics

### 4. **Inspection & Correction Workflows** ✓
- Specialized inspection tickets with mandatory verification steps
- Life-safety and code compliance checklists
- Correction loops ensuring all issues are resolved
- Multi-stage sign-off process for high-liability work

### 5. **Preventative Maintenance Scheduling** 🔄
- Recurring task templates (quarterly HVAC service, annual fire checks, etc.)
- Automated work order generation based on schedules
- Asset lifecycle tracking
- Maintenance history and trending analytics

### 6. **Cost & Budget Tracking** 💰
- Invoice cost capture per work order
- Vendor cost aggregation and analysis
- ROI calculations for maintenance investments
- Budget forecasting tools

### 7. **Dashboard & Reporting** 📈
- Real-time operational dashboards
- Vendor performance analytics and scorecards
- Portfolio health metrics
- Repetitive issue detection (smart alerts for recurring problems)
- Customizable reports and exports

---

## User Roles

The system enforces strict role-based access control:

### 👨‍💼 Property Manager / Asset Manager
The core administrative user managing the portfolio.
- Portfolio-wide visibility and ticket triage
- Work assignment to vendors or internal staff
- Proof-of-work review and verification
- SLA compliance monitoring and dashboards
- Vendor performance evaluation and scorecards

### 🔧 External Vendors
Third-party contractors (HVAC, electrical, plumbing, etc.).
- Mobile-friendly dashboard
- Assigned work order queue
- Photo upload capability (before/after evidence)
- Service memo and cost input
- Job completion workflow

### 🏢 Tenants / Residents
End-users occupying managed spaces.
- Simplified maintenance request submission
- Personal ticket tracking and status updates
- Update notifications
- No access to internal routing or financial details

---

## Core Workflows

### 1. Standard Tenant Maintenance Request
```
Tenant Submission → PM Review & Assignment → Vendor Execution → Completion & Evidence → Closed
```

**Process:**
1. **Creation**: Tenant submits ticket (e.g., "AC not blowing cold air in Suite 200") → Status: `Open`
2. **Assignment**: PM reviews, categorizes, and assigns to vendor → Status: `Assigned`
3. **Execution**: Vendor arrives and begins work → Status: `In Progress`
4. **Resolution**: Vendor uploads evidence photos, enters cost → Status: `Closed`

### 2. Inspection & Correction Workflow
```
PM Creates Inspection → Vendor Executes → Review Required → PM Approval/Rejection → Resolution
```

**Process:**
1. **Creation**: PM creates inspection ticket (e.g., "Annual Fire Alarm Testing")
2. **Execution**: Vendor performs inspection, uploads before/after evidence
3. **Verification**: High-liability inspections move to `Needs Review`
4. **Sign-off**: PM reviews photos and memo → `Closed` or rejects to `In Progress`

### 3. Preventative Maintenance
```
Recurring Template → Auto-Generate Work Orders → Assign & Track → Record History
```

**Process:**
- Templates define frequency (e.g., Quarterly HVAC filter replacements)
- System automatically creates localized work orders on schedule
- Tracked for SLA compliance and preventative value
- Historical data enables trend analysis and lifecycle management

---

## Technology Stack

### Frontend
- **React** (^18.3.1) - Component-based UI framework
- **TypeScript** (^5.6.2) - Type-safe development
- **Vite** (^6.0.0) - Lightning-fast build tool
- **React Router** (^6.28.0) - Client-side routing
- **Tailwind CSS** (^3.4.15) - Utility-first styling
- **Recharts** (^3.8.0) - Data visualization
- **Lucide React** (^0.460.0) - Icon library

### Backend & Database
- **Prisma** - ORM for database abstraction
- **PostgreSQL** - Relational database

### Development & Build
- **ESLint** (^9.13.0) - Code quality
- **PostCSS** (^8.4.49) - CSS processing
- **Autoprefixer** (^10.4.20) - Browser compatibility

### Deployment
- **Vercel** - Optimized deployment platform

---

## Project Structure

```
CRE_Ticket_System/
├── src/
│   ├── components/              # Reusable React components
│   │   ├── AppShell.tsx        # Main app layout
│   │   ├── WorkOrderCard.tsx   # Work order card UI
│   │   ├── VendorDetailModal.tsx
│   │   ├── VendorScorecard.tsx
│   │   ├── WorkOrderDetailModal.tsx
│   │   ├── StatusChip.tsx      # Status badge
│   │   ├── SeverityBadge.tsx   # Severity indicator
│   │   └── SLABadge.tsx        # SLA compliance badge
│   ├── pages/                   # Page components
│   │   ├── DashboardPage.tsx   # Main operations dashboard
│   │   ├── WorkOrdersPage.tsx  # Work orders management
│   │   ├── VendorsPage.tsx     # Vendor management
│   │   ├── SLACompliancePage.tsx # SLA analytics
│   │   ├── PropertiesPage.tsx  # Property portfolio
│   │   ├── TenantDashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── LandingPage.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx     # User & auth state
│   ├── domain/                  # Business logic
│   │   ├── workOrderStateMachine.ts
│   │   ├── slaTracker.ts
│   │   ├── vendorScoringEngine.ts
│   │   └── repeatIssueDetector.ts
│   ├── hooks/
│   │   └── useIssueDetection.ts
│   ├── types/
│   │   └── index.ts            # TypeScript definitions
│   ├── data/
│   │   └── mockData.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                      # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── index.html
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **npm** (v9+) or **Yarn**
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AdamRehman-Create/CRE_Ticket_System.git
   cd CRE_Ticket_System
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running Locally

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   Navigate to `http://localhost:5173/`

3. **Hot reload:**
   Changes are reflected instantly during development

---

## Development

### Available Scripts

- **`npm run dev`** - Start dev server with HMR
- **`npm run build`** - Build for production
- **`npm run lint`** - Run ESLint
- **`npm run preview`** - Preview production build

### Architecture

- **State Management**: React Context (AuthContext)
- **Business Logic**: Encapsulated in `domain/` folder
- **Components**: Located in `components/` with co-located styles
- **Pages**: Full-screen views in `pages/`

### Key Algorithms

1. **Work Order State Machine** - Enforces valid state transitions (Open → Assigned → In Progress → Needs Review → Closed)
2. **SLA Tracker** - Calculates response and resolution time compliance
3. **Vendor Scoring Engine** - Evaluates quality, speed, consistency, and volume
4. **Repetitive Issue Detector** - Alerts for 3+ similar issues in same location within 90 days

---

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Vercel auto-deploys on push to main
3. Configure environment variables in Vercel dashboard

### Manual Deployment

```bash
npm run build
npm run preview
# Deploy dist/ directory to your hosting provider
```

---

## Data Model

Key entities in the system:
- **User** - Property managers, vendors, tenants
- **Property** - Physical addresses (buildings, complexes)
- **Space** - Subdivisions (suites, floors, parking)
- **WorkOrder** - Maintenance tickets with state machine
- **WorkOrderPhoto** - Before/after evidence
- **WorkOrderAuditLog** - Immutable audit trail
- **Vendor** - Contractor organizations
- **RecurringTemplate** - Preventative maintenance templates
- **RecurringInstance** - Generated work orders from templates

For the complete schema, see [prisma/schema.prisma](prisma/schema.prisma).

---

## Key Features Explained

### Work Order State Machine
Enforces strict state transitions:
- `Open` → Created by tenant
- `Assigned` → PM assigns to vendor
- `In Progress` → Vendor begins work
- `Needs Review` → High-liability work for verification
- `Closed` → PM approves or auto-closes

### SLA Tracking
Monitors two key metrics:
- **Response Time**: Creation → Assigned/In Progress (based on severity)
- **Resolution Time**: Creation → Closed (based on severity)

### Vendor Scoring
Multi-dimensional scoring algorithm:
- **Quality**: Based on approval rate and rework frequency
- **Speed**: SLA compliance percentage
- **Consistency**: Task completion rate and responsiveness
- **Volume**: Number of completed work orders

### Smart Alerts
Repetitive issue detection:
- Identifies 3+ same-category issues in same space within 90 days
- Flags for capital expenditure review (vs. temporary fixes)

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Follow project structure and conventions
3. Commit with clear messages: `git commit -m "Add: feature description"`
4. Push and create a Pull Request

---

## Support

Issues or questions? [Open an issue on GitHub](https://github.com/AdamRehman-Create/CRE_Ticket_System/issues)

---

## Roadmap

- [ ] Advanced analytics dashboard
- [ ] Native mobile app (React Native)
- [ ] Third-party integrations (accounting, calendar, etc.)
- [ ] Advanced reporting and exports
- [ ] Real-time notifications (WebSockets)
- [ ] Multi-language support
- [ ] API documentation and SDK

---

**Built with ❤️ for streamlined Commercial Real Estate operations.**
