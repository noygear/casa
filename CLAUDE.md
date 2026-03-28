# CLAUDE.md — Casa: CRE Operations Platform

Read this file fully before writing or modifying any code.

## Project Purpose

Casa is a maintenance operations platform for mid-market commercial real estate operators (2-20 properties). It tracks work orders through a mandatory lifecycle, requires photo evidence, scores vendor performance automatically, and enforces SLA compliance. It is NOT a general project management tool.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Router v6 + Recharts
- **Backend**: Node.js + Express + TypeScript (to be built -- see @.claude/rules/backend-build.md)
- **Database**: PostgreSQL + Prisma ORM (schema at `prisma/schema.prisma`)
- **Auth**: JWT + bcrypt + httpOnly cookies (to be built -- mock auth exists)
- **Photo storage**: Cloudinary or AWS S3 (to be built -- base64 placeholder exists)
- **Deployment**: Vercel (frontend), Railway or Fly.io (backend)

## Architecture

```
src/
├── components/     # Reusable UI (modals, cards, badges)
├── pages/          # Route-level components
├── domain/         # Pure business logic — NO framework imports
├── contexts/       # React Context (auth)
├── hooks/          # Custom hooks
├── data/           # Mock data (replace with API calls)
├── types/          # TypeScript interfaces and enums
├── App.tsx         # Main routing
└── main.tsx        # Entry point
prisma/
└── schema.prisma   # 14 production-ready models
```

## Key Commands

```bash
npm run dev       # Vite dev server on :5173
npm run build     # TypeScript compile + Vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Critical Rules

1. **State machine is law.** All ticket transitions go through `src/domain/workOrderStateMachine.ts`. Never bypass it. Never add silent fallbacks. Invalid transitions throw `WorkOrderTransitionError`.

2. **Domain functions stay pure.** Files in `src/domain/` have zero imports from React, Express, or Prisma. They take typed inputs and return typed outputs. Test them with plain unit tests.

3. **Audit logs are immutable.** `WorkOrderAuditLog` has no cascade delete, no soft-delete, no update. Every state change creates a new log entry.

4. **Evidence is mandatory.** Transitioning to `needs_review` requires photos. Inspection tickets require both `before` and `after` photos. The API must reject transitions with missing evidence.

5. **Vendor scoring uses severity multipliers.** minor=1x, needs_fix_today=2x, immediate=4x. Rejection penalty: -10 x multiplier. Skip: -5 x multiplier. Lateness: -3/day x multiplier.

6. **Four user roles with strict RBAC.** asset_manager (full analytics), property_manager (assign + manage), vendor (execute + evidence), tenant (submit + track). Enforce server-side on every mutation.

7. **No Redis. No Socket.io.** Keep the dependency footprint small.

## What Needs Building

The frontend is production-ready with mock data. The backend does not exist yet. See `.claude/rules/backend-build.md` for the full build plan.

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately. Do not keep pushing.
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes. Do not over-engineer.
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Do not ask for hand-holding.
- Point at logs, errors, failing tests, then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what is necessary. Avoid introducing bugs.
