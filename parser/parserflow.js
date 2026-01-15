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

  // --- NEW: Map Process IDs to Human Names (e.g., Process_1 -> "Integration Process") ---
  const processNameMap = {};
  const participants = toArray(
    definitions["bpmn2:collaboration"]?.["bpmn2:participant"]
  );
  participants.forEach((p) => {
    if (p.processRef)
      processNameMap[p.processRef] = p.name || "Unnamed Process";
  });

  // 1. Map Adapters
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

  // 2. Extract Elements with Process Context
  let allElements = [];
  const allFlows = [];

  processes.forEach((proc) => {
    const procId = proc.id;
    const procName = processNameMap[procId] || "Main Process";

    allFlows.push(...toArray(proc["bpmn2:sequenceFlow"]));

    const tags = [
      { tag: "bpmn2:startEvent", cat: "Start Event" },
      { tag: "bpmn2:endEvent", cat: "End Event" },
      { tag: "bpmn2:callActivity", cat: "Activity" },
      { tag: "bpmn2:serviceTask", cat: "Service Task" },
      { tag: "bpmn2:exclusiveGateway", cat: "Router" },
      { tag: "bpmn2:subProcess", cat: "Sub-Process" },
      { tag: "bpmn2:intermediateCatchEvent", cat: "Intermediate Event" },
      // --- ADD THESE MISSING COMPONENTS ---
      { tag: "ifl:messageMapping", cat: "Message Mapping" },
      { tag: "ifl:jsonToXmlConverter", cat: "JSON to XML Converter" },
      { tag: "ifl:xmlToJsonConverter", cat: "XML to JSON Converter" },
    ];

    tags.forEach((t) => {
      toArray(proc[t.tag]).forEach((el) => {
        allElements.push({
          ...el,
          internalCategory: t.cat,
          parentProcess: procName, // <--- Tagging the location
        });
      });
    });
  });

  const nameMap = Object.fromEntries(
    allElements.map((el) => [el.id, el.name || el.id])
  );

  // 3. APPLY LOGICAL ORDERING
  const finalSequence = getLogicalOrder(allElements, allFlows);

  const documentationModel = {
    metadata: {
      iflowName: path.basename(iflwPath),
      generatedAt: new Date().toISOString(),
    },
    participants: participants.map((p) => ({
      name: p.name || "External System",
    })),
    integrationSteps: finalSequence.map((el, index) => {
      const semantics = extractActivitySemantics(el, { nameMap });
      return {
        order: index + 1,
        id: el.id,
        name: el.name || `Unnamed ${el.internalCategory}`,
        parentProcess: el.parentProcess, // <--- Passing it to the model
        activityType: semantics.type || el.internalCategory,
        semantic: semantics.semantic,
        adapter: adapterMap[el.id] || null,
        config: extractActivityConfig(el),
      };
    }),
  };

  generateDocumentation(documentationModel, allFlows, allElements, {
    outputDir,
  });
  console.log(`✅ Documentation Generated for ${allElements.length} elements.`);
});
