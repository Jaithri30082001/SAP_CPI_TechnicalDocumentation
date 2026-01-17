const toArray = (el) => (Array.isArray(el) ? el : el ? [el] : []);

/**
 * Extracts technical configuration from CPI components
 */
function extractActivityConfig(el) {
  if (!el) return null;

  const configs = {};

  // 1. Get properties from extensionElements
  const properties = toArray(el["bpmn2:extensionElements"]?.["ifl:property"]);

  // 2. Map Key-Value pairs into a clean object
  // FIX: Using 'properties' consistently here
  properties.forEach((prop) => {
    const technicalKeys = [
      "cmdVariantUri",
      "componentVersion",
      "ComponentNS",
      "Vendor",
      "activityType",
    ];

    // Ensure prop exists and has a key before processing
    if (prop && prop.key && !technicalKeys.includes(prop.key) && prop.value) {
      configs[prop.key] = prop.value;
    }
  });

  // 3. Special Handling for Content Modifier Tables
  if (configs.propertyTable && configs.propertyTable.includes("<row>")) {
    configs.propertiesDefined = parseCpiTable(configs.propertyTable);
    // We keep propertyTable but hide it in documentation if needed
    // or delete it to keep the JSON clean:
    // delete configs.propertyTable;
  }
  if (configs.headerTable && configs.headerTable.includes("<row>")) {
    configs.headersDefined = parseCpiTable(configs.headerTable);
  }

  return Object.keys(configs).length > 0 ? configs : null;
}

/**
 * Helper to parse SAP's internal XML table format
 */
function parseCpiTable(xmlString) {
  const rows = xmlString.match(/<row>.*?<\/row>/g) || [];
  return rows.map((row) => {
    const name = row.match(/<cell id='Name'>(.*?)<\/cell>/)?.[1] || "unnamed";
    const value = row.match(/<cell id='Value'>(.*?)<\/cell>/)?.[1] || "";
    const type = row.match(/<cell id='Type'>(.*?)<\/cell>/)?.[1] || "";
    return `${name} (${type}): ${value}`;
  });
}

module.exports = { extractActivityConfig };
// 👆🏼THE FINAL CODE
//////////////////////////////////////////////////////////////////////////////
