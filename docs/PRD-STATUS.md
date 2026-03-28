# Casa PRD Feature Status

Source of truth for what's built vs not. Cross-references PRD v1.0 (March 2026).

Last updated: 2026-03-28

## Must-Have (MVP Gate — May 1, 2026)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| C-01 | Ticket lifecycle with state machine enforcement | **Built (FE)** | `src/domain/workOrderStateMachine.ts` |
| C-02 | RBAC for 4 roles | **Built (FE)** | Client-side only. Server-side enforcement needed with backend. |
| C-03 | Mandatory photo evidence on completion | **Built (FE)** | GPS-tracked start + close photos added. |
| C-04 | SLA tracking with severity indicators | **Built (FE)** | `src/domain/slaTracker.ts` |
| C-11 | Real authentication (JWT + bcrypt) | **Not Built** | [#8](https://github.com/noygear/casa/issues/8) |
| C-12 | Backend API (REST + Prisma + PostgreSQL) | **Not Built** | [#8](https://github.com/noygear/casa/issues/8) |
| C-13 | Cloud photo storage (S3/Cloudinary) | **Not Built** | [#15](https://github.com/noygear/casa/issues/15) |

## Should-Have (MVP + 60 Days)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| C-05 | Automated vendor scoring engine | **Built (FE)** | `src/domain/vendorScoringEngine.ts` |
| C-06 | Recurring maintenance templates | **Built (FE)** | Templates + instance generation |
| C-07 | Repeat issue detection | **Built (FE)** | `src/domain/repeatIssueDetector.ts` |
| C-08 | Immutable audit trail | **Built (FE)** | Audit log UI. Immutability enforced with backend. |
| C-14 | Email notifications | **Not Built** | [#18](https://github.com/noygear/casa/issues/18) |
| C-15 | Mobile-responsive vendor UI | **Partial** | Responsive CSS + GPS camera capture. Needs mobile optimization. [#18](https://github.com/noygear/casa/issues/18) |

## Nice-to-Have (Year 1-2 Roadmap)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| C-09 | Cross-property analytics dashboard | **Built (FE)** | AM portfolio dashboard with cost trends, vendor audit, roll-up reporting. |
| C-10 | API marketplace (QuickBooks, Xero, IoT) | **Not Built** | [#21](https://github.com/noygear/casa/issues/21) |
| C-16 | Blockchain-verified audit trails | **Not Built** | [#25](https://github.com/noygear/casa/issues/25) |
| C-17 | Vendor micro-credentialing | **Not Built** | [#28](https://github.com/noygear/casa/issues/28) |
| C-18 | AI maintenance prediction | **Not Built** | [#31](https://github.com/noygear/casa/issues/31) |
| C-19 | Tenant portal with maintenance history | **Not Built** | [#34](https://github.com/noygear/casa/issues/34) |

## Features Built Beyond PRD

| Feature | Description |
|---------|-------------|
| GPS-tracked photos | Geolocation proof at work start and close (extends C-03) |
| Auto-assign to preferred vendors | Preferred vendor mappings per property + category with toggle |
| Property ingestion | Add properties via document upload or manual form |
| PM dashboard redesign | Property health scores, budget tracking, complaint volume charts |
| Asset manager portfolio dashboard | Portfolio KPIs, cost trends, vendor audit table (fulfills C-09) |
| Vendor referral engine | Detect underperformers, suggest alternatives, request introductions |

## GitHub Issue Tracker

| Parent Issue | Milestone | Label |
|-------------|-----------|-------|
| [#8 Backend API Foundation](https://github.com/noygear/casa/issues/8) | MVP | `MVP` |
| [#15 Cloud Photo Storage](https://github.com/noygear/casa/issues/15) | MVP | `MVP` |
| [#18 Notifications & Mobile](https://github.com/noygear/casa/issues/18) | MVP + 60 days | `post-MVP` |
| [#21 API Marketplace](https://github.com/noygear/casa/issues/21) | Year 1-2 | `roadmap` |
| [#25 Blockchain Audit Trails](https://github.com/noygear/casa/issues/25) | Year 1-2 | `roadmap` |
| [#28 Vendor Micro-Credentialing](https://github.com/noygear/casa/issues/28) | Year 2 | `roadmap` |
| [#31 AI Maintenance Prediction](https://github.com/noygear/casa/issues/31) | Year 1-2 | `roadmap` |
| [#34 Tenant Portal](https://github.com/noygear/casa/issues/34) | Year 1-2 | `roadmap` |
