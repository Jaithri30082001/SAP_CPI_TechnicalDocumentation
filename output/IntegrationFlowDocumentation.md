# Integration Flow Documentation

- **iFlow Name:** `Create Customer Return in Backend from SAP Complaint Handling.iflw`
- **Generated At:** 2026-01-17T13:36:24.441Z
---
## 🏢 Systems & Participants
- Sender
- Receiver
- DestinationService
- PREEXITReceiver
- POSTEXITReceiver
- ReceiverGet
- Local Integration Process POSTEXIT
- Integration Process
- Local Integration Process PREEXIT


## 🛤️ Integration Process

### 1. Start (StartEvent_2)
> **Location:** 🏢 Integration Process
* **Component:** `Start Event`
* **Communication:** 🔌 Uses **HTTPS** adapter
* **Behavior:** 🏁 Message processing starts.

---
### 2. Store Input Payload (CallActivity_38123)
> **Location:** 🏢 Integration Process
* **Component:** `Groovy Script`
* **Behavior:** 📜 Executes custom Groovy logic.

<details><summary>⚙️ View Technical Configuration</summary>

- **Sub Activity Type:** `GroovyScript`
- **Script:** `InputJSONString.groovy`
</details>

---
### 3. Request Reply (ServiceTask_59)
> **Location:** 🏢 Integration Process
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **HTTP** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 4. Get Endpoint (CallActivity_65)
> **Location:** 🏢 Integration Process
* **Component:** `Groovy Script`
* **Behavior:** 📜 Executes custom Groovy logic.

<details><summary>⚙️ View Technical Configuration</summary>

- **Sub Activity Type:** `GroovyScript`
- **Script:** `get_endpoint.groovy`
</details>

---
### 5. Format Input Json String (CallActivity_38125)
> **Location:** 🏢 Integration Process
* **Component:** `Groovy Script`
* **Behavior:** 📜 Executes custom Groovy logic.

<details><summary>⚙️ View Technical Configuration</summary>

- **Sub Activity Type:** `GroovyScript`
- **Script:** `FormatInputJSONString.groovy`
</details>

---
### 6. JSON to XML Converter (CallActivity_38127)
> **Location:** 🏢 Integration Process
* **Component:** `JSON to XML Converter`
* **Behavior:** 🔄 Converts JSON payload to XML.

<details><summary>⚙️ View Technical Configuration</summary>

- **Additional Root Element Name:** `root`
- **Use Namespaces:** `true`
- **Add X M L Root Element:** `true`
- **Json Namespace Separator:** `:`
</details>

---
### 7. Mapping Input payload (CallActivity_38156)
> **Location:** 🏢 Integration Process
* **Component:** `General Step`
* **Behavior:** Standard integration process step.

<details><summary>⚙️ View Technical Configuration</summary>

- **Mappinguri:** `dir://mmap/src/main/resources/mapping/MappingInputPayload.mmap`
- **Mappingname:** `MappingInputPayload`
- **Mapping Type:** `MessageMapping`
- **Mapping Reference:** `static`
- **Mappingpath:** `src/main/resources/mapping/MappingInputPayload`
</details>

---
### 8. Mapping S4 Payload (CallActivity_21)
> **Location:** 🏢 Integration Process
* **Component:** `General Step`
* **Behavior:** Standard integration process step.

<details><summary>⚙️ View Technical Configuration</summary>

- **Mappinguri:** `dir://mmap/src/main/resources/mapping/MM_Create_CustomerReturn.mmap`
- **Mappingname:** `MM_Create_CustomerReturn`
- **Mapping Type:** `MessageMapping`
- **Mappingpath:** `src/main/resources/mapping/MM_Create_CustomerReturn`
</details>

---
### 9. Content Modifier 1 (CallActivity_38161)
> **Location:** 🏢 Integration Process
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details><summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `expression`
- **Property Table:** `<row><cell id='Action'>Create</cell><cell id='Type'>constant</cell><cell id='Value'>{{custom_pre_extension_enabled}}</cell><cell id='Default'></cell><cell id='Name'>custom_pre_extension_enabled</cell><cell id='Datatype'></cell></row>`
</details>

---
### 10. Router 1 (ExclusiveGateway_38165)
> **Location:** 🏢 Integration Process
* **Component:** `Router`
* **Behavior:** 🔀 Branches flow based on conditions.

| Route Name | Condition | Target |
| :--- | :--- | :--- |
| **Route 2** | *Default* | Request Reply |
| **Route 1** | `${property.custom_pre_extension_enabled} = 'true'` | Process Call 1 |



<details><summary>⚙️ View Technical Configuration</summary>

- **Throw Exception:** `false`
</details>

---
### 11. Process Call 1 (CallActivity_38164)
> **Location:** 🏢 Integration Process
* **Component:** `Process Call`
* **Behavior:** 📞 Invokes a local integration process.

<details><summary>⚙️ View Technical Configuration</summary>

- **Process Id:** `Process_38169`
- **Sub Activity Type:** `NonLoopingProcess`
</details>

---
### 12. Request Reply (ServiceTask_27)
> **Location:** 🏢 Integration Process
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **HCIOData** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 13. Convert to JSON Response (CallActivity_31)
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
### 14. Parse JSON Response (CallActivity_52)
> **Location:** 🏢 Integration Process
* **Component:** `Groovy Script`
* **Behavior:** 📜 Executes custom Groovy logic.

<details><summary>⚙️ View Technical Configuration</summary>

- **Sub Activity Type:** `GroovyScript`
- **Script:** `Modify_Response.groovy`
</details>

