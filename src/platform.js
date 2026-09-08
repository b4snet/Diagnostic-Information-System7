import { DomainError } from './domain.js';

/** Local adapter for proofs only; replace behind this interface with PostgreSQL + RLS. */
export class TenantStore {
  #rows = new Map(); #audit = [];
  save(resource, context) {
    this.#scope(resource, context); if (this.#rows.has(resource.id)) throw new DomainError('Use an explicit version/amendment operation');
    this.#rows.set(resource.id, structuredClone(resource)); this.#event(context, 'create', resource); return structuredClone(resource);
  }
  get(id, context) { const resource = this.#rows.get(id); if (!resource) return null; this.#scope(resource, context); this.#event(context, 'read', resource); return structuredClone(resource); }
  list(context) { return [...this.#rows.values()].filter(x => x.organizationId === context.organizationId && (!x.siteId || x.siteId === context.siteId)).map(structuredClone); }
  audit(context) { return this.#audit.filter(x => x.organizationId === context.organizationId && x.siteId === context.siteId).map(x => structuredClone(x)); }
  #scope(resource, context) { if (!context?.actorId || !context?.organizationId || !context?.siteId) throw new DomainError('Authenticated organization and site context required'); if (resource.organizationId !== context.organizationId || (resource.siteId && resource.siteId !== context.siteId)) throw new DomainError('Tenant scope violation'); }
  #event(context, action, resource) { this.#audit.push(Object.freeze({ id:crypto.randomUUID(), at:new Date().toISOString(), actorId:context.actorId, organizationId:context.organizationId, siteId:context.siteId, action, resourceType:resource.constructor?.name || 'diagnostic-resource', resourceId:resource.id, correlationId:context.correlationId || null })); }
}
export class DeviceAdapterBoundary {
  ingest(_envelope) { throw new Error('Implement a vendor adapter that validates payload and returns canonical measurements plus provenance.'); }
}
export const interoperability = Object.freeze({ fhir: 'mapping boundary only', hl7v2: 'gateway boundary only', dicom: 'metadata/UID boundary only', dicomweb: 'not implemented', ihe: 'not implemented' });
