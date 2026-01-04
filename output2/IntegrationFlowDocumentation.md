# Integration Flow Documentation

**iFlow Name:** Create Customer Return in Backend from SAP Complaint Handling.iflw
**Generated At:** 2026-01-04T17:44:55.405Z

## Participants
- **Sender**
- **Receiver**
- **DestinationService**
- **PostExitReceiver**
- **GetCount**
- **ExternalDocumentExit**
- **Integration to External Service**
- **Local Integration Process Post**
- **Integration Process**

## Message Flows
- **ServiceTask_103 → ExternalDocumentExit** (Adapter: ProcessDirect)
- **ServiceTask_77 → GetCount** (Adapter: HTTP)
- **ServiceTask_52 → DestinationService** (Adapter: HTTP)
- **ServiceTask_72 → PostExitReceiver** (Adapter: ProcessDirect)
- **ServiceTask_27 → Receiver** (Adapter: HCIOData)
- **Sender → StartEvent_2** (Adapter: HTTPS)

## Integration Steps