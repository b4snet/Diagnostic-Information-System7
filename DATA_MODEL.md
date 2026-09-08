# Canonical diagnostic model

The model separates patient/context, order, reusable diagnostic service, work item, acquisition, diagnostic data, observation, interpretation, report, verification, amendment, provenance, and object reference. No universal diagnostic-record object exists.

```text
Patient/context → Order → Service + Work item → Acquisition → Observation(s) → Interpretation → Report → Verification
                                                    └→ Media/raw-object reference
```

`src/canonical.js` implements controlled coding and unit value objects; typed diagnostic values; modality-neutral services, work items, acquisitions, observations, studies, interpretations, media-object metadata, verification, and provenance; lifecycle guards; and clinical-context checks. Every patient-scoped canonical resource carries organization, site, patient, and order references.

Observations preserve code, typed value, unit, status, effective/issued time, device, performer, acquisition, encounter, specimen reference, component parent, interpretation, reference-range metadata, and provenance. No clinical terminology, unit normalization, reference range, or clinical threshold is provided.

Raw payloads are represented only by protected-object metadata: media type, size, checksum, storage class, version, access policy, and provenance. Payload bytes and direct storage URLs are outside the domain model.
