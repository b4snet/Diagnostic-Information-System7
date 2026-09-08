# PFT / Spirometry Module

Step 6 implements a tenant-scoped PFT curve metadata boundary for synthetic flow-volume and volume-time curves. Curves preserve session, acquisition, device, protected object reference, checksum, format/version, sampling interval, axis names/units, and provenance. Curve samples remain outside transactional records.

Measurements require an explicit source type, value, code, unit, time, and provenance. Predicted/reference values, reference equations, quality/acceptability rules, bronchodilator criteria, clinical interpretation, real device connectivity, database/RLS, API, and UI are **not implemented**.

**REAL PFT DEVICES CONNECTED:** none. **NO REAL PFT DEVICE CONNECTIONS:** all hardware integrations remain unvalidated.
