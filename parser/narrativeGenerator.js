// /**
//  * narrativeGenerator.js
//  * Generates a textbook-style prose narrative by traversing the JSON model.
//  */
// function generateProse(docModel) {
//   let narrative = `# 📘 Executive Process Narrative\n\n`;

//   // 1. High-Level Intro
//   const participantList = docModel.participants.map((p) => p.name).join(", ");
//   narrative += `The integration scenario, **${docModel.metadata.iflowName}**, facilitates an automated data lifecycle between **${participantList}**. `;
//   narrative += `The process is partitioned into ${docModel.sections.length} distinct logic segments to ensure modular execution.\n\n`;

//   docModel.sections.forEach((section) => {
//     narrative += `## 🛤️ Section: ${section.processName}\n`;

//     // Transitions to link the JSON-ordered steps
//     const flowTransitions = [
//       "Initially, ",
//       "Subsequently, ",
//       "Following this, ",
//       "The process then moves to a stage where ",
//       "At this point, ",
//       "Once completed, ",
//       "Next, ",
//       "Moving forward, ",
//     ];

//     let proseParts = section.steps.map((step, index) => {
//       const config = step.config || {};
//       const name = step.name || step.id;

//       // Fallback to the behavior you defined in your registry
//       let baseBehavior =
//         step.semantic?.summary?.[0] || "performs a standard processing step.";
//       let stepNarrative = "";

//       // --- COMPREHENSIVE CATEGORY MAPPING ---

//       // 1. Transformation & Converters (JSON, XML, CSV, EDI)
//       if (step.activityType.includes("Converter")) {
//         stepNarrative = `the system performs a **${
//           step.activityType
//         }** to bridge format differences; ${baseBehavior.toLowerCase()}`;
//       }
//       // 2. Scripts (Groovy/JS)
//       else if (step.activityType.includes("Script")) {
//         stepNarrative = `custom technical logic is applied via the script \`${
//           config.Script || "logic"
//         }\` to handle specialized requirements`;
//       }
//       // 3. Routing & Multicasting
//       else if (
//         [
//           "Router",
//           "ExclusiveGateway",
//           "Parallel Multicast",
//           "Sequential Multicast",
//         ].includes(step.activityType)
//       ) {
//         stepNarrative = `the flow reaches a decision or branching point where ${baseBehavior.toLowerCase()}`;
//       }
//       // 4. Calls & Interactions (Request-Reply, Enricher, Send)
//       else if (
//         ["Request Reply", "Content Enricher", "Send", "Poll Enrich"].includes(
//           step.activityType
//         )
//       ) {
//         stepNarrative = `a synchronous interaction occurs with an external system via the **${
//           step.adapter || "configured"
//         }** adapter`;
//       }
//       // 5. Splitters & Aggregators
//       else if (
//         step.activityType.includes("Splitter") ||
//         step.activityType === "Aggregator" ||
//         step.activityType === "Gather"
//       ) {
//         stepNarrative = `the message payload is managed through a **${
//           step.activityType
//         }** operation; ${baseBehavior.toLowerCase()}`;
//       }
//       // 6. Security (Encoder, Decoder, Signer, PGP)
//       else if (
//         [
//           "Encoder",
//           "Decoder",
//           "Encryptor",
//           "Decryptor",
//           "Signer",
//           "Verifier",
//         ].some((key) => step.activityType.includes(key))
//       ) {
//         stepNarrative = `security protocols are enforced through a **${step.activityType}** to ensure data integrity`;
//       }
//       // 7. Persistence (Data Store, Variables)
//       else if (
//         ["Data Store Operation", "Write Variables", "Persist"].includes(
//           step.activityType
//         )
//       ) {
//         stepNarrative = `the system performs a persistence operation to store or retrieve data; ${baseBehavior.toLowerCase()}`;
//       }
//       // 8. Mappings (Message/XSLT)
//       else if (
//         step.activityType.includes("Mapping") ||
//         step.activityType.includes("XSLT")
//       ) {
//         stepNarrative = `data structures are aligned via the **${
//           config.Mappingname || "Mapping"
//         }** step to ensure technical compatibility`;
//       }
//       // 9. Process Calls
//       else if (step.activityType === "Process Call") {
//         stepNarrative = `control is delegated to the local sub-process "**${name}**" to execute modular logic`;
//       }
//       // 10. Default Fallback using your Semantic Registry
//       else {
//         stepNarrative = `the system performs a **${step.activityType}**; ${
//           baseBehavior.charAt(0).toLowerCase() + baseBehavior.slice(1)
//         }`;
//       }

