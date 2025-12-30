// import node.js file system, path, xml2js module
const fs = require("fs");
const path = require("path");
const { start } = require("repl");
const xml2js = require("xml2js"); // translator between CPI BPMN XML and the JSON we are going to work with

const iflwPath = path.join(
  __dirname,
  "../CPI_TD_sample_1/src/main/resources/scenarioflows/integrationflow/CPI_TD_sample_1.iflw"
); // the path might be wrong and it should be changed to something dynamic
if (!fs.existsSync(iflwPath)) {
  console.error("iFlow file not found at: ", iflwPath);
  process.exit(1);
}
const xmlData = fs.readFileSync(iflwPath, "utf8"); // reads the .iflw file synchronously and returns the entire xml as a string
const parser = new xml2js.Parser({
  explicitArray: false, //cleaner JSON
  mergeAttrs: true,
});

// function extractActivityConfig

function extractActivityConfig(activity) {
  const extensionProps =
    activity["bpmn2:extensionElements"]?.["ifl:property"] || [];

  const propsArray = Array.isArray(extensionProps)
    ? extensionProps
    : [extensionProps];

  const config = {
    headers: {},
    properties: {},
    wrapContent: false,
  };

  propsArray.forEach((p) => {
    if (!p.key) return;

    if (p.key.startsWith("header.")) {
      config.headers[p.key.replace("header.", "")] = p.value;
    } else if (p.key.startsWith("property.")) {
      config.properties[p.key.replace("property.", "")] = p.value;
    } else if (p.key === "wrapContent") {
      config.wrapContent = p.value === "true";
    }
  });

  return config;
}

// Parse XML
parser.parseString(xmlData, (err, result) => {
  if (err) {
    console.error("XML Parsing failed: ", err);
    return;
  }

  console.log("XML Parsed successfully\n");

  // Temp: dump top - level keys
  console.log(Object.keys(result));
  const outputDir = path.join(__dirname, "../output");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, "iflow.json");

  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf8");

  console.log("JSON written successfully");

  //   Extracting the required fields from the JSON file
  const definitions = result["bpmn2:definitions"];
  let participants =
    definitions["bpmn2:collaboration"]?.["bpmn2:participant"] || [];

  if (!Array.isArray(participants)) {
    participants = [participants];
  }

  console.log("\nParticipants");
  participants.forEach((p, index) => {
    console.log(`-${index + 1}. Name: ${p.name || "N/A"}, ID: ${p.id}`);
  });

  let messageFlows =
    definitions["bpmn2:collaboration"]?.["bpmn2:messageFlow"] || [];

  if (!Array.isArray(messageFlows)) {
    messageFlows = [messageFlows];
  }

  const participantMap = {};
  participants.forEach((p) => {
    participantMap[p.id] = p.name;
  });

  console.log("\nMessage Flow: ");
  messageFlows.forEach((flow) => {
    const source = participantMap[flow.sourceRef] || flow.sourceRef;
    const target = participantMap[flow.targetRef] || flow.targetRef;
    const properties = flow["bpmn2:extensionElements"]?.["ifl:property"] || [];
    const propsArray = Array.isArray(properties) ? properties : [properties];

    const adapterProps = {};
    propsArray.forEach((p) => {
      adapterProps[p.key] = p.value;
    });

    console.log(`-${source} -> ${target}`);
    console.log(` Adapter Type: ${adapterProps.ComponentType || "Unknown"}`);
  });

  // extracting the process
  const process = definitions["bpmn2:process"];

  // collect process elements
  const startEvents = process["bpmn2:startEvent"];
  const endEvents = process["bpmn2:endEvent"];
  const activities = process["bpmn2:callActivity"];
  const sequenceFlows = process["bpmn2:sequenceFlow"];

  const toArray = (el) => (Array.isArray(el) ? el : el ? [el] : []);

  //   normalize everything
  const starts = toArray(startEvents);
  const ends = toArray(endEvents);
  const acts = toArray(activities);
  const flows = toArray(sequenceFlows);

  // build lookup map (ID -> Step)
  const stepMap = {};

  starts.forEach((s) => {
    stepMap[s.id] = {
      type: "Start Event",
      name: s.name,
    };
  });

  acts.forEach((a) => {
    stepMap[a.id] = {
      type: "Activity",
      name: a.name,
      activityType: a.activityType || "Unknown",
      config: {},
    };
  });

  ends.forEach((e) => {
    stepMap[e.id] = {
      type: "End Event",
      name: e.name,
    };
  });

  //   now enrich the activities
  acts.forEach((activity) => {
    const step = stepMap[activity.id];
    if (!step) return;

    step.config = extractActivityConfig(activity);
  });

  let current = starts[0].id;

  console.log("\nIntegration steps: ");

  let stepNumber = 1;
  while (current) {
    const step = stepMap[current];
    if (!step) break;

    console.log(`${stepNumber}. ${step.type} - ${step.name}`);
    stepNumber++;

    const nextFlow = flows.find((f) => f.sourceRef === current);
    current = nextFlow ? nextFlow.targetRef : null;
  }
});
