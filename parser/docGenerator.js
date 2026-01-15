const fs = require("fs");
const path = require("path");

/**
 * Generate human-readable documentation
 */
function generateDocumentation(docModel, options = {}) {
  const { outputFormat = "markdown", outputDir = "./output" } = options;
  const lines = [];

  // 1. Header & Metadata
  lines.push("# Integration Flow Documentation");
  lines.push("");
  lines.push(`- **iFlow Name:** \`${docModel.metadata.iflowName}\``);
  lines.push(`- **Generated At:** ${docModel.metadata.generatedAt}`);
  lines.push("");
  lines.push("---");

  // 2. Participants
  lines.push("## 🏢 Systems & Participants");
  docModel.participants.forEach((p) => lines.push(`- ${p.name}`));
  lines.push("");

  // 3. Integration Steps
  lines.push("## 🛤️ Integration Process Flow");
  lines.push(
    "This section describes the step-by-step logic executed within the middleware.\n"
  );

  docModel.integrationSteps.forEach((step) => {
    lines.push(`### ${step.order}. ${step.name}`);
    lines.push(`* **Component:** \`${step.activityType}\``);

    if (step.adapter) {
      lines.push(`* **Communication:** 🔌 Uses **${step.adapter}** adapter`);
    }

    // Behavior/Semantics
    if (step.semantic?.summary?.length) {
      step.semantic.summary.forEach((s) => {
        lines.push(`* **Behavior:** ${s}`);
      });
    }

    // UPDATED CONFIGURATION LOGIC: Loop through all technical properties
    if (step.config && Object.keys(step.config).length > 0) {
      lines.push("");
      lines.push("<details>");
      lines.push("<summary>⚙️ View Technical Configuration</summary>");
      lines.push("");

      // Loop through all generic config keys
      Object.entries(step.config).forEach(([key, value]) => {
        // Skip keys we've already handled or internal arrays
        if (key === "headersDefined" || key === "propertiesDefined") return;

        // Beautify key (e.g., resourcePath -> Resource Path)
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        lines.push(`- **${label}:** \`${value}\``);
      });

      // Handle the specialized tables from Content Modifiers
      if (step.config.headersDefined) {
        lines.push("\n**Headers Defined:**");
        step.config.headersDefined.forEach((h) => lines.push(`- ${h}`));
      }

      if (step.config.propertiesDefined) {
        lines.push("\n**Properties Defined:**");
        step.config.propertiesDefined.forEach((p) => lines.push(`- ${p}`));
      }

      lines.push("");
      lines.push("</details>");
    }

    lines.push("\n---");
  });

  const outputText = lines.join("\n");

  if (outputFormat === "markdown") {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const filePath = path.join(outputDir, "IntegrationFlowDocumentation.md");
    fs.writeFileSync(filePath, outputText, "utf8");
    console.log(`✅ Documentation successfully generated at: ${filePath}`);
  }

  return outputText;
}

module.exports = { generateDocumentation };
