const { extractActivityConfig } = require("./activityConfig");

const PALLET_REGISTRY = {
  // --- Participants ---
  Sender: {
    name: "Sender",
    icon: "🏢",
    behavior: "Source system initiating the message.",
  },
  Receiver: {
    name: "Receiver",
    icon: "🎯",
    behavior: "Target system receiving the message.",
  },

  // --- Process ---
  ErrorEventSubProcessTemplate: {
    name: "Exception Subprocess",
    behavior: "⚠️ Error handling: Catches and processes internal exceptions.",
  },
  IntegrationProcess: {
    name: "Integration Process",
    behavior: "⚙️ Main orchestration logic.",
  },
  LocalIntegrationProcess: {
    name: "Local Integration Process",
    behavior: "📦 Reusable local logic.",
  },

  // --- Events ---
  EndEvent: { name: "End Event", behavior: "🛑 Message processing finishes." },
  MessageEndEvent: {
    name: "End Message",
    behavior: "🛑 Finalizes the message processing.",
  },
  ErrorEndEvent: {
    name: "Error End Event",
    behavior: "🛑 Ends process with an error status.",
  },
  StartEvent: {
    name: "Start Event",
    behavior: "🏁 Message processing starts.",
  },
  MessageStartEvent: {
    name: "Start Message",
    behavior: "🏁 Entry point for the integration message.",
  },
  ErrorStartEvent: {
    name: "Error Start Event",
    behavior: "⚠️ Triggered when a specific error occurs.",
  },
  EscalationEndEvent: {
    name: "Escalation End Event",
    behavior: "⤴️ Triggers an escalation process.",
  },
  TerminateEvent: {
    name: "Terminate Message",
    behavior: "🚫 Immediately stops message processing.",
  },
  TimerStartEvent: {
    name: "Timer",
    behavior: "⏰ Triggered based on a schedule.",
  },

  // --- Mapping ---
  IdMapping: {
    name: "ID Mapping",
    behavior: "🆔 Maps identifiers between systems.",
  },
  MessageMapping: {
    name: "Message Mapping",
    behavior: "🗺️ Graphical transformation of message structures.",
  },
  OperationMapping: {
    name: "Operation Mapping",
    behavior: "⚙️ Maps operations between services.",
  },
  XSLT: { name: "XSLT Mapping", behavior: "📜 XML transformation using XSLT." },

  // --- Transformation & Converters ---
  ContentModifier: {
    name: "Content Modifier",
    behavior: "📝 Modifies headers, properties, or body.",
  },
  CsvToXmlConverter: {
    name: "CSV to XML Converter",
    behavior: "🔄 Converts flat CSV to XML.",
  },
  EdiToXmlConverter: {
    name: "EDI to XML Converter",
    behavior: "🔄 Converts EDI structure to XML.",
  },
  JsonToXmlConverter: {
    name: "JSON to XML Converter",
    behavior: "🔄 Converts JSON payload to XML.",
  },
  XmlToCsvConverter: {
    name: "XML to CSV Converter",
    behavior: "🔄 Converts XML structure to flat CSV.",
  },
  XmlToEdiConverter: {
    name: "XML to EDI Converter",
    behavior: "🔄 Converts XML structure to EDI.",
  },
  XmlToJsonConverter: {
    name: "XML to JSON Converter",
    behavior: "🔄 Converts XML payload to JSON.",
  },

  // --- Decoders ---
  Base64Decoder: {
    name: "Base64 Decoder",
    behavior: "🔓 Decodes Base64 encoded content.",
  },
  GZIPDecompression: {
    name: "GZIP Decompression",
    behavior: "🔓 Unpacks GZIP compressed data.",
  },
  MimeMultipartDecoder: {
    name: "MIME Multipart Decoder",
    behavior: "🔓 Decodes MIME multipart messages.",
  },
  ZipDecompression: {
    name: "ZIP Decompression",
    behavior: "🔓 Unpacks ZIP compressed data.",
  },

  // --- Encoders ---
  Base64Encoder: {
    name: "Base64 Encoder",
    behavior: "🔒 Encodes content into Base64.",
  },
  GZIPCompression: {
    name: "GZIP Compression",
    behavior: "🔒 Compresses data using GZIP.",
  },
  MimeMultipartEncoder: {
    name: "MIME Multipart Encoder",
    behavior: "🔒 Encodes content into MIME multipart.",
  },
  ZipCompression: {
    name: "ZIP Compression",
    behavior: "🔒 Packs data into ZIP format.",
  },

  EdiExtractor: {
    name: "EDI Extractor",
    behavior: "🔍 Extracts EDI headers for routing.",
  },
  Filter: {
    name: "Filter",
    behavior: "🔍 Filters message based on XPath or conditions.",
  },
  MessageDigest: {
    name: "Message Digest",
    behavior: "🔑 Generates a cryptographic hash.",
  },
  GroovyScript: {
    name: "Groovy Script",
    behavior: "📜 Executes custom Groovy logic.",
  },
  JsScript: {
    name: "JavaScript",
    behavior: "📜 Executes custom JavaScript logic.",
  },
  XmlModifier: {
    name: "XML Modifier",
    behavior: "📝 Specific modifications for XML nodes.",
  },

  // --- Calls ---
  Enricher: {
    name: "Content Enricher",
    behavior: "➕ Adds data from an external system.",
  },
  PollEnrich: {
    name: "Poll Enrich",
    behavior: "🎣 Polls data from an external system.",
  },
  ExternalCall: {
    name: "Request Reply",
    behavior: "🔌 Synchronous call to an external service.",
  },
  Send: { name: "Send", behavior: "📤 Asynchronous send to a receiver." },
  IdempotentProcessCall: {
    name: "Idempotent Process Call",
    behavior: "📞 Process call with duplicate check.",
  },
  LoopingProcess: {
    name: "Looping Process Call",
    behavior: "🔁 Executes a subprocess in a loop.",
  },
  ProcessCallElement: {
    name: "Process Call",
    behavior: "📞 Invokes a local integration process.",
  },

  // --- Routing ---
  Aggregator: {
    name: "Aggregator",
    behavior: "📥 Combines multiple related messages.",
  },
  Gather: {
    name: "Gather",
    behavior: "📥 Combines messages from multiple paths.",
  },
  Join: { name: "Join", behavior: "🤝 Merges parallel paths." },
  ParallelMulticast: {
    name: "Parallel Multicast",
    behavior: "🛤️ Sends message to multiple paths simultaneously.",
  },
  SequentialMulticast: {
    name: "Sequential Multicast",
    behavior: "🛤️ Sends message to multiple paths in order.",
  },
  ExclusiveGateway: {
    name: "Router",
    behavior: "🔀 Branches flow based on conditions.",
  },

  // --- Splitters ---
  EdiSplitter: { name: "EDI Splitter", behavior: "🔪 Splits EDI documents." },
  GeneralSplitter: {
    name: "General Splitter",
    behavior: "🔪 Splits messages based on line breaks or tags.",
  },
  IdocSplitter: {
    name: "IDOC Splitter",
    behavior: "🔪 Splits IDOC structures.",
  },
  IteratingSplitter: {
    name: "Iterating Splitter",
    behavior: "🔪 Iterates over a list and splits.",
  },
  TarSplitter: {
    name: "Tar Splitter",
    behavior: "🔪 Extracts files from Tar archive.",
  },
  ZipSplitter: {
    name: "Zip Splitter",
    behavior: "🔪 Extracts files from Zip archive.",
  },

  // --- Security ---
  PGPDecryptor: { name: "PGP Decryptor", behavior: "🔓 Decrypts PGP content." },
  PKCS7Decryptor: {
    name: "PKCS7 Decryptor",
    behavior: "🔓 Decrypts PKCS7 content.",
  },
  PGPEncryptor: {
    name: "PGP Encryptor",
    behavior: "🔒 Encrypts content using PGP.",
  },
  PKCS7Encryptor: {
    name: "PKCS7 Encryptor",
    behavior: "🔒 Encrypts content using PKCS7.",
  },
  PKCS7Signer: {
    name: "PKCS7 Signer",
    behavior: "✍️ Signs message using PKCS7.",
  },
  SimpleSigner: {
    name: "Simple Signer",
    behavior: "✍️ Adds digital signature.",
  },
  XmlSigner: {
    name: "XML Digital Signer",
    behavior: "✍️ Adds XML digital signature.",
  },
  PKCS7Verifier: {
    name: "PKCS7 Verifier",
    behavior: "✅ Verifies PKCS7 signature.",
  },
  XmlVerifier: { name: "XML Verifier", behavior: "✅ Verifies XML signature." },

  // --- Persistence ---
  DataStore: {
    name: "Data Store Operation",
    behavior: "💾 Database operation (Write/Get/Delete).",
  },
  Persist: { name: "Persist", behavior: "💾 Stores message for later." },
  WriteVariables: {
    name: "Write Variables",
    behavior: "💾 Stores values in variables.",
  },

  // --- Validator ---
  EdiValidator: {
    name: "EDI Validator",
    behavior: "✅ Validates EDI structure.",
  },
  XmlValidator: {
    name: "XML Validator",
    behavior: "✅ Validates XML against XSD.",
  },
};

