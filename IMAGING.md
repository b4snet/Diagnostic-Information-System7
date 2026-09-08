# Imaging / Radiology Module

Step 7 implements a tenant-scoped workflow metadata boundary for synthetic X-ray (`XR`), CT (`CT`), and MRI (`MR`) studies. It preserves accession, caller-supplied Study UID, Series UID, SOP Instance UID, modality/device, patient/order/work references, provenance, checksums, and protected object references. Internal IDs remain separate from DICOM identifiers; retransmitted study/instance metadata is idempotent.

No DICOM parsing, networking, DICOMweb, PACS, VNA, image archive, viewer, real modality, clinical interpretation, database/RLS, API, or UI is implemented.

**REAL IMAGING DEVICES CONNECTED:** none. **NO REAL IMAGING HARDWARE CONNECTED:** all hardware remains unvalidated.
