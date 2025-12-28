// import node.js file system, path, xml2js module
const fs = require("fs");
const path = require("path");
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

    console.log(`-${source} -> ${target}`);
  });
});