---
### 15. Request Reply Get (ServiceTask_38195)
> **Location:** 🏢 Integration Process
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **HCIOData** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 16. Convert to JSON Response - Copy (CallActivity_38198)
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
### 17. Parse JSON Response - Copy (CallActivity_38199)
> **Location:** 🏢 Integration Process
* **Component:** `Groovy Script`
* **Behavior:** 📜 Executes custom Groovy logic.

<details><summary>⚙️ View Technical Configuration</summary>

- **Sub Activity Type:** `GroovyScript`
- **Script:** `modify_itemResponse.groovy`
</details>

---
### 18. Content Modifier Response (CallActivity_54)
> **Location:** 🏢 Integration Process
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details><summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `expression`
- **Property Table:** `<row><cell id='Action'>Create</cell><cell id='Type'>constant</cell><cell id='Value'>{{custom_post_extension_enabled}}</cell><cell id='Default'></cell><cell id='Name'>custom_post_extension_enabled</cell><cell id='Datatype'></cell></row>`
- **Wrap Content:** `{
"result":  "${header.result}",
"customerReturnItemResult": ${header.customerReturnItemResult},
"errorMessage":  "${header.errorMessage}",
"statusCode" :  ""
}`
</details>

---
### 19. Router 2 (ExclusiveGateway_38190)
> **Location:** 🏢 Integration Process
* **Component:** `Router`
* **Behavior:** 🔀 Branches flow based on conditions.

| Route Name | Condition | Target |
| :--- | :--- | :--- |
| **Route 2** | `${property.custom_post_extension_enabled} = 'true'` | Process Call 2 |
| **Route 1** | *Default* | End |



<details><summary>⚙️ View Technical Configuration</summary>

- **Throw Exception:** `false`
</details>

---
### 20. Process Call 2 (CallActivity_38192)
> **Location:** 🏢 Integration Process
* **Component:** `Process Call`
* **Behavior:** 📞 Invokes a local integration process.

<details><summary>⚙️ View Technical Configuration</summary>

- **Process Id:** `Process_38173`
- **Sub Activity Type:** `NonLoopingProcess`
</details>

---
### 21. End (EndEvent_2)
> **Location:** 🏢 Integration Process
* **Component:** `End Event`
* **Behavior:** 🛑 Message processing finishes.

---
### 22. Exception Subprocess 1 (SubProcess_35)
> **Location:** 🏢 Integration Process
* **Component:** `Exception Subprocess`
* **Behavior:** ⚠️ Error handling: Catches and processes internal exceptions.

---
## 🛤️ Local Integration Process POSTEXIT

### 1. Start 2 (StartEvent_38174)
> **Location:** 🏢 Local Integration Process POSTEXIT
* **Component:** `Start Event`
* **Behavior:** 🏁 Message processing starts.

---
### 2. Content Modifier 2 (CallActivity_38183)
> **Location:** 🏢 Local Integration Process POSTEXIT
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details><summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `expression`
- **Wrap Content:** `${in.body}
${property.original_payload}`
</details>

---
### 3. Request Reply 2 (ServiceTask_38180)
> **Location:** 🏢 Local Integration Process POSTEXIT
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **ProcessDirect** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 4. End 2 (EndEvent_38175)
> **Location:** 🏢 Local Integration Process POSTEXIT
* **Component:** `End Event`
* **Behavior:** 🛑 Message processing finishes.

---
## 🛤️ Integration Process (Nested: Exception Subprocess 1)

### 1. Error Start (StartEvent_36)
> **Location:** 🏢 Integration Process (Nested: Exception Subprocess 1)
* **Component:** `Start Event`
* **Behavior:** 🏁 Message processing starts.

---
### 2. Parse Error Message (CallActivity_47)
> **Location:** 🏢 Integration Process (Nested: Exception Subprocess 1)
* **Component:** `Groovy Script`
* **Behavior:** 📜 Executes custom Groovy logic.

<details><summary>⚙️ View Technical Configuration</summary>

- **Sub Activity Type:** `GroovyScript`
- **Script:** `Check_ErrorMessage_Response.groovy`
</details>

---
### 3. Content Modifier Error (CallActivity_39)
> **Location:** 🏢 Integration Process (Nested: Exception Subprocess 1)
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details><summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `expression`
- **Wrap Content:** `{
"result": "",
"errorMessage":  "${header.errorMessage}",
"statusCode" :" "
}`
</details>

---
### 4. Error End (EndEvent_43)
> **Location:** 🏢 Integration Process (Nested: Exception Subprocess 1)
* **Component:** `End Event`
* **Behavior:** 🛑 Message processing finishes.

---
## 🛤️ Local Integration Process PREEXIT

### 1. Start 1 (StartEvent_38170)
> **Location:** 🏢 Local Integration Process PREEXIT
* **Component:** `Start Event`
* **Behavior:** 🏁 Message processing starts.

---
### 2. Content Modifier 3 (CallActivity_38209)
> **Location:** 🏢 Local Integration Process PREEXIT
* **Component:** `Content Modifier`
* **Behavior:** 📝 Modifies headers, properties, or body.

<details><summary>⚙️ View Technical Configuration</summary>

- **Body Type:** `expression`
- **Wrap Content:** `${property.original_payload}`
</details>

---
### 3. Request Reply 1 (ServiceTask_38177)
> **Location:** 🏢 Local Integration Process PREEXIT
* **Component:** `Request Reply`
* **Communication:** 🔌 Uses **ProcessDirect** adapter
* **Behavior:** 🔌 Synchronous call to an external service.

---
### 4. End 1 (EndEvent_38171)
> **Location:** 🏢 Local Integration Process PREEXIT
* **Component:** `End Event`
* **Behavior:** 🛑 Message processing finishes.

---