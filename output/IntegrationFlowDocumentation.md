# Integration Flow Documentation

- **iFlow Name:** `Create Customer Return in Backend from SAP Complaint Handling.iflw`
- **Generated At:** 2026-01-15T17:33:15.870Z
---
## 🏢 Systems & Participants
- Sender
- Receiver
- DestinationService
- PostExitReceiver
- GetCount
- ExternalDocumentExit
- Integration to External Service
- Local Integration Process Post
- Integration Process

## 🛤️ Integration Process Flow

### 1. Start (StartEvent_2)
> **Location:** 🏢 Integration Process
* **Component:** `Start Event`
* **Communication:** 🔌 Uses **HTTPS** adapter
* **Behavior:** 🏁 Message processing starts.

---
### 2. Request Reply (ServiceTask_52)
> **Location:** 🏢 Integration Process
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **HTTP** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 3. Get Endpoint (CallActivity_56)
> **Location:** 🏢 Integration Process
* **Component:** `Groovy Script`
* **Behavior:** 📜 Executes custom Groovy logic.

<details><summary>⚙️ View Technical Configuration</summary>

- **Sub Activity Type:** `GroovyScript`
- **Script:** `get_endpoint.groovy`
</details>

---
### 4. Content Modifier 1 (CallActivity_91)
> **Location:** 🏢 Integration Process
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details><summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `constant`
- **Property Table:** `<row><cell id='Action'>Create</cell><cell id='Type'>constant</cell><cell id='Value'>{{use_external_document}}</cell><cell id='Default'></cell><cell id='Name'>use_external_document</cell><cell id='Datatype'></cell></row>`
</details>

---
### 5. Router 1 (ExclusiveGateway_87)
> **Location:** 🏢 Integration Process
* **Component:** `Router`
* **Behavior:** 🔀 Branches flow based on conditions.

| Route Name | Condition | Target |
| :--- | :--- | :--- |
| **Route 2** | `${property.use_external_document} = 'false' and ${header.useExternalDocument} = 'true'` | Content Modifier 3 |
| **Route 1** | *Default* | Request Reply 1 |
| **Route 3** | `${property.use_external_document} = 'true' and ${header.useExternalDocument} = 'true'` | Content Modifier 2 |

<details><summary>⚙️ View Technical Configuration</summary>

- **Throw Exception:** `false`
</details>

---
### 6. Content Modifier 3 (CallActivity_89)
> **Location:** 🏢 Integration Process
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details><summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `expression`
- **Wrap Content:** `{
	"A_BillingDocumentItem": {
		"A_BillingDocumentItemType": [
			{
			}
		]
	},
	"count": "0",
        "errorMessage": "MISSING_CPI_CONFIG_FOR_EXTERNAL_DOC"
}`
</details>

---
### 7. Router 1 (ExclusiveGateway_62)
> **Location:** 🏢 Integration Process
* **Component:** `Router`
* **Behavior:** 🔀 Branches flow based on conditions.

| Route Name | Condition | Target |
| :--- | :--- | :--- |
| **Route 2** | `${property.custom_extension_enabled} = 'true'` | Process Call 2 |
| **Route 1** | *Default* | End |

<details><summary>⚙️ View Technical Configuration</summary>

- **Throw Exception:** `false`
</details>

---
### 8. Process Call 2 (CallActivity_65)
> **Location:** 🏢 Integration Process
* **Component:** `Process Call`
* **Behavior:** 📞 Invokes a local integration process.

<details><summary>⚙️ View Technical Configuration</summary>

- **Process Id:** `Process_68`
- **Sub Activity Type:** `NonLoopingProcess`
</details>

---
### 9. End (EndEvent_2)
> **Location:** 🏢 Integration Process
* **Component:** `End Event`
* **Behavior:** 🛑 Message processing finishes.

---
### 10. Final Formatting (CallActivity_85)
> **Location:** 🏢 Integration Process
* **Component:** `Groovy Script`
* **Behavior:** 📜 Executes custom Groovy logic.

