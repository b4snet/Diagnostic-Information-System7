# Interoperability boundaries

FHIR mapping boundary: Patient, Organization, Location, ServiceRequest, Task, Observation, DiagnosticReport, ImagingStudy, Device, Provenance, and DocumentReference are intended mapping targets. Mappings are not implemented or validated.

HL7 v2 gateway boundary: transport, parsing, validation, canonical transformation, business processing, ACK, correlation, retry/replay, and dead-letter handling must remain separate.

DICOM boundary: preserve Study/Series/SOP Instance UID and metadata separately from internal IDs; C-FIND, C-MOVE, C-STORE, QIDO-RS, WADO-RS, and STOW-RS are not implemented. IHE profile selection and all conformance testing require later external validation.
