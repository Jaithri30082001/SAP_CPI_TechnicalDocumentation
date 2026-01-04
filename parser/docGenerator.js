const fs = require("fs");
const path = require("path");

/**
 * Generate human-readable documentation
 */
function generateDocumentation(docModel, options = {}) {
  const {
    outputFormat = "console", // console | markdown
    outputDir = "./output",
  } = options;

  const lines = [];

  // =========================================================
  // Header
  // =========================================================
  lines.push("# Integration Flow Documentation");
  lines.push("");
  lines.push(`**iFlow Name:** ${docModel.metadata.iflowName}`);
  lines.push(`**Generated At:** ${docModel.metadata.generatedAt}`);
  lines.push("");

  // =========================================================
  // Participants
  // =========================================================
  lines.push("## Participants");
  docModel.participants.forEach((p) => {
    lines.push(`- **${p.name}**`);
  });
  lines.push("");

  // =========================================================
  // Message Flows
  // =========================================================
  lines.push("## Message Flows");
  docModel.messageFlows.forEach((f) => {
    lines.push(`- **${f.source} → ${f.target}** (Adapter: ${f.adapterType})`);
  });
  lines.push("");

  // =========================================================
  // Integration Steps
  // =========================================================
  lines.push("## Integration Steps");

  docModel.integrationSteps.forEach((step) => {
    lines.push(
      `### ${step.order}. ${step.activityType || step.type} — ${
        step.name || "Unnamed"
      }`
    );

    if (step.semantic?.summary?.length) {
      step.semantic.summary.forEach((s) => {
        lines.push(`- ${s}`);
      });
    }

    // Optional: show config only if meaningful
    if (step.config) {
      const hasConfig =
        Object.keys(step.config.headers || {}).length > 0 ||
        Object.keys(step.config.properties || {}).length > 0 ||
        step.config.wrapContent;

      if (hasConfig) {
        lines.push("");
        lines.push("**Configuration Details:**");

        if (Object.keys(step.config.headers || {}).length > 0) {
          lines.push("- Modified Headers:");
          Object.entries(step.config.headers).forEach(([k, v]) => {
            lines.push(`  - ${k}: ${v}`);
          });
        }

        if (Object.keys(step.config.properties || {}).length > 0) {
          lines.push("- Modified Properties:");
          Object.entries(step.config.properties).forEach(([k, v]) => {
            lines.push(`  - ${k}: ${v}`);
          });
        }

        if (step.config.wrapContent) {
          lines.push("- Message body is wrapped");
        }
      }
    }

    lines.push("");
  });

  // =========================================================
  // Output
  // =========================================================
  const outputText = lines.join("\n");

  if (outputFormat === "console") {
    console.log("\n==============================================\n");
    console.log(outputText);
    console.log("\n==============================================\n");
  }

  if (outputFormat === "markdown") {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filePath = path.join(outputDir, "IntegrationFlowDocumentation.md");
    fs.writeFileSync(filePath, outputText, "utf8");

    console.log(`📄 Documentation written to: ${filePath}`);
  }

  return outputText;
}

module.exports = {
  generateDocumentation,
};
