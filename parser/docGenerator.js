// const fs = require("fs");
// const path = require("path");

// /**
//  * docGenerator.js
//  * Generates structured Markdown from the iFlow Documentation Model.
//  * @param {Object} docModel - The structured model containing metadata and steps.
//  * @param {Array} allFlows - The raw Sequence Flows (arrows) from the JSON.
//  * @param {Array} allActivities - The raw Activity elements for target name lookup.
//  * @param {Object} options - Configuration for output format and directory.
//  */
// function generateDocumentation(
//   docModel,
//   allFlows = [],
//   allActivities = [],
//   options = {}
// ) {
//   const { outputFormat = "markdown", outputDir = "./output" } = options;
//   const lines = [];

//   // Ensure inputs are arrays to prevent .filter or .find crashes
//   const safeFlows = Array.isArray(allFlows)
//     ? allFlows
//     : allFlows
//     ? [allFlows]
//     : [];
//   const safeActivities = Array.isArray(allActivities)
//     ? allActivities
//     : allActivities
//     ? [allActivities]
//     : [];

//   // 1. Header & Metadata
//   lines.push("# Integration Flow Documentation");
//   lines.push("");
//   lines.push(`- **iFlow Name:** \`${docModel.metadata.iflowName}\``);
//   lines.push(`- **Generated At:** ${docModel.metadata.generatedAt}`);
//   lines.push("");
//   lines.push("---");

//   // 2. Participants
//   lines.push("## 🏢 Systems & Participants");
//   if (docModel.participants && docModel.participants.length > 0) {
//     docModel.participants.forEach((p) => lines.push(`- ${p.name}`));
//   } else {
//     lines.push("_No external participants defined._");
//   }
//   lines.push("");

//   // 3. Integration Steps
//   lines.push("## 🛤️ Integration Process Flow");
//   lines.push(
//     "This section describes the step-by-step logic executed within the middleware.\n"
//   );

//   docModel.integrationSteps.forEach((step) => {
//     // UPDATED: Show Step Name and Technical ID for better traceability
//     const displayName =
//       step.name && step.name !== step.id
//         ? `${step.name} (${step.id})`
//         : step.id;

//     lines.push(`### ${step.order}. ${displayName}`);
//     lines.push(`* **Component:** \`${step.activityType}\``);

//     if (step.adapter) {
//       lines.push(`* **Communication:** 🔌 Uses **${step.adapter}** adapter`);
//     }

//     // Behavior/Semantics
//     if (step.semantic?.summary?.length) {
//       step.semantic.summary.forEach((s) => {
//         lines.push(`* **Behavior:** ${s}`);
//       });
//     }

//     // --- ROUTER CONDITION LOGIC ---
//     if (
//       step.activityType === "ExclusiveGateway" ||
//       (step.name && step.name.toLowerCase().includes("router"))
//     ) {
//       const outgoingRoutes = safeFlows.filter(
//         (f) => f && f.sourceRef === step.id
//       );

//       if (outgoingRoutes.length > 0) {
//         lines.push("");
//         lines.push("| Route Name | Condition (Logic) | Target Step |");
//         lines.push("| :--- | :--- | :--- |");

//         outgoingRoutes.forEach((route) => {
//           const condition = route["bpmn2:conditionExpression"]
//             ? `\`${route["bpmn2:conditionExpression"]["_"]}\``
//             : "***Default Route***";

//           const target = safeActivities.find((a) => a.id === route.targetRef);
//           const targetName = target ? target.name || target.id : "End Flow";

//           lines.push(
//             `| **${route.name || "Route"}** | ${condition} | ${targetName} |`
//           );
//         });
//         lines.push("");
//       }
//     }

//     // 4. Technical Configuration
//     if (step.config && Object.keys(step.config).length > 0) {
//       lines.push("");
//       lines.push("<details>");
//       lines.push("<summary>⚙️ View Technical Configuration</summary>");
//       lines.push("");

//       Object.entries(step.config).forEach(([key, value]) => {
//         if (key === "headersDefined" || key === "propertiesDefined") return;

//         const label = key
//           .replace(/([A-Z])/g, " $1")
//           .replace(/^./, (str) => str.toUpperCase());

