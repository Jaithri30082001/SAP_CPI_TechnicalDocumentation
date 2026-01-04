const { extractActivityConfig } = require("./activityConfig");
const { generateDocumentation } = require("./docGenerator");
const { extractActivitySemantics } = require("./activitySemantics");

// import node.js file system, path, xml2js module
const fs = require("fs");
const path = require("path");
const { start } = require("repl");
const xml2js = require("xml2js");

const iflwPath = path.join(
  __dirname,
  "../sample_files/src/main/resources/scenarioflows/integrationflow/Create Customer Return in Backend from SAP Complaint Handling.iflw"
);

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

// // function extractActivityConfig(activity) {
//   const extensionProps =
//     activity["bpmn2:extensionElements"]?.["ifl:property"] || [];

//   const propsArray = Array.isArray(extensionProps)
//     ? extensionProps
//     : [extensionProps];

//   const config = {
//     headers: {},
//     properties: {},
//     wrapContent: false,
//   };

//   propsArray.forEach((p) => {
//     if (!p.key) return;

//     if (p.key.startsWith("header.")) {
//       config.headers[p.key.replace("header.", "")] = p.value;
//     } else if (p.key.startsWith("property.")) {
//       config.properties[p.key.replace("property.", "")] = p.value;
//     } else if (p.key === "wrapContent") {
//       config.wrapContent = p.value === "true";
//     }
//   });

//   return config;
// }

// function generateDocumentation(docModel)
// function generateDocumentation(docModel) {
//   console.log("\n================================================");
//   console.log("Integration Flow Documentation");
//   console.log("==================================================");

//   console.log(`iFlow Name: ${docModel.metadata.iflowName}`);
//   console.log(`Generated At: ${docModel.metadata.generatedAt}\n`);

//   console.log("Participants: ");
//   docModel.participants.forEach((p) => {
//     console.log(`- ${p.name}`);
//   });

//   console.log("\nMessage Flows: ");
//   docModel.messageFlows.forEach((f) => {
//     console.log(`- ${f.source} -> ${f.target} (Adapter: ${f.adapterType})`);
//   });

//   console.log("\nIntegration Steps: ");
//   docModel.integrationSteps.forEach((step) => {
//     console.log(`${step.order}. ${step.type} - ${step.name}`);

//     if (step.semantic?.summary?.length) {
//       step.semantic.summary.forEach((s) => {
//         console.log(`   ↳ ${s}`);
//       });
//     }
//   });

//   console.log("\n==============================================\n");
// }

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
    // extract semantic meaning

    // const { type, semantic } = extractActivitySemantics(activity);
    // step.activityType = type;
    // step.semantic = semantic;

    const semantics = extractActivitySemantics(activity);
    step.activityType = semantics.type;
    step.semantic = semantics.semantic;
    step.config = extractActivityConfig(activity);
  });

  // create the documentationModel Skeleton
  const documentationModel = {
    metadata: {
      iflowName: path.basename(iflwPath),
      generatedAt: new Date().toISOString(),
    },
    participants: [],
    messageFlows: [],
    integrationSteps: [],
  };

  documentationModel.participants = participants.map((p) => ({
    id: p.id,
    name: p.name || "N/A",
  }));

  documentationModel.messageFlows = messageFlows.map((flow) => {
    const source = participantMap[flow.sourceRef] || flow.sourceRef;
    const target = participantMap[flow.targetRef] || flow.targetRef;

    const properties = flow["bpmn2:extensionElements"]?.["ifl:property"] || [];
    const propsArray = Array.isArray(properties) ? properties : [properties];

    const adapterProps = {};
    propsArray.forEach((p) => {
      adapterProps[p.key] = p.value;
    });

    return {
      source,
      target,
      adapterType: adapterProps.ComponentType || "Unknown",
    };
  });

  // find all targets
  const allTargets = new Set(flows.map((f) => f.targetRef));

  // a start node is something that is never a target
  const startNode = flows.find((f) => !allTargets.has(f.sourceRef))?.sourceRef;

  if (!startNode) {
    console.warn("⚠️ Could not determine start node from sequence flows.");
    // return;
    // continue anyway - unordered documentation is better than none
  }

  // let current = startNode;

  // let stepNumber = 1;

  // while (current) {
  //   const step = stepMap[current];
  //   if (!step) break;

  //   documentationModel.integrationSteps.push({
  //     order: stepNumber,
  //     type: step.type,
  //     name: step.name,
  //     activityType: step.activityType,
  //     config: step.config || {},
  //     semantic: step.semantic || {},
  //   });

  //   stepNumber++;

  //   const nextFlow = flows.find((f) => f.sourceRef === current);
  //   current = nextFlow ? nextFlow.targetRef : null;
  // }

  let stepNumber = 1;

  Object.values(stepMap)
    .filter((step) => step.type === "Activity")
    .forEach((step) => {
      documentationModel.integrationSteps.push({
        order: stepNumber++,
        type: step.activityType,
        name: step.name,
        config: step.config || {},
        semantic: step.semantic || {},
      });
    });

  // console.log(
  //   "\nDocumentation Model:\n",
  //   JSON.stringify(documentationModel, null, 2)
  // );

  // generateDocumentation(documentationModel);

  generateDocumentation(documentationModel, {
    outputFormat: "markdown",
    outputDir: path.join(__dirname, "../output2"),
  });
});