<details><summary>⚙️ View Technical Configuration</summary>

- **Sub Activity Type:** `GroovyScript`
- **Script:** `FinalFormatting.groovy`
</details>

---
### 11. Process Call 1 (CallActivity_95)
> **Location:** 🏢 Integration Process
* **Component:** `Process Call`
* **Behavior:** 📞 Invokes a local integration process.

<details><summary>⚙️ View Technical Configuration</summary>

- **Process Id:** `Process_99`
- **Sub Activity Type:** `NonLoopingProcess`
</details>

---
### 12. Content Modifier 2 (CallActivity_93)
> **Location:** 🏢 Integration Process
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details><summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `expression`
- **Wrap Content:** `{
"endpointUrl" :"${property.EndpointURL}",
"cloudConnectorLocationId" : "${property.CloudConnectorLocationId}",
"client":"${property.client}",
"constant":"${header.constant}",
"filter":"${property.filter}",
"language":"${header.language}"
}`
</details>

---
### 13. Content Modifier 5 (CallActivity_59)
> **Location:** 🏢 Integration Process
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details><summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `expression`
- **Property Table:** `<row><cell id='Action'>Create</cell><cell id='Type'>constant</cell><cell id='Value'>{{custom_extension_enabled}}</cell><cell id='Default'></cell><cell id='Name'>custom_extension_enabled</cell><cell id='Datatype'></cell></row>`
</details>

---
### 14. Content Modifier 4 (CallActivity_80)
> **Location:** 🏢 Integration Process
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details><summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `expression`
- **Property Table:** `<row><cell id='Action'>Create</cell><cell id='Type'>expression</cell><cell id='Value'>${in.body}</cell><cell id='Default'></cell><cell id='Name'>count</cell><cell id='Datatype'>java.lang.String</cell></row>`
</details>

---
### 15. XML to JSON Converter 1 (CallActivity_31)
> **Location:** 🏢 Integration Process
* **Component:** `XML to JSON Converter`
* **Behavior:** 🔄 Converts XML payload to JSON.

<details><summary>⚙️ View Technical Configuration</summary>

- **Xml Json Use Streaming:** `false`
- **Xml Json Suppress Root Element:** `false`
- **Xml Json Convert All Elements:** `specific`
- **Use Namespaces:** `true`
- **Json Namespace Separator:** `:`
</details>

---
### 16. Request Reply 1 (ServiceTask_77)
> **Location:** 🏢 Integration Process
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **HTTP** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 17. Request Reply 2 (ServiceTask_27)
> **Location:** 🏢 Integration Process
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **HCIOData** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 18. Exception Subprocess 1 (SubProcess_35)
> **Location:** 🏢 Integration Process
* **Component:** `Exception Subprocess`
* **Behavior:** ⚠️ Error handling: Catches and processes internal exceptions.

---
### 19. Start 3 (StartEvent_100)
> **Location:** 🏢 Integration to External Service
* **Component:** `Start Event`
* **Behavior:** 🏁 Message processing starts.

---
### 20. End 2 (EndEvent_101)
> **Location:** 🏢 Integration to External Service
* **Component:** `End Event`
* **Behavior:** 🛑 Message processing finishes.

---
### 21. Request Reply 4 (ServiceTask_103)
> **Location:** 🏢 Integration to External Service
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **ProcessDirect** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 22. Start 2 (StartEvent_69)
> **Location:** 🏢 Local Integration Process Post
* **Component:** `Start Event`
* **Behavior:** 🏁 Message processing starts.

---
### 23. End 1 (EndEvent_70)
> **Location:** 🏢 Local Integration Process Post
* **Component:** `End Event`
* **Behavior:** 🛑 Message processing finishes.

---
### 24. Request Reply 3 (ServiceTask_72)
> **Location:** 🏢 Local Integration Process Post
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **ProcessDirect** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---