function resolveActivityType(activity) {
  const props = activity["bpmn2:extensionElements"]?.["ifl:property"] || [];
  const propsArray = Array.isArray(props) ? props : [props];

  const sapActivityType = propsArray.find(
    (p) => p.key === "activityType"
  )?.value;
  const variant =
    propsArray.find((p) => p.key === "cmdVariantUri")?.value || "";
  const iflType = activity["ifl:type"];

  let lookupKey = sapActivityType || iflType;

  // --- DYNAMIC RESOLVER FOR SPLITTERS ---
  if (sapActivityType === "Splitter") {
    if (variant.includes("EdiSplitter")) lookupKey = "EdiSplitter";
    else if (variant.includes("IdocSplitter")) lookupKey = "IdocSplitter";
    else if (variant.includes("IteratingSplitter"))
      lookupKey = "IteratingSplitter";
    else if (variant.includes("TarSplitter")) lookupKey = "TarSplitter";
    else if (variant.includes("ZipSplitter")) lookupKey = "ZipSplitter";
    else lookupKey = "GeneralSplitter";
  }

  // --- DYNAMIC RESOLVER FOR CONTENT MODIFIER ---
  if (sapActivityType === "Enricher") {
    const version = propsArray.find((p) => p.key === "componentVersion")?.value;
    if (
      version === "1.5" ||
      version === "1.6" ||
      variant.includes("Modifier")
    ) {
      lookupKey = "ContentModifier";
    }
  }

  // --- DYNAMIC RESOLVER FOR MULTICAST ---
  if (variant.includes("SequentialMulticast"))
    lookupKey = "SequentialMulticast";
  if (variant.includes("ParallelMulticast")) lookupKey = "ParallelMulticast";

  // --- DYNAMIC RESOLVER FOR SCRIPTS ---
  if (sapActivityType === "Script") {
    const subType = propsArray.find((p) => p.key === "subActivityType")?.value;
    if (subType === "JsScript") lookupKey = "JsScript";
    else lookupKey = "GroovyScript";
  }

  // Registry Match
  if (PALLET_REGISTRY[lookupKey]) return PALLET_REGISTRY[lookupKey].name;

  // Fallbacks
  if (activity.id?.includes("StartEvent")) return "Start Event";
  if (activity.id?.includes("EndEvent")) return "End Event";

  return "General Step";
}

function extractActivitySemantics(activity, context = { flows: [] }) {
  const typeName = resolveActivityType(activity);
  const config = extractActivityConfig(activity) || {};

  const registryEntry = Object.values(PALLET_REGISTRY).find(
    (e) => e.name === typeName
  );
  let behavior = registryEntry
    ? registryEntry.behavior
    : "Standard integration process step.";

  // Logic for Router paths
  if (typeName === "Router") {
    const routes = (context.flows || [])
      .filter((f) => f.sourceRef === activity.id)
      .map(
        (f) =>
          `Path to ${f.targetName || f.targetRef}: ${
            f["bpmn2:conditionExpression"]?._ || "Default"
          }`
      );
    if (routes.length) behavior = `🔀 ${routes.join(" | ")}`;
  }

  return {
    type: typeName,
    config: config,
    semantic: { summary: [behavior] },
  };
}

module.exports = { extractActivitySemantics, resolveActivityType };
