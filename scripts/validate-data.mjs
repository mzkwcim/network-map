import fs from "node:fs";

function readJson(path) {
  const raw = fs.readFileSync(path, "utf8");
  return JSON.parse(raw);
}

const topo = readJson("src/data/topology.json");
const flows = readJson("src/data/flows.json");

if (!Array.isArray(topo.nodes)) throw new Error("topology.json: nodes must be an array");
if (!Array.isArray(flows.edges)) throw new Error("flows.json: edges must be an array");

const nodeIds = new Set(topo.nodes.map(n => n.id));
for (const n of topo.nodes) {
  if (!n.id || !n.label) throw new Error(`Node missing id/label: ${JSON.stringify(n)}`);
}

for (const e of flows.edges) {
  if (!e.from || !e.to) throw new Error(`Edge missing from/to: ${JSON.stringify(e)}`);
  if (!nodeIds.has(e.from)) throw new Error(`Edge.from points to missing node: ${e.from}`);
  if (!nodeIds.has(e.to)) throw new Error(`Edge.to points to missing node: ${e.to}`);
}

console.log("✅ Data validation passed");