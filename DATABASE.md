# Database boundary

No database, schema, migration, index, foreign key, application role, or RLS policy is implemented. The canonical objects define the relational ownership and reference boundaries a future PostgreSQL adapter must enforce. The existing in-memory store is only a local application-level tenancy proof and must not be treated as RLS proof.
