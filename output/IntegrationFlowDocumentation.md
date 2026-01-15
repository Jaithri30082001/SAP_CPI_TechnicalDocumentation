# Integration Flow Documentation

- **iFlow Name:** `Create Customer Return in Backend from SAP Complaint Handling.iflw`
- **Generated At:** 2026-01-15T14:01:32.299Z

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
This section describes the step-by-step logic executed within the middleware.

### 1. Start 3
* **Component:** `Start Event`
* **Behavior:** 🏁 Message processing starts.

---
### 2. End 2
* **Component:** `End Event`
* **Behavior:** 🛑 Message processing finishes.

---
### 3. Request Reply 4
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **ProcessDirect** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 4. Start 2
* **Component:** `Start Event`
* **Behavior:** 🏁 Message processing starts.

---
### 5. End 1
* **Component:** `End Event`
* **Behavior:** 🛑 Message processing finishes.

---
### 6. Request Reply 3
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **ProcessDirect** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 7. Start
* **Component:** `Start Event`
* **Communication:** 🔌 Uses **HTTPS** adapter
* **Behavior:** 🏁 Message processing starts.

---
### 8. End
* **Component:** `End Event`
* **Behavior:** 🛑 Message processing finishes.

---
### 9. Get Endpoint
* **Component:** `Groovy Script`
* **Behavior:** 📜 Executes custom Groovy logic.

<details>
<summary>⚙️ View Technical Configuration</summary>

- **Sub Activity Type:** `GroovyScript`
- **Script:** `get_endpoint.groovy`

</details>

---
### 10. Final Formatting
* **Component:** `Groovy Script`
* **Behavior:** 📜 Executes custom Groovy logic.

<details>
<summary>⚙️ View Technical Configuration</summary>

- **Sub Activity Type:** `GroovyScript`
- **Script:** `FinalFormatting.groovy`

</details>

---
### 11. Process Call 1
* **Component:** `Process Call`
* **Behavior:** 📞 Invokes a local integration process.

<details>
<summary>⚙️ View Technical Configuration</summary>

- **Process Id:** `Process_99`
- **Sub Activity Type:** `NonLoopingProcess`

</details>

---
### 12. Process Call 2
* **Component:** `Process Call`
* **Behavior:** 📞 Invokes a local integration process.

<details>
<summary>⚙️ View Technical Configuration</summary>

- **Process Id:** `Process_68`
- **Sub Activity Type:** `NonLoopingProcess`

</details>

---
### 13. Content Modifier 1
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details>
<summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `constant`
- **Property Table:** `<row><cell id='Action'>Create</cell><cell id='Type'>constant</cell><cell id='Value'>{{use_external_document}}</cell><cell id='Default'></cell><cell id='Name'>use_external_document</cell><cell id='Datatype'></cell></row>`

**Properties Defined:**
- use_external_document (constant): {{use_external_document}}

</details>

---
### 14. Content Modifier 2
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details>
<summary>⚙️ View Technical Configuration</summary>

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
### 15. Content Modifier 5
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details>
<summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `expression`
- **Property Table:** `<row><cell id='Action'>Create</cell><cell id='Type'>constant</cell><cell id='Value'>{{custom_extension_enabled}}</cell><cell id='Default'></cell><cell id='Name'>custom_extension_enabled</cell><cell id='Datatype'></cell></row>`

**Properties Defined:**
- custom_extension_enabled (constant): {{custom_extension_enabled}}

</details>

---
### 16. Content Modifier 4
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details>
<summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `expression`
- **Property Table:** `<row><cell id='Action'>Create</cell><cell id='Type'>expression</cell><cell id='Value'>${in.body}</cell><cell id='Default'></cell><cell id='Name'>count</cell><cell id='Datatype'>java.lang.String</cell></row>`

**Properties Defined:**
- count (expression): ${in.body}

</details>

---
### 17. Content Modifier 3
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details>
<summary>⚙️ View Technical Configuration</summary>

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
### 18. XML to JSON Converter 1
* **Component:** `XML to JSON Converter`
* **Behavior:** 🔄 Converts XML payload to JSON.

<details>
<summary>⚙️ View Technical Configuration</summary>

- **Xml Json Use Streaming:** `false`
- **Xml Json Suppress Root Element:** `false`
- **Xml Json Convert All Elements:** `specific`
- **Use Namespaces:** `true`
- **Json Namespace Separator:** `:`

</details>

---
### 19. Request Reply 1
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **HTTP** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 20. Request Reply 2
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **HCIOData** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 21. Request Reply
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **HTTP** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 22. Router 1
* **Component:** `Router`
* **Behavior:** 🔀 Branches flow based on conditions.

<details>
<summary>⚙️ View Technical Configuration</summary>

- **Throw Exception:** `false`

</details>

---
### 23. Router 1
* **Component:** `Router`
* **Behavior:** 🔀 Branches flow based on conditions.

<details>
<summary>⚙️ View Technical Configuration</summary>

- **Throw Exception:** `false`

</details>

---
### 24. Exception Subprocess 1
* **Component:** `Exception Subprocess`
* **Behavior:** ⚠️ Error handling: Catches and processes internal exceptions.

---