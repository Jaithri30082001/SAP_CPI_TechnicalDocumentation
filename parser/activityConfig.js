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

module.exports = { extractActivityConfig };
