# Diagnostic Worklist & Acquisition Workflow Engine

`src/workflow-engine.js` is a pure local domain engine. It turns an order into an idempotent work item and keeps order, work, schedule, assignment, claim lease, acquisition start, processing, completion, failure, and cancellation distinct.

```text
Order → ready work → scheduled/assigned → in-progress → acquired → processing → completed
                                   └→ cancelled / failed → ready or cancelled
```

Every operation requires actor, organization, and site scope. Worklist responses are intentionally operational summaries and omit patient identifiers. Resource schedules reject overlapping intervals, claims prevent simultaneous ownership until expiry, lifecycle transitions are guarded, and cancellation/failure require a reason. Device assignment can validate an active device through the Step 3 registry.

This is not a database scheduler, queue, API, frontend, RBAC system, calendar, RLS proof, or clinical interpretation system. It does not connect hardware or finalize results/reports.
