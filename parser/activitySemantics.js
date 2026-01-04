const { extractActivityConfig } = require("./activityConfig");

// -------------------- Activity Type Matchers --------------------
const ACTIVITY_TYPE_MATCHERS = [
  // Participants
  { match: "Sender", type: "Sender" },
  { match: "Receiver", type: "Receiver" },

  // Process
  { match: "IntegrationProcess", type: "Integration Process" },
  { match: "LocalIntegrationProcess", type: "Local Integration Process" },
  { match: "ErrorEventSubProcess", type: "Exception Subprocess" },

  // Events
  { match: "StartEvent", type: "Start Event" },
  { match: "MessageStartEvent", type: "Start Message" },
  { match: "EndEvent", type: "End Event" },
  { match: "MessageEndEvent", type: "End Message" },
  { match: "ErrorStartEvent", type: "Error Start Event" },
  { match: "ErrorEndEvent", type: "Error End Event" },
  { match: "Escalation", type: "Escalation Event" },
  { match: "Timer", type: "Timer Event" },
  { match: "Terminate", type: "Terminate Event" },

  // Mapping
  { match: "MessageMapping", type: "Message Mapping" },
  { match: "IDMapping", type: "ID Mapping" },
  { match: "OperationMapping", type: "Operation Mapping" },
  { match: "XSLT", type: "XSLT Mapping" },

  // Transformation
  { match: "ContentModifier", type: "Content Modifier" },
  { match: "Converter", type: "Converter" },
  { match: "Encoder", type: "Encoder" },
  { match: "Decoder", type: "Decoder" },
  { match: "Filter", type: "Filter" },
  { match: "MessageDigest", type: "Message Digest" },
  { match: "XMLModifier", type: "XML Modifier" },
  { match: "Groovy", type: "Groovy Script" },
  { match: "JavaScript", type: "JavaScript Script" },

  // Calls
  { match: "RequestReply", type: "Request Reply" },
  { match: "Send", type: "Send" },
  { match: "ContentEnricher", type: "Content Enricher" },
  { match: "PollEnrich", type: "Poll Enrich" },
  { match: "ProcessCall", type: "Process Call" },

  // Routing
  { match: "Router", type: "Router" },
  { match: "Splitter", type: "Splitter" },
  { match: "Aggregator", type: "Aggregator" },
  { match: "Gather", type: "Gather" },
  { match: "Join", type: "Join" },
  { match: "Multicast", type: "Multicast" },

  // Security
  { match: "Encrypt", type: "Encryptor" },
  { match: "Decrypt", type: "Decryptor" },
  { match: "Sign", type: "Signer" },
  { match: "Verify", type: "Verifier" },

  // Persistence
  { match: "DataStore", type: "Data Store Operation" },
  { match: "Persist", type: "Persist" },
  { match: "WriteVariables", type: "Write Variables" },

  // Validator
  { match: "Validator", type: "Validator" },
];

// function resolveActivityType(activity)
function resolveActivityType(activity) {
  // inspect extensionElements
  // return "content modifier", "router", etc
  const extensionElements = activity["bpmn2:extensionElements"];
  if (!extensionElements) return "Unknown";

  const props = extensionElements["ifl:property"];
  const propsArray = Array.isArray(props) ? props : props ? [props] : [];

  // Look for known CPI Indicators
  for (const p of propsArray) {
    if (!p.key || !p.value) continue;

    for (const matcher of ACTIVITY_TYPE_MATCHERS) {
      if (p.value.includes(matcher.match)) {
        return matcher.type;
      }
    }
  }

  return "Unknown";
}

// -------------------- Micro Semantic Functions --------------------

// Participants
function extractParticipantSemantic(activity) {
  return {
    role: activity.name,
    summary: ["Integration participant defined"],
  };
}

// Process
function extractProcessSemantic(activity) {
  return {
    transactional: true,
    summary: ["Process orchestration logic"],
  };
}

function extractExceptionSubprocessSemantic(activity) {
  return {
    handleErrors: true,
    summary: ["Error handling subprocess"],
  };
}

// Events
function extractEventSemantic(activity) {
  return {
    eventType: activity.name,
    summary: ["Event control point"],
  };
}

// Mapping
function extractMappingSemantic(activity) {
  return {
    mappingType: activity.name,
    summary: ["Message structure transformed"],
  };
}

// Transformation
function extractContentModifierSemantic(activity) {
  const config = extractActivityConfig(activity);

  return {
    modifiesHeaders: Object.keys(config.headers).length > 0,
    modifiesProperties: Object.keys(config.properties).length > 0,
    wrapsMessage: config.wrapContent === true,
    summary: [
      Object.keys(config.headers).length > 0 ? "Headers modified" : null,
      Object.keys(config.properties).length > 0 ? "Properties modified" : null,
      config.wrapContent ? "Message body wrapped" : null,
    ].filter(Boolean),
  };
}

function extractConverterSemantic(activity) {
  return {
    convertsFormat: true,
    summary: ["Payload format converted"],
  };
}

function extractCodecSemantic(activity) {
  return {
    encodingApplied: true,
    summary: ["Encoding or decoding applied"],
  };
}

function extractFilterSemantic(activity) {
  const props = activity["bpmn2:extensionElements"]?.["ifl:property"] || [];
  const propsArray = Array.isArray(props) ? props : [props];

  const conditions = propsArray
    .filter((p) => p.key?.toLowerCase().includes("condition"))
    .map((p) => p.value);

  return {
    filtersMessage: conditions.length > 0,
    conditions,
    summary:
      conditions.length > 0
        ? [`Filters message based on ${conditions.length} condition(s)`]
        : ["Message filtered with default behavior"],
  };
}

