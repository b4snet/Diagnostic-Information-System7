# Security and tenancy

The local proof requires authenticated actor, organization, and site context and rejects cross-tenant reads. Audit events preserve actor, tenant scope, action, resource reference, timestamp, and correlation ID without copying diagnostic content. This is a local code proof, not a complete authentication/authorization system or compliance certification. Encryption, object storage policy, key management, production RLS, and patient-level policy require production implementation.
