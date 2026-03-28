# Work Order State Machine Rules

The state machine at `src/domain/workOrderStateMachine.ts` is the single source of truth for ticket transitions. Never bypass it.

## Valid Transitions

```
open → assigned         (property_manager, asset_manager)
open → skipped          (property_manager, asset_manager — recurring only)
assigned → in_progress  (vendor, property_manager, asset_manager)
assigned → skipped      (property_manager, asset_manager — recurring only)
in_progress → needs_review  (vendor, PM, AM — requires photos)
in_progress → closed       (vendor, PM, AM — requires photos)
needs_review → closed      (vendor, PM, AM — work accepted)
needs_review → in_progress (PM, AM — REJECTION, triggers score penalty)
closed → [none]            (terminal)
skipped → [none]           (terminal)
```

## Enforcement Rules

- `validateTransition(ctx)` throws `WorkOrderTransitionError` on any invalid transition. Never catch and silence this error.
- `getAvailableTransitions(status, role)` returns valid next states for UI button rendering.
- `isRejection(from, to)` detects the correction loop (needs_review → in_progress).
- Inspection tickets (`isInspection: true`) transitioning to `needs_review` require both `before` AND `after` photos.

## Side Effects (Service Layer Only)

The state machine is a pure validator. Side effects happen in the service layer:
- **On rejection**: Apply quality penalty to vendor score. Write audit log with `note: "rejected"`.
- **On close**: Record completion timestamp. Update SLA metrics.
- **On skip**: Apply consistency penalty. Only valid for recurring tickets.
