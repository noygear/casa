# Cardo — Commercial Real Estate Operations Platform

## 1️⃣ Problem Definition

Commercial Real Estate (CRE) property management teams face significant operational friction when tracking and fulfilling maintenance requests, managing vendor relationships, and ensuring compliance across large portfolios. Disconnected systems often lead to ignored Service Level Agreements (SLAs), lack of proof-of-work from third-party vendors, missed preventative maintenance schedules, and repeated critical failures. 

**Cardo** is built to solve these exact problems by providing a unified operational platform that handles:
- **Maintenance Request Tracking**: Centralized reporting and routing for tenant issues.
- **Vendor Accountability**: Mandatory "before" and "after" photo evidence for work completion, tied directly to vendor scoring (quality, speed, consistency).
- **Inspection Documentation**: Formalized correction loops for property inspections, ensuring life-safety and code compliance issues are remedied properly.
- **Preventative Maintenance Scheduling**: Automated generation of recurring tasks (e.g., quarterly HVAC service, annual fire safety checks) to prolong asset lifespans.
- **Capital Expenditure & Cost Tracking**: Capturing invoice costs on individual tickets and rolling them up into vendor performance metrics to aid budget forecasting.

---

## 2️⃣ User Roles

The system enforces strict role-based access control to ensure users only see and interact with data relevant to their responsibilities:

- **Property Manager (PM) / Asset Manager**: The core administrative persona. PMs need portfolio-wide visibility to triage tickets, assign work to internal staff or external vendors, review submitted proof-of-work, monitor SLA compliance dashboards, and evaluate vendor performance scores.
- **External Vendors**: Third-party contractors (e.g., HVAC technicians, electricians, plumbers). Vendors need a frictionless mobile-friendly view to see their assigned work orders, upload required visual evidence (before/after photos), input service memos/costs, and mark jobs as completed.
- **Tenants / Residents**: The end-users occupying the managed spaces. Tenants need a simple, restricted interface to submit maintenance requests, track the status of their own tickets, and receive updates without seeing the internal routing or financial details of the property.

*Note: While Maintenance Staff and Ownership/Investors are common CRE personas, the current system MVP focuses heavily on the PM, Vendor, and Tenant triad.*

---

## 3️⃣ Core Workflows

The platform is driven by a robust state machine that governs how work is processed:

### Standard Tenant Maintenance Request
1. **Creation**: Tenant logs in and submits a ticket (e.g., "AC not blowing cold air in Suite 200"). Defaults to `Open`.
2. **Assignment**: Property Manager reviews the ticket, sets the category/severity, and assigns it to an external HVAC Vendor. Status changes to `Assigned`.
3. **Execution**: Vendor arrives on-site and begins work. Status changes to `In Progress`.
4. **Resolution**: Vendor completes the repair, uploads before/after evidence photos, enters the cost, and submits. Status changes to `Closed`.

### Inspection & Correction Workflow
1. **Creation**: Property Manager creates an `Inspection` ticket (e.g., "Annual Fire Alarm Testing"). 
2. **Execution**: Vendor performs the inspection and finds a fault. They make the necessary repairs and upload dual photo evidence.
3. **Verification**: Because this is a high-liability inspection, the vendor's submission moves the ticket to `Needs Review` rather than closing it automatically.
4. **Sign-off**: The Property Manager reviews the before/after photos and the service memo. If satisfactory, the PM manually transitions the ticket to `Closed`. If unsatisfactory, the PM rejects it back to `In Progress`.

### Preventative Maintenance (PMs)
Recurring tasks are defined via `Recurring Templates` (e.g., Quarterly HVAC Filter Replacements).
- The system automatically instantiates localized `Work Orders` based on the template's chronological frequency.
- These generated tickets behave exactly like standard requests but are flagged as Preventative Maintenance, ensuring routine asset care is tracked against SLAs.

---

## 4️⃣ System Requirements

To support the core workflows, the system implements the following core functionalities:

- **Ticket Lifecycle Management**: A strictly typed state machine (`open` → `assigned` → `in_progress` → `needs_review` → `closed`) preventing invalid workflow jumps.
- **Vendor Assignment & Portal**: Dedicated views for vendors to interact only with their assigned workload and securely submit data without accessing the broader property database.
- **Inspection Documentation (Proof-of-Work)**: Mandatory dual-photo upload logic (Base64 file persistence) tied to specific transition states.
- **Recurring Maintenance Scheduling**: Template-to-instance generation logic for chronological maintenance cycles.
- **Service-Level Agreement (SLA) Tracking**: Automated timers calculating `Response Time` (Creation → Assigned/In Progress) and `Resolution Time` (Creation → Closed) against predefined, severity-based targets.
- **Comprehensive Audit History**: Immutable chronological tracking of every status change and assignment transfer on a per-ticket basis.

---

## 5️⃣ Data Model

The relational architecture is designed specifically for Commercial Real Estate hierarchies:

- **Property**: The top-level physical address (e.g., "Meridian Tower").
- **Space**: A localized child of a Property (e.g., "Suite 200", "Lobby", "Parking Garage").
- **User**: The individuals interacting with the system, governed by an enum `Role` (`manager`, `tenant`, `vendor`).
- **Vendor**: Company-level entities that group vendor users and receive work assignments.
- **WorkOrder**: The central operational entity. Holds state, categorization, severity, financial cost, timelines, and relations to Property/Space/Users/Vendors.
- **WorkOrderPhoto**: Visual evidence strings (URLs/Base64) explicitly tied to a `WorkOrder` with a `type` constraint (`before`, `after`, `completion`).
- **WorkOrderAuditLog**: Historical records tracking the transitions of a Work Order for compliance analysis.
- **RecurringTemplate** & **RecurringInstance**: Definitions for cyclical work and the junction tables tracking the specific tickets spawned by those templates over time.

---

## 6️⃣ Metrics and Reporting

Data generated by daily operations is aggregated into actionable insights for the Property Manager:

- **Response & Resolution Times (SLA Analytics)**: Real-time and historical line graphs calculating the percentage of work orders meeting their targeted response and resolution deadlines (configurable by 1-month, 3-month, or All-Time windows).
- **Vendor Performance Scorecard**: An algorithmic scoring engine that evaluates vendors based on `Quality` (lack of rejected tickets), `Speed` (SLA compliance), `Consistency` (lack of skipped/ignored tickets), and `Volume`.
- **Recurring Issue Detection (Smart Insights)**: Algorithmic detection scanning for repetitive faults in the same physical location within abbreviated timeframes (e.g., 3 plumbing leaks in Suite 400 over 90 days), surfacing these as "System Alerts" on the dashboard to prompt capital expenditure discussions over band-aid repairs.
- **Portfolio Maintenance Statistics**: Live KPI tracking of Open vs. Closed workloads, active urgent tickets, and overall maintenance load allocation.
