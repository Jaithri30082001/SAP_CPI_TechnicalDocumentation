const { extractActivityConfig } = require("./activityConfig");
const { generateDocumentation } = require("./docGenerator");
const { extractActivitySemantics } = require("./activitySemantics");
const { getLogicalOrder } = require("./flowOrder");

const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

const iflwPath = path.join(
  __dirname,
  "../sample_files/src/main/resources/scenarioflows/integrationflow/Create Customer Return in Backend from SAP Complaint Handling.iflw"
);
const outputDir = path.join(__dirname, "../output");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const xmlData = fs.readFileSync(iflwPath, "utf8");
const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });

const toArray = (el) => (Array.isArray(el) ? el : el ? [el] : []);

parser.parseString(xmlData, (err, result) => {
  if (err) return console.error("XML Parsing failed: ", err);

  const definitions = result["bpmn2:definitions"];
  const processes = toArray(definitions["bpmn2:process"]);

  // 1. Map Process Names
  const processNameMap = {};
  const participants = toArray(
    definitions["bpmn2:collaboration"]?.["bpmn2:participant"]
  );
  participants.forEach((p) => {
    if (p.processRef)
      processNameMap[p.processRef] = p.name || "Unnamed Process";
  });

  // 2. Map Adapters
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
  const allFlows = [];

  // 3. Deep Scanning (including Exception Subprocesses)
  processes.forEach((proc) => {
    const procName = processNameMap[proc.id] || "Main Process";
    allFlows.push(...toArray(proc["bpmn2:sequenceFlow"]));

    const scanElements = (container, parentName) => {
      Object.keys(container).forEach((key) => {
        if (key === "bpmn2:sequenceFlow" || key === "bpmn2:laneSet") return;

        const items = toArray(container[key]);
        items.forEach((item) => {
          if (item.id && typeof item === "object") {
            const semantics = extractActivitySemantics(item, { nameMap: {} });
            allElements.push({
              ...item,
              internalCategory: semantics.type || key.split(":")[1] || key,
              parentProcess: parentName,
            });

            // IF SUBPROCESS: DYNAMICALLY SCAN INSIDE
            if (key === "bpmn2:subProcess" || key === "bpmn2:adHocSubProcess") {
              scanElements(
                item,
                `${parentName} (Nested: ${item.name || item.id})`
              );
              // Also grab internal flows
              allFlows.push(...toArray(item["bpmn2:sequenceFlow"]));
            }
          }
        });
      });
    };

    scanElements(proc, procName);
  });

  const nameMap = Object.fromEntries(
    allElements.map((el) => [el.id, el.name || el.id])
  );
  const finalSequence = getLogicalOrder(allElements, allFlows);

  // 4. Build Document Model
  const documentationModel = {
    metadata: {
      iflowName: path.basename(iflwPath),
      generatedAt: new Date().toISOString(),
    },
    participants: participants.map((p) => ({
      name: p.name || "External System",
    })),
    sections: [],
  };

  const grouped = {};
  finalSequence.forEach((step) => {
    if (!grouped[step.parentProcess]) grouped[step.parentProcess] = [];
    grouped[step.parentProcess].push(step);
  });

  Object.keys(grouped).forEach((procName) => {
    documentationModel.sections.push({
      processName: procName,
      steps: grouped[procName].map((el, index) => ({
        order: index + 1,
        id: el.id,
        name: el.name || nameMap[el.id] || el.id,
        activityType: el.internalCategory,
        semantic: extractActivitySemantics(el, { nameMap }).semantic,
        adapter: adapterMap[el.id] || null,
        config: extractActivityConfig(el),
      })),
    });
  });

  generateDocumentation(documentationModel, allFlows, allElements, {
    outputDir,
  });
  console.log(`🚀 Documentation generated successfully!`);
});
// 👆🏼THE FINAL CODE
/////////////////////////////////////////////////////////////////////////////
