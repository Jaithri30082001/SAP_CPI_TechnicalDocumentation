function getLogicalOrder(allElements, allFlows) {
  const ordered = [];
  const visited = new Set();

  // 1. Identify all unique processes (Main, Locals, and SubProcesses)
  const processes = [...new Set(allElements.map((el) => el.parentProcess))];

  // Sort processes so "Integration Process" (Main) always leads
  processes.sort((a, b) => {
    if (a === "Integration Process") return -1;
    if (b === "Integration Process") return 1;
    return 0;
  });

  processes.forEach((procName) => {
    const procElements = allElements.filter(
      (el) => el.parentProcess === procName
    );

    // 2. Find the Start Node for this specific process/subprocess
    const startNode = procElements.find(
      (el) =>
        el.internalCategory === "Start Event" ||
        el.internalCategory === "StartEvent"
    );

    if (!startNode) return;
    const stack = [startNode];

    while (stack.length > 0) {
      let current = stack.pop();
      if (!current || visited.has(current.id)) continue;

      ordered.push(current);
      visited.add(current.id);

      // 3. Find outgoing paths belonging to this process
      const outgoing = allFlows.filter((f) => f.sourceRef === current.id);

      // --- BUSINESS-FIRST SORTING ---
      // We sort so that "End Events" are pushed to the stack FIRST.
      // Since it's a stack (LIFO), the End Event will be popped LAST.
      outgoing.sort((a, b) => {
        const targetA = allElements.find((el) => el.id === a.targetRef);
        const targetB = allElements.find((el) => el.id === b.targetRef);

        const isEndA = targetA?.internalCategory?.toLowerCase().includes("end");
        const isEndB = targetB?.internalCategory?.toLowerCase().includes("end");

        if (isEndA && !isEndB) return -1;
        if (!isEndA && isEndB) return 1;
        return 0;
      });

      outgoing.forEach((flow) => {
        const target = allElements.find((el) => el.id === flow.targetRef);
        if (target && !visited.has(target.id)) {
          stack.push(target);
        }
      });
    }
  });

  // 4. Catch orphans (anything missed by flow lines)
  const remaining = allElements.filter((el) => !visited.has(el.id));
  return [...ordered, ...remaining];
}

module.exports = { getLogicalOrder };
// 👆🏼THE FINAL CODE
