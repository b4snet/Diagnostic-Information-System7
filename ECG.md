# ECG Diagnostic Module

Step 5 adds a vendor-neutral ECG waveform metadata boundary. `src/ecg.js` accepts only authorized tenant-scoped metadata: acquisition, device, source ID, protected object reference, checksum, format/version, sampling frequency, and lead metadata. It intentionally does not retain waveform samples in transactional records or expose storage URLs.

Measurements require explicit numeric value, code, unit, source type (`device`, `algorithm`, or `human`), and provenance. No ECG thresholds, clinical interpretation, device protocol, real waveform format, real device, DICOM/SCP-ECG/HL7/FHIR mapping, or clinical validation is implemented.

**REAL ECG DEVICES CONNECTED:** none. **NO REAL ECG DEVICE CONNECTIONS:** all hardware integrations remain unvalidated.
