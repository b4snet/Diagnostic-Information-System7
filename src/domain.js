/** Pure canonical diagnostic domain. No HTTP, database, or vendor protocol dependencies. */
import { randomUUID } from 'node:crypto';

export const workflowTransitions = Object.freeze({
  ordered: ['accepted', 'scheduled', 'cancelled', 'rejected'],
  accepted: ['scheduled', 'ready', 'cancelled'],
  scheduled: ['ready', 'cancelled'], ready: ['in_progress', 'cancelled'],
  in_progress: ['acquired', 'cancelled'], acquired: ['processing'],
  processing: ['interpretation_pending', 'draft'], interpretation_pending: ['draft'],
  draft: ['verified', 'cancelled'], verified: ['released'], released: ['amended'],
  amended: [] , cancelled: [], rejected: []
});

export class DomainError extends Error {}
export const id = () => randomUUID();
export function required(value, name) { if (!value) throw new DomainError(`${name} is required`); return value; }
export function identifier({ value, system, assigningAuthority, type, source = 'manual' }) {
  return Object.freeze({ id: id(), value: required(value, 'identifier value'), system: required(system, 'identifier system'), assigningAuthority: required(assigningAuthority, 'assigning authority'), type: required(type, 'identifier type'), source, createdAt: new Date().toISOString() });
}
export function diagnosticOrder({ organizationId, siteId, patientId, serviceCode, identifiers = [], actorId }) {
  [organizationId, siteId, patientId, serviceCode, actorId].forEach((x, i) => required(x, ['organizationId','siteId','patientId','serviceCode','actorId'][i]));
  return { id: id(), organizationId, siteId, patientId, serviceCode, identifiers, status: 'ordered', createdAt: new Date().toISOString(), createdBy: actorId, version: 1 };
}
export function transition(order, next, actor) {
  required(actor, 'actor');
  if (!(workflowTransitions[order.status] || []).includes(next)) throw new DomainError(`Invalid transition ${order.status} -> ${next}`);
  return { ...order, status: next, version: order.version + 1, updatedAt: new Date().toISOString(), updatedBy: actor };
}
export function measurement({ code, value, unit, observedAt, deviceId, performerId, provenance }) {
  [code, value, unit, observedAt, provenance].forEach((x, i) => required(x, ['code','value','unit','observedAt','provenance'][i]));
  return Object.freeze({ id: id(), code, value, unit, observedAt, deviceId: deviceId || null, performerId: performerId || null, provenance, status: 'preliminary' });
}
export function result({ orderId, patientId, organizationId, siteId, measurements, provenance }) {
  [orderId, patientId, organizationId, siteId, provenance].forEach((x, i) => required(x, ['orderId','patientId','organizationId','siteId','provenance'][i]));
  if (!Array.isArray(measurements) || !measurements.length) throw new DomainError('A result needs at least one measurement');
  return { id: id(), orderId, patientId, organizationId, siteId, measurements, provenance, status: 'preliminary', version: 1, createdAt: new Date().toISOString() };
}
export function finalizeResult(record, actor) { if (record.status === 'final') throw new DomainError('Final result cannot be overwritten'); return { ...record, status: 'final', finalizedAt: new Date().toISOString(), finalizedBy: required(actor, 'actor'), version: record.version + 1 }; }
export function report({ orderId, patientId, organizationId, siteId, authorId, content, resultIds = [], provenance }) {
  [orderId, patientId, organizationId, siteId, authorId, content, provenance].forEach((x,i) => required(x,['orderId','patientId','organizationId','siteId','authorId','content','provenance'][i]));
  return { id:id(), orderId, patientId, organizationId, siteId, authorId, content, resultIds, provenance, status:'draft', version:1, createdAt:new Date().toISOString() };
}
export function finalizeReport(record, verifierId) { if (record.status !== 'draft') throw new DomainError('Only draft reports can be finalized'); return { ...record, status:'final', verifiedBy:required(verifierId,'verifier'), verifiedAt:new Date().toISOString(), version:record.version+1 }; }
export function amendReport(finalReport, authorId, content, reason) { if (finalReport.status !== 'final') throw new DomainError('Only final reports can be amended'); return { ...finalReport, id:id(), status:'draft', version:finalReport.version+1, supersedes:finalReport.id, authorId:required(authorId,'author'), content:required(content,'content'), amendmentReason:required(reason,'reason'), createdAt:new Date().toISOString() }; }
