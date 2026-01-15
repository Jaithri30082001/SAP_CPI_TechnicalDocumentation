const { extractActivityConfig } = require("./activityConfig");
const { generateDocumentation } = require("./docGenerator");
const { extractActivitySemantics } = require("./activitySemantics");

const fs = require("fs");
const path = require("path");
// Removed the 'repl' import as it causes confusion with 'startEvent'
const xml2js = require("xml2js");

const iflwPath = path.join(
  __dirname,
  "../sample_files/src/main/resources/scenarioflows/integrationflow/Create Customer Return in Backend from SAP Complaint Handling.iflw"
);

// output directory for the dump
const outputDir = path.join(__dirname, "../output");
if (!fs.existsSync(outputDir)) {
  // Fixed typo: recursive
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(iflwPath)) {
  console.error("iFlow file not found at: ", iflwPath);
  process.exit(1);
}

const xmlData = fs.readFileSync(iflwPath, "utf8");
const parser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true,
});

const toArray = (el) => (Array.isArray(el) ? el : el ? [el] : []);

// Parse XML
parser.parseString(xmlData, (err, result) => {
  if (err) {
    return console.error("XML Parsing failed: ", err);
  }

  const jsonDumpPath = path.join(outputDir, "raw_iflow_dump.json");
  fs.writeFileSync(jsonDumpPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`\n Raw JSON dumped to: ${jsonDumpPath}`);

  const definitions = result["bpmn2:definitions"];
  const processes = toArray(definitions["bpmn2:process"]);

  const adapterMap = {};
  const messageFlows = toArray(
    definitions["bpmn2:collaboration"]?.["bpmn2:messageFlow"]
  );

  messageFlows.forEach((flow) => {
    const props = toArray(flow["bpmn2:extensionElements"]?.["ifl:property"]);
    const adapter =
      props.find((p) => p.key === "ComponentType")?.value || "ProcessDirect";
    if (flow.sourceRef) adapterMap[flow.sourceRef] = adapter;
    if (flow.targetRef) adapterMap[flow.targetRef] = adapter;
  });

  let allElements = [];
  processes.forEach((proc) => {
    // IMPORTANT: Use 'proc' (the iteration variable), NOT 'process' (the global)
    const steps = [
      ...toArray(proc["bpmn2:startEvent"]).map((e) => ({
        ...e,
        internalCategory: "Start Event",
      })),
      ...toArray(proc["bpmn2:endEvent"]).map((e) => ({
        ...e,
        internalCategory: "End Event",
      })),
      ...toArray(proc["bpmn2:callActivity"]).map((e) => ({
        ...e,
        internalCategory: "Activity",
      })),
      ...toArray(proc["bpmn2:serviceTask"]).map((e) => ({
        ...e,
        internalCategory: "Service Task",
      })),
      ...toArray(proc["bpmn2:exclusiveGateway"]).map((e) => ({
        ...e,
        internalCategory: "Router",
      })),
      ...toArray(proc["bpmn2:subProcess"]).map((e) => ({
        ...e,
        internalCategory: "Sub-Process",
      })),
      ...toArray(proc["bpmn2:parallelGateway"]).map((e) => ({
        ...e,
        internalCategory: "Parallel Gateway",
      })),
      ...toArray(proc["bpmn2:boundaryEvent"]).map((e) => ({
        ...e,
        internalCategory: "Boundary Event",
      })),
      ...toArray(proc["bpmn2:intermediateCatchEvent"]).map((e) => ({
        ...e,
        internalCategory: "Intermediate Event",
      })),
    ];
    allElements = allElements.concat(steps);
  });

  const nameMap = Object.fromEntries(
    allElements.map((el) => [el.id, el.name || el.id])
  );

  const documentationModel = {
    metadata: {
      iflowName: path.basename(iflwPath),
      generatedAt: new Date().toISOString(),
    },
    // Adding participants here as docGenerator expects them
    participants: toArray(
      definitions["bpmn2:collaboration"]?.["bpmn2:participant"]
    ).map((p) => ({
      name: p.name || "External System",
    })),
    integrationSteps: allElements.map((el, index) => {
      const semantics = extractActivitySemantics(el, { nameMap });

      return {
        order: index + 1,
        id: el.id,
        name: el.name || `Unnamed ${el.internalCategory}`,
        activityType: semantics.type || el.internalCategory,
        semantic: semantics.semantic,
        adapter: adapterMap[el.id] || null,
        config: extractActivityConfig(el),
      };
    }),
  };

  generateDocumentation(documentationModel, {
    outputFormat: "markdown",
    outputDir: outputDir,
  });

  console.log(`✅ Successfully parsed ${allElements.length} elements.`);
});
