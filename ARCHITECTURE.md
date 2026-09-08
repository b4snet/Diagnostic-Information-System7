# Architecture

`src/domain.js` is the Step 1 pure domain layer. `src/canonical.js` is the Step 2 pure canonical layer for controlled values, coding/units, services, work, acquisitions, observations, studies, interpretations, verification, and object metadata. `src/api.js` exposes explicit projections without storage/audit internals. `src/platform.js` contains replaceable local adapter boundaries. Transport, vendor protocols, cloud storage, and database technology are outside the core.

`src/workflow-engine.js` is the Step 4 operational layer. It orchestrates idempotent order-to-work generation, schedules, assignment, operator leases, guarded acquisition/processing/completion milestones, and worklist projections without adding modality-specific logic.

The intended flow is Patient → Order → Work → Acquisition → Result → Interpretation/Report → Verification → Distribution. Step 1 implements the order/result/report portions only; acquisition and interpretation remain modeled boundaries.

Organizations contain multiple sites; every protected resource carries organization and site identity. The local proof adapter rejects missing or mismatched context. A production PostgreSQL adapter should use a non-owner application role and database-enforced RLS.
