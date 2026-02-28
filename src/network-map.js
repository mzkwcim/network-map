async function loadJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

function el(name, attrs = {}) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

function clear(svg) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

function renderTopology(svg, nodes, onSelect) {
  clear(svg);

  // simple layout: nodes already contain x/y
  for (const n of nodes) {
    const g = el("g", { class: "node", "data-id": n.id, cursor: "pointer" });
    const rect = el("rect", { x: n.x, y: n.y, width: n.w || 220, height: n.h || 72, rx: 14, ry: 14,
      fill: "rgba(255,255,255,0.06)", stroke: "rgba(255,255,255,0.14)", "stroke-width": 1
    });
    const title = el("text", { x: n.x + 12, y: n.y + 26, fill: "rgba(255,255,255,0.92)", "font-size": 16, "font-weight": 650 });
    title.textContent = n.label;

    const meta = el("text", { x: n.x + 12, y: n.y + 48, fill: "rgba(255,255,255,0.72)", "font-size": 12 });
    meta.textContent = `${n.zone || ""}${n.role ? " • " + n.role : ""}`;

    g.appendChild(rect);
    g.appendChild(title);
    g.appendChild(meta);

    g.addEventListener("click", () => onSelect({ type: "node", data: n }));

    // hover
    g.addEventListener("mouseenter", () => { rect.setAttribute("stroke", "rgba(93,143,255,0.75)"); rect.setAttribute("fill", "rgba(255,255,255,0.09)"); });
    g.addEventListener("mouseleave", () => { rect.setAttribute("stroke", "rgba(255,255,255,0.14)"); rect.setAttribute("fill", "rgba(255,255,255,0.06)"); });

    svg.appendChild(g);
  }
}

function renderFlows(svg, nodesById, edges, onSelect) {
  clear(svg);

  // draw nodes as small dots + labels, edges as lines (basic)
  for (const e of edges) {
    const a = nodesById.get(e.from);
    const b = nodesById.get(e.to);
    if (!a || !b) continue;

    const x1 = a.x + (a.w || 220) / 2;
    const y1 = a.y + (a.h || 72) / 2;
    const x2 = b.x + (b.w || 220) / 2;
    const y2 = b.y + (b.h || 72) / 2;

    const path = el("path", {
      d: `M ${x1} ${y1} L ${x2} ${y2}`,
      fill: "none",
      stroke: "rgba(255,255,255,0.18)",
      "stroke-width": 2,
      cursor: "pointer"
    });
    path.addEventListener("click", () => onSelect({ type: "edge", data: e }));

    path.addEventListener("mouseenter", () => path.setAttribute("stroke", "rgba(93,143,255,0.85)"));
    path.addEventListener("mouseleave", () => path.setAttribute("stroke", "rgba(255,255,255,0.18)"));

    svg.appendChild(path);
  }

  // draw node labels
  for (const n of nodesById.values()) {
    const cx = n.x + (n.w || 220) / 2;
    const cy = n.y + (n.h || 72) / 2;

    const dot = el("circle", { cx, cy, r: 6, fill: "rgba(255,255,255,0.7)" });
    const label = el("text", { x: cx + 10, y: cy + 4, fill: "rgba(255,255,255,0.85)", "font-size": 12 });
    label.textContent = n.label;

    svg.appendChild(dot);
    svg.appendChild(label);
  }
}

function setDetails(sel) {
  const typeEl = document.getElementById("detailType");
  const nameEl = document.getElementById("dName");
  const roleEl = document.getElementById("dRole");
  const zoneEl = document.getElementById("dZone");
  const addrEl = document.getElementById("dAddr");
  const accessEl = document.getElementById("dAccess");
  const notesEl = document.getElementById("dNotes");

  if (!sel) {
    typeEl.textContent = "—";
    nameEl.textContent = "Click a node/flow";
    roleEl.textContent = "—";
    zoneEl.textContent = "—";
    addrEl.textContent = "—";
    accessEl.textContent = "—";
    notesEl.textContent = "—";
    return;
  }

  typeEl.textContent = sel.type;

  if (sel.type === "node") {
    const n = sel.data;
    nameEl.textContent = n.label || n.id;
    roleEl.textContent = n.role || "—";
    zoneEl.textContent = n.zone || "—";
    addrEl.textContent = n.addr || "—";
    accessEl.textContent = n.access || "—";
    notesEl.textContent = n.notes || "—";
  } else {
    const e = sel.data;
    nameEl.textContent = `${e.from} → ${e.to}`;
    roleEl.textContent = e.proto || "—";
    zoneEl.textContent = e.zone || "—";
    addrEl.textContent = e.path || "—";
    accessEl.textContent = e.auth || "—";
    notesEl.textContent = e.notes || "—";
  }
}

function setView(view) {
  const topoView = document.getElementById("topologyView");
  const flowsView = document.getElementById("flowsView");
  const buttons = document.querySelectorAll(".tabBtn");

  topoView.classList.toggle("hidden", view !== "topology");
  flowsView.classList.toggle("hidden", view !== "flows");

  buttons.forEach(b => b.setAttribute("aria-selected", b.dataset.view === view ? "true" : "false"));
}

(async function main(){
  const [topology, flows] = await Promise.all([
    loadJson("./data/topology.json"),
    loadJson("./data/flows.json"),
  ]);

  const nodes = topology.nodes;
  const nodesById = new Map(nodes.map(n => [n.id, n]));

  const topoSvg = document.getElementById("topologySvg");
  const flowsSvg = document.getElementById("flowsSvg");

  setDetails(null);
  setView("topology");

  const onSelect = (sel) => setDetails(sel);

  renderTopology(topoSvg, nodes, onSelect);
  renderFlows(flowsSvg, nodesById, flows.edges, onSelect);

  document.querySelectorAll(".tabBtn").forEach(btn => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  document.getElementById("resetBtn").addEventListener("click", () => setDetails(null));
})().catch(err => {
  console.error(err);
  alert(err.message);
});