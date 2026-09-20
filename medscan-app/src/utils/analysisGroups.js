export function groupAnalyses(history, oldestFirst = false) {
  const groups = new Map();
  for (const item of history) {
    const id = String(item.caseId || item._id);
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(item);
  }
  return [...groups.entries()].map(([id, versions]) => {
    versions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return { id, versions, original: versions[0], latest: versions[versions.length - 1] };
  }).sort((a, b) => (new Date(b.latest.createdAt) - new Date(a.latest.createdAt)) * (oldestFirst ? -1 : 1));
}
