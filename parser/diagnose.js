const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

const iflwPath = path.join(
  __dirname,
  "../sample_files/src/main/resources/scenarioflows/integrationflow/Create Customer Return in Backend from SAP Complaint Handling.iflw"
);
const xmlData = fs.readFileSync(iflwPath, "utf8");

const parser = new xml2js.Parser();
parser.parseString(xmlData, (err, result) => {
  const tags = new Set();

  function findTags(obj) {
    for (let key in obj) {
      tags.add(key);
      if (typeof obj[key] === "object") {
        findTags(obj[key]);
      }
    }
  }

  findTags(result);
  console.log("--- ALL TAGS FOUND IN YOUR IFLOW ---");
  console.log(Array.from(tags).sort().join("\n"));
});
