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
    : [allFlows].filter(Boolean);
  const safeActivities = Array.isArray(allActivities)
    ? allActivities
    : [allActivities].filter(Boolean);

  lines.push("# Integration Flow Documentation\n");
  lines.push(`- **iFlow Name:** \`${docModel.metadata.iflowName}\``);
  lines.push(`- **Generated At:** ${docModel.metadata.generatedAt}\n---`);

  lines.push("## 🏢 Systems & Participants");
  docModel.participants.forEach((p) => lines.push(`- ${p.name}`));
  lines.push("\n");

  // Loop through grouped sections (Main Process, Local Processes, etc.)
  docModel.sections.forEach((section) => {
    lines.push(`## 🛤️ ${section.processName}\n`);

    section.steps.forEach((step) => {
      const displayName =
        step.name && step.name !== step.id
          ? `${step.name} (${step.id})`
          : step.id;

      lines.push(`### ${step.order}. ${displayName}`);
      lines.push(`> **Location:** 🏢 ${section.processName}`);
      lines.push(`* **Component:** \`${step.activityType}\``);

      if (step.adapter) {
        lines.push(`* **Communication:** 🔌 Uses **${step.adapter}** adapter`);
      }

      // FIX: Handle semantic object/summary properly
      if (step.semantic) {
        if (Array.isArray(step.semantic.summary)) {
          step.semantic.summary.forEach((s) =>
            lines.push(`* **Behavior:** ${s}`)
          );
        } else if (typeof step.semantic === "string") {
          lines.push(`* **Behavior:** ${step.semantic}`);
        } else if (step.semantic.description) {
          lines.push(`* **Behavior:** ${step.semantic.description}`);
        }
      }

      // RESTORED: Router Logic (Routing Table)
      if (
        step.activityType === "ExclusiveGateway" ||
        step.activityType === "Router" ||
        (step.name && step.name.toLowerCase().includes("router"))
      ) {
        const routes = safeFlows.filter((f) => f && f.sourceRef === step.id);
        if (routes.length > 0) {
          lines.push("\n| Route Name | Condition | Target |");
          lines.push("| :--- | :--- | :--- |");
          routes.forEach((r) => {
            const cond = r["bpmn2:conditionExpression"]
              ? `\`${
                  r["bpmn2:conditionExpression"]["_"] ||
                  r["bpmn2:conditionExpression"]
                }\``
              : "*Default*";
            const target = safeActivities.find((a) => a.id === r.targetRef);
            lines.push(
              `| **${r.name || "Route"}** | ${cond} | ${
                target ? target.name || target.id : "End"
              } |`
            );
          });
          lines.push("\n"); // spacing
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
// 👆🏼THE FINAL CODE
//////////////////////////////////////////////////////////////////////////////
