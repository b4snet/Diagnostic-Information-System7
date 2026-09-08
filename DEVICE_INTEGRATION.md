# Device Integration Hub

`src/device-hub.js` implements a pure local device-hub foundation. It registers a device with organization/site ownership, manufacturer/model/serial/modality, generic capabilities, integration method, lifecycle state, identifiers, versions, and provenance. Serial uniqueness is enforced per site; caller actor, organization, and site scope are required for device operations.

The implemented local flow is:

```text
Synthetic device → adapter parse → identity check → adapter normalization → raw metadata + provenance → accepted canonical boundary
                                      └→ quarantine on malformed/ambiguous/rejected input
```

Adapters expose only `parse` and `normalize` behind a versioned, modality-declared boundary. There is no TCP, serial, HTTP, MLLP, HL7, DICOM, DICOMweb, vendor SDK, or hardware transport implementation. Raw payload bytes are not retained by this local proof; accepted records preserve content type, checksum, message ID, receive time, adapter ID/version, and normalized data separately.

Duplicate device/message IDs are idempotently ignored. Malformed, unsupported, inactive-device, or patient/order-mismatched messages are quarantined with metadata and a reason. Replay is scoped to the same organization/site and caller context. The synchronous retry utility is bounded; it is not a durable queue.

## Real device status

**REAL DEVICES CONNECTED:** none.

**SIMULATED DEVICES:** synthetic ECG adapter fixture only. Step 2 canonical fixtures model PFT, X-ray, CT, MRI, laboratory, and pathology but do not connect device adapters.

**NO REAL DEVICE CONNECTIONS:** ECG, PFT, imaging modalities, analyzers, PACS, LIS, EMR/HIS, FHIR/HL7 endpoints, and DICOM infrastructure.