function extractMessageDigestSemantic(activity) {
  return {
    generatesHash: true,
    summary: ["Message digest generated"],
  };
}

function extractXMLModifierSemantic(activity) {
  return {
    modifiesXML: true,
    summary: ["XML structure modified"],
  };
}

function extractScriptSemantic(activity) {
  return {
    scriptName: getIflProperty(activity, "script"),
    summary: ["Custom script executed"],
  };
}

// Calls
function extractCallSemantic(activity) {
  return {
    externalInteraction: true,
    summary: ["External or local system invoked"],
  };
}

// Routing
function extractRouterSemantic(activity) {
  const props = activity["bpmn2:extensionElements"]?.["ifl:property"] || [];
  const propsArray = Array.isArray(props) ? props : [props];

  const conditions = propsArray
    .filter((p) => p.key?.toLowerCase().includes("condition"))
    .map((p) => p.value);

  return {
    conditionalRouting: conditions.length > 0,
    conditions,
    summary:
      conditions.length > 0
        ? [`Routes message based on ${conditions.length} condition(s)`]
        : ["Routes message using default path"],
  };
}

function extractSplitterSemantic(activity) {
  return {
    splitsMessage: true,
    summary: ["Message split into multiple parts"],
  };
}

function extractAggregatorSemantic(activity) {
  return {
    aggregatesMessages: true,
    summary: ["Messages aggregated"],
  };
}

function extractGatherSemantic(activity) {
  return {
    gathersMessages: true,
    summary: ["Multiple messages gathered"],
  };
}

function extractJoinSemantic(activity) {
  return {
    joinsFlows: true,
    summary: ["Parallel flows joined"],
  };
}

function extractMulticastSemantic(activity) {
  return {
    multicasts: true,
    summary: ["Message sent to multiple receivers"],
  };
}

// Security
function extractSecuritySemantic(activity) {
  const props = activity["bpmn2:extensionElements"]?.["ifl:property"] || [];
  const propsArray = Array.isArray(props) ? props : [props];

  const secType = propsArray.find((p) => p.key === "type")?.value || "unknown";

  return {
    securityApplied: true,
    securityType: secType,
    summary: [`Security operation applied: ${secType}`],
  };
}

// Persistence
function extractPersistenceSemantic(activity) {
  return {
    persistsData: true,
    summary: ["Data persisted or retrieved"],
  };
}

// Validator
function extractValidatorSemantic(activity) {
  return {
    validatesPayload: true,
    summary: ["Payload validation performed"],
  };
}

// -------------------- Activity Handlers --------------------
const ACTIVITY_SEMANTIC_HANDLERS = {
  // Participants
  Sender: extractParticipantSemantic,
  Receiver: extractParticipantSemantic,

  // Process
  "Integration Process": extractProcessSemantic,
  "Local Integration Process": extractProcessSemantic,
  "Exception Subprocess": extractExceptionSubprocessSemantic,

  // Events
  "Start Event": extractEventSemantic,
  "Start Message": extractEventSemantic,
  "End Event": extractEventSemantic,
  "End Message": extractEventSemantic,
  "Error Start Event": extractEventSemantic,
  "Error End Event": extractEventSemantic,
  "Escalation Event": extractEventSemantic,
  "Timer Event": extractEventSemantic,
  "Terminate Event": extractEventSemantic,

  // Mapping
  "Message Mapping": extractMappingSemantic,
  "ID Mapping": extractMappingSemantic,
  "Operation Mapping": extractMappingSemantic,
  "XSLT Mapping": extractMappingSemantic,

  // Transformation
  "Content Modifier": extractContentModifierSemantic,
  Converter: extractConverterSemantic,
  Encoder: extractCodecSemantic,
  Decoder: extractCodecSemantic,
  Filter: extractFilterSemantic,
  "Message Digest": extractMessageDigestSemantic,
  "XML Modifier": extractXMLModifierSemantic,
  "Groovy Script": extractScriptSemantic,
  "JavaScript Script": extractScriptSemantic,

  // Calls
  "Request Reply": extractCallSemantic,
  Send: extractCallSemantic,
  "Content Enricher": extractCallSemantic,
  "Poll Enrich": extractCallSemantic,
  "Process Call": extractCallSemantic,

  // Routing
  Router: extractRouterSemantic,
  Splitter: extractSplitterSemantic,
  Aggregator: extractAggregatorSemantic,
  Gather: extractGatherSemantic,
  Join: extractJoinSemantic,
  Multicast: extractMulticastSemantic,

  // Security
  Encryptor: extractSecuritySemantic,
  Decryptor: extractSecuritySemantic,
  Signer: extractSecuritySemantic,
  Verifier: extractSecuritySemantic,

  // Persistence
  "Data Store Operation": extractPersistenceSemantic,
  Persist: extractPersistenceSemantic,
  "Write Variables": extractPersistenceSemantic,

  // Validator
  Validator: extractValidatorSemantic,
};

// -------------------- Main Extractor --------------------
function extractActivitySemantics(activity, resolveActivityType) {
  const activityType = resolveActivityType(activity);

  const handler = ACTIVITY_SEMANTIC_HANDLERS[activityType];

  if (!handler) {
    return {
      type: activityType,
      semantic: {
        summary: ["No detailed semantics extracted"],
      },
    };
  }

  return {
    type: activityType,
    semantic: handler(activity),
  };
}

// -------------------- Exports --------------------
module.exports = {
  ACTIVITY_TYPE_MATCHERS,
  ACTIVITY_SEMANTIC_HANDLERS,
  resolveActivityType,
  extractActivitySemantics,
};
