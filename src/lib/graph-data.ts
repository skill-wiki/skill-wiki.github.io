// Build-time graph data — picks the most-connected atoms across all packs
// and emits a node + edge list lean enough to ship in HTML.

import { loadAll } from './corpus';

export type GraphNode = {
  id: string;
  short: string;
  kind: string;
  pack: string;
  deg: number;
  preview: string;
};

export type GraphEdge = {
  source: string; // node id
  target: string; // node id
  verb: string;
};

export function buildGraph(maxNodes = 90): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const { corpora } = loadAll();
  const all = corpora.flatMap((c) => c.atoms);

  // Degree per atom (in + out).
  const deg = new Map<string, number>();
  for (const a of all) {
    deg.set(a.id, a.edges.length + a.edgesIn.length);
  }

  // Pick top-N by degree.
  const top = [...all]
    .sort((a, b) => (deg.get(b.id)! - deg.get(a.id)!))
    .slice(0, maxNodes);
  const idSet = new Set(top.map((a) => a.id));

  const nodes: GraphNode[] = top.map((a) => ({
    id: a.id,
    short: a.shortId,
    kind: a.kind,
    pack: a.corpus,
    deg: deg.get(a.id) ?? 0,
    preview: (a.preview || '').slice(0, 140),
  }));

  // Edges between selected atoms only.
  const edgeSet = new Set<string>();
  const edges: GraphEdge[] = [];
  for (const a of top) {
    for (const e of a.edges) {
      if (!idSet.has(e.target)) continue;
      const key = `${a.id}|${e.target}|${e.type}`;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push({ source: a.id, target: e.target, verb: e.type });
    }
  }

  return { nodes, edges };
}
