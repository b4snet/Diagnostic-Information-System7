/** Step 3 device hub: pure, local, vendor-neutral orchestration. No network protocol or hardware support. */
import { id, required, DomainError } from './domain.js';
import { provenance } from './canonical.js';
export { DomainError } from './domain.js';

export const deviceTransitions = Object.freeze({ registered:['active','inactive','quarantined','retired'], active:['inactive','maintenance','disconnected','quarantined','retired'], inactive:['active','retired'], maintenance:['active','inactive'], disconnected:['active','inactive','quarantined'], quarantined:['inactive','retired'], retired:[] });
export const errorKinds = Object.freeze(['malformed-payload','unsupported-version','unknown-device','identity-mismatch','unknown-patient','unknown-order','workflow-rejected','mapping-failure','transient-failure','duplicate']);
const sameScope = (a,b) => a.organizationId === b.organizationId && a.siteId === b.siteId;
const requireContext = context => { for (const k of ['actorId','organizationId','siteId']) required(context?.[k],`context.${k}`); return context; };

export function device({ organizationId, siteId, manufacturer, model, serialNumber, modality, capabilities = [], integrationMethod, identifiers = [], firmwareVersion = null, softwareVersion = null, provenance: p }) {
  return { id:id(), organizationId:required(organizationId,'organizationId'), siteId:required(siteId,'siteId'), manufacturer:required(manufacturer,'manufacturer'), model:required(model,'model'), serialNumber:required(serialNumber,'serialNumber'), modality:required(modality,'modality'), capabilities, integrationMethod:required(integrationMethod,'integrationMethod'), identifiers, firmwareVersion, softwareVersion, status:'registered', provenance:required(p,'provenance'), createdAt:new Date().toISOString() };
}
export function transitionDevice(record, next, context) { requireContext(context); if (!sameScope(record,context)) throw new DomainError('Device scope violation'); if (!(deviceTransitions[record.status] || []).includes(next)) throw new DomainError(`Invalid device transition ${record.status} -> ${next}`); return {...record,status:next,statusChangedAt:new Date().toISOString(),statusChangedBy:context.actorId}; }
export function adapter({ id: adapterId, version, supportedModalities, parse, normalize }) { if (typeof parse !== 'function' || typeof normalize !== 'function') throw new DomainError('Adapter parse and normalize functions are required'); return Object.freeze({ id:required(adapterId,'adapter id'),version:required(version,'adapter version'),supportedModalities,parse,normalize }); }

export class DeviceHub {
  #devices = new Map(); #payloads = new Map(); #quarantine = new Map(); #events = [];
  register(record, context) { requireContext(context); if (!sameScope(record,context)) throw new DomainError('Forged device scope'); if ([...this.#devices.values()].some(d => d.organizationId===record.organizationId && d.siteId===record.siteId && d.serialNumber===record.serialNumber)) throw new DomainError('Duplicate device serial number in site'); this.#devices.set(record.id,structuredClone(record)); this.#event(context,'device.registered',record.id); return structuredClone(record); }
  getDevice(deviceId, context) { requireContext(context); const record=this.#devices.get(deviceId); if (!record || !sameScope(record,context)) throw new DomainError('Unknown or unauthorized device'); return structuredClone(record); }
  transitionDevice(deviceId,next,context) { const updated=transitionDevice(this.getDevice(deviceId,context),next,context); this.#devices.set(deviceId,updated); this.#event(context,'device.state-changed',deviceId); return structuredClone(updated); }
  ingest({ deviceId, messageId, checksum, contentType, receivedAt, payload, adapter: a, patientId, orderId, workItemId, context }) {
    requireContext(context); const record=this.getDevice(deviceId,context); if (record.status !== 'active') return this.#quarantinePayload({deviceId,messageId,checksum,contentType,receivedAt,reason:'workflow-rejected',context});
    const key=`${deviceId}:${required(messageId,'messageId')}`; if (this.#payloads.has(key)) return { disposition:'duplicate', payloadId:this.#payloads.get(key).id };
    let parsed; try { parsed=a.parse(payload); } catch { return this.#quarantinePayload({deviceId,messageId,checksum,contentType,receivedAt,reason:'malformed-payload',context}); }
    if (!a.supportedModalities.includes(record.modality)) return this.#quarantinePayload({deviceId,messageId,checksum,contentType,receivedAt,reason:'unsupported-version',context});
    if (!patientId || !orderId || !workItemId || parsed.patientId !== patientId || parsed.orderId !== orderId) return this.#quarantinePayload({deviceId,messageId,checksum,contentType,receivedAt,reason:'identity-mismatch',context});
    const raw=Object.freeze({ id:id(),deviceId,messageId,checksum:required(checksum,'checksum'),contentType:required(contentType,'contentType'),receivedAt:required(receivedAt,'receivedAt'),adapterId:a.id,adapterVersion:a.version });
    let normalized; try { normalized=a.normalize(parsed,{ patientId,orderId,workItemId,device:record, provenance:provenance({sourceType:'device-adapter',sourceId:messageId,recordedAt:receivedAt,transformations:[{adapterId:a.id,adapterVersion:a.version}]} )}); } catch { return this.#quarantinePayload({deviceId,messageId,checksum,contentType,receivedAt,reason:'mapping-failure',context}); }
    if (!normalized || normalized.patientId!==patientId || normalized.orderId!==orderId) return this.#quarantinePayload({deviceId,messageId,checksum,contentType,receivedAt,reason:'identity-mismatch',context});
    this.#payloads.set(key,{...raw,normalized,patientId,orderId,workItemId,organizationId:record.organizationId,siteId:record.siteId}); this.#event(context,'payload.accepted',raw.id); return { disposition:'accepted',payloadId:raw.id,raw,normalized };
  }
  listQuarantine(context) { requireContext(context); return [...this.#quarantine.values()].filter(x=>sameScope(x,context)).map(x=>structuredClone(x)); }
  replay(quarantineId, request, context) { requireContext(context); const item=this.#quarantine.get(quarantineId); if (!item || !sameScope(item,context)) throw new DomainError('Unknown or unauthorized quarantine item'); if (request.context?.actorId !== context.actorId) throw new DomainError('Replay requires caller context'); this.#event(context,'payload.replay-requested',quarantineId); return this.ingest({...request,context}); }
  retry(operation, maxAttempts = 3) { let last; for (let attempt=1;attempt<=maxAttempts;attempt++) try { return operation(attempt); } catch (error) { last=error; } throw last; }
  events(context) { requireContext(context); return this.#events.filter(x=>sameScope(x,context)).map(x=>structuredClone(x)); }
  #quarantinePayload({deviceId,messageId,checksum,contentType,receivedAt,reason,context}) { const device=this.getDevice(deviceId,context); const item=Object.freeze({id:id(),deviceId,messageId:messageId || null,checksum:checksum || null,contentType:contentType || null,receivedAt:receivedAt || new Date().toISOString(),reason,organizationId:device.organizationId,siteId:device.siteId}); this.#quarantine.set(item.id,item); this.#event(context,'payload.quarantined',item.id); return {disposition:'quarantined',quarantineId:item.id,reason}; }
  #event(context,action,resourceId) { this.#events.push(Object.freeze({id:id(),at:new Date().toISOString(),actorId:context.actorId,organizationId:context.organizationId,siteId:context.siteId,action,resourceId,correlationId:context.correlationId || null})); }
}
