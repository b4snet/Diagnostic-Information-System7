# Audit

The Step 1 local tenant store creates append-only in-memory audit events for reads and creates, scoped to actor, organization, site, action, resource reference, time, and correlation ID. It does not include diagnostic payloads. Persistent audit integrity, mutation auditing for all Step 2 resources, retention, and database enforcement are not implemented.
