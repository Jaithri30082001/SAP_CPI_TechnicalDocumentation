/**
 * flowOrder.js
 */
function getLogicalOrder(allElements, allFlows) {
  // 1. Separate Main Process elements from Local Processes
  // We assume "Integration Process" is the primary one
  const mainProcessSteps = allElements.filter(
    (el) => el.parentProcess === "Integration Process"
  );
  const otherSteps = allElements.filter(
    (el) => el.parentProcess !== "Integration Process"
  );

  const orderedMain = [];
  const visited = new Set();

  // 2. Find the head of the Main Process
  const allTargetRefs = new Set(allFlows.map((f) => f.targetRef));
  let current = mainProcessSteps.find(
    (el) => el.internalCategory === "Start Event" && !allTargetRefs.has(el.id)
  );

  // 3. Walk the Main Process Path
  let safety = 0;
  while (current && !visited.has(current.id) && safety < 100) {
    orderedMain.push(current);
    visited.add(current.id);
    safety++;

    const flow = allFlows.find((f) => f.sourceRef === current.id);
    current = flow
      ? mainProcessSteps.find((el) => el.id === flow.targetRef)
      : null;
  }

  // 4. Catch any main steps we missed (side branches)
  const missedMain = mainProcessSteps.filter((el) => !visited.has(el.id));

  // 5. Final order: Ordered Main -> Missed Main -> Local Processes
  return [...orderedMain, ...missedMain, ...otherSteps];
}

module.exports = { getLogicalOrder };