//       // Add the transition word based on the order index
//       if (index === 0)
//         return stepNarrative.charAt(0).toUpperCase() + stepNarrative.slice(1);

//       const transition = flowTransitions[index % flowTransitions.length];
//       return transition + stepNarrative;
//     });

//     narrative +=
//       proseParts.join(". ") +
//       ". Finally, the sequence for this section concludes.\n\n";
//   });

//   return narrative;
// }

// module.exports = { generateProse };

// ///////////////////////////////////////////////

// /**
//  * narrativeGenerator.js
//  */
// function generateProse(docModel) {
//   let narrative = `# 📘 Executive Process Narrative\n\n`;

//   const participantList = docModel.participants.map((p) => p.name).join(", ");
//   narrative += `The integration scenario, **${docModel.metadata.iflowName}**, facilitates an automated data lifecycle between **${participantList}**.\n\n`;

//   docModel.sections.forEach((section) => {
//     narrative += `## 🛤️ Section: ${section.processName}\n`;

//     // Updated transitions (removed 'Initially' from loop to prevent repetition)
//     const flowTransitions = [
//       "Subsequently, ",
//       "Following this, ",
//       "The process then moves to a stage where ",
//       "At this point, ",
//       "Once completed, ",
//       "Next, ",
//       "Moving forward, ",
//       "Furthermore, ",
//     ];

//     let proseParts = section.steps.map((step, index) => {
//       const config = step.config || {};
//       // Ensure we trim existing periods from the registry behavior to prevent ".."
//       let baseBehavior = (step.semantic?.summary?.[0] || "").replace(/\.$/, "");
//       let stepNarrative = "";

//       // Transformation/Mappings (Now properly identified)
//       if (
//         step.activityType.includes("Mapping") ||
//         step.activityType.includes("Converter")
//       ) {
//         const mapName =
//           config.mappingname || config.Mappingname || "standard mapping";
//         stepNarrative = `the system performs a **${
//           step.activityType
//         }** using \`${mapName}\`; ${baseBehavior.toLowerCase()}`;
//       }
//       // Scripts (Fixing case sensitivity for config.script)
//       else if (step.activityType.includes("Script")) {
//         const scriptFile = config.script || config.Script || "custom logic";
//         stepNarrative = `technical logic is applied via the script \`${scriptFile}\`; ${baseBehavior.toLowerCase()}`;
//       }
//       // Content Modifiers
//       else if (step.activityType === "Content Modifier") {
//         stepNarrative = `the message environment is prepared; ${baseBehavior.toLowerCase()}`;
//       }
//       // General Fallback
//       else {
//         stepNarrative = `the system performs a **${step.activityType}**; ${
//           baseBehavior.charAt(0).toLowerCase() + baseBehavior.slice(1)
//         }`;
//       }

//       // First step logic
//       if (index === 0) return "Initially, " + stepNarrative;

//       const transition = flowTransitions[(index - 1) % flowTransitions.length];
//       return transition + stepNarrative;
//     });

//     narrative +=
//       proseParts.join(". ") +
//       ". Finally, the sequence reaches its conclusion.\n\n";
//   });

//   return narrative;
// }

// module.exports = { generateProse };