//         lines.push(`- **${label}:** \`${value}\``);
//       });

//       if (step.config.headersDefined && step.config.headersDefined.length > 0) {
//         lines.push("\n**Headers Defined:**");
//         step.config.headersDefined.forEach((h) => lines.push(`- ${h}`));
//       }

//       if (
//         step.config.propertiesDefined &&
//         step.config.propertiesDefined.length > 0
//       ) {
//         lines.push("\n**Properties Defined:**");
//         step.config.propertiesDefined.forEach((p) => lines.push(`- ${p}`));
//       }

//       lines.push("");
//       lines.push("</details>");
//     }

//     lines.push("\n---");
//   });

//   // Final Output Generation
//   const outputText = lines.join("\n");

//   if (outputFormat === "markdown") {
//     if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
//     const filePath = path.join(outputDir, "IntegrationFlowDocumentation.md");
//     fs.writeFileSync(filePath, outputText, "utf8");
//     console.log(`✅ Documentation successfully generated at: ${filePath}`);
//   }

//   return outputText;
// }

// module.exports = { generateDocumentation };

const fs = require("fs");
const path = require("path");

function generateDocumentation(
  docModel,
  allFlows = [],
  allActivities = [],
  options = {}
) {
  const { outputDir = "./output" } = options;
  const lines = [];
  const safeFlows = Array.isArray(allFlows)
    ? allFlows
    : allFlows
    ? [allFlows]
    : [];
  const safeActivities = Array.isArray(allActivities)
    ? allActivities
    : allActivities
    ? [allActivities]
    : [];

  lines.push("# Integration Flow Documentation\n");
  lines.push(`- **iFlow Name:** \`${docModel.metadata.iflowName}\``);
  lines.push(`- **Generated At:** ${docModel.metadata.generatedAt}\n---`);

  lines.push("## 🏢 Systems & Participants");
  docModel.participants.forEach((p) => lines.push(`- ${p.name}`));
  lines.push("\n## 🛤️ Integration Process Flow\n");

  docModel.integrationSteps.forEach((step) => {
    const displayName =
      step.name && step.name !== step.id
        ? `${step.name} (${step.id})`
        : step.id;

    lines.push(`### ${step.order}. ${displayName}`);
    // --- NEW LINE ADDED HERE ---
    lines.push(`> **Location:** 🏢 ${step.parentProcess}`);

    lines.push(`* **Component:** \`${step.activityType}\``);

    if (step.adapter)
      lines.push(`* **Communication:** 🔌 Uses **${step.adapter}** adapter`);

    if (step.semantic?.summary?.length) {
      step.semantic.summary.forEach((s) => lines.push(`* **Behavior:** ${s}`));
    }

    // Router Logic
    if (
      step.activityType === "ExclusiveGateway" ||
      (step.name && step.name.toLowerCase().includes("router"))
    ) {
      const routes = safeFlows.filter((f) => f && f.sourceRef === step.id);
      if (routes.length > 0) {
        lines.push("\n| Route Name | Condition | Target |");
        lines.push("| :--- | :--- | :--- |");
        routes.forEach((r) => {
          const cond = r["bpmn2:conditionExpression"]
            ? `\`${r["bpmn2:conditionExpression"]["_"]}\``
            : "*Default*";
          const target = safeActivities.find((a) => a.id === r.targetRef);
          lines.push(
            `| **${r.name || "Route"}** | ${cond} | ${
              target ? target.name || target.id : "End"
            } |`
          );
        });
      }
    }

    // Config Details
    if (step.config && Object.keys(step.config).length > 0) {
      lines.push(
        "\n<details><summary>⚙️ View Technical Configuration</summary>\n"
      );
      Object.entries(step.config).forEach(([key, value]) => {
        if (key === "headersDefined" || key === "propertiesDefined") return;
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        lines.push(`- **${label}:** \`${value}\``);
      });
      lines.push("</details>");
    }
    lines.push("\n---");
  });

  const outputText = lines.join("\n");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, "IntegrationFlowDocumentation.md"),
    outputText,
    "utf8"
  );
  return outputText;
}

module.exports = { generateDocumentation };
