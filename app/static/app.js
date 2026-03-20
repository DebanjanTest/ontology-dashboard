let network;

function riskColor(v){
  if (v >= 70) return '#ff5252';
  if (v >= 50) return '#ffb74d';
  return '#66bb6a';
}

async function loadGraph(){
  const res = await fetch('/api/graph');
  const data = await res.json();

  document.getElementById('nvi').textContent = `NVI: ${data.nvi}`;

  const nodes = data.nodes.map(n => ({
    id: n.id,
    label: `${n.label}\n(${n.risk})`,
    color: riskColor(n.risk),
    shape: 'dot',
    size: 10 + (n.risk/10)
  }));

  const edges = data.edges.map(e => ({
    from: e.from,
    to: e.to,
    label: e.label,
    arrows: 'to',
    color: {opacity: 0.45}
  }));

  const container = document.getElementById('graph');
  const ds = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
  const opts = {
    interaction: { hover: true },
    physics: { stabilization: false },
    edges: { font: { size: 9 } },
    nodes: { font: { color: '#f2f2f2', size: 11 } }
  };

  network = new vis.Network(container, ds, opts);
}

async function loadRisk(){
  const res = await fetch('/api/risk');
  const data = await res.json();
  document.getElementById('nvi').textContent = `NVI: ${data.nvi} (${data.nvi_label})`;

  const html = data.cards.map(c => `
    <div class="card" style="border-left:6px solid ${riskColor(c.score)}">
      <strong>${c.domain}</strong>
      <div>Score: ${c.score}</div>
      <div>Level: ${c.level}</div>
      <div>Trend: ${c.trend}</div>
    </div>
  `).join('');

  document.getElementById('riskCards').innerHTML = html;
}

async function loadFeed(){
  const res = await fetch('/api/feed');
  const data = await res.json();

  const feedHtml = data.items.map(x => `
    <div class="feedItem">
      <div><b>[${x.domain}]</b> ${x.headline}</div>
      <small>${x.source} | risk=${x.risk_score} | ${x.timestamp}</small>
    </div>
  `).join('');

  const latHtml = Object.entries(data.source_latency).map(([k,v]) =>
    `<div class="latItem"><b>${k}</b> — latency ${v.latency} — last ${v.last_updated || '-'} </div>`
  ).join('');

  document.getElementById('feed').innerHTML = feedHtml;
  document.getElementById('latency').innerHTML = latHtml;
}

async function askQuery(){
  const q = document.getElementById('q').value.trim();
  if(!q) return;
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({query:q})
  });
  const data = await res.json();
  document.getElementById('qOut').textContent = JSON.stringify(data, null, 2);
}

async function runCascade(){
  const start = document.getElementById('startNode').value.trim();
  const res = await fetch('/api/cascade', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({start_node:start, max_hops:3})
  });
  const data = await res.json();
  document.getElementById('cascadeOut').textContent = JSON.stringify(data, null, 2);
}

function setupWs(){
  const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws/live');
  ws.onopen = () => ws.send('ping');
  ws.onmessage = async () => {
    await loadFeed();
    await loadRisk();
  };
}

document.getElementById('askBtn').addEventListener('click', askQuery);
document.getElementById('cascadeBtn').addEventListener('click', runCascade);

(async function boot(){
  await loadGraph();
  await loadRisk();
  await loadFeed();
  setupWs();
  setInterval(loadRisk, 15000);
  setInterval(loadFeed, 12000);
})();
