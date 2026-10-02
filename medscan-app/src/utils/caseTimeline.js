// Only explicit case links are used; similar symptoms never merge separate reports.
export function getCaseVersions(analysis, candidates = []) {
  if (!analysis?._id) return [];
  const root = String(analysis.caseId || analysis._id);
  const person = analysis.monitoredPersonId || "self";
  const unique = new Map();
  for (const item of [...(Array.isArray(candidates) ? candidates : []), analysis]) {
    if (!item?._id || String(item.caseId || item._id) !== root || (item.monitoredPersonId || "self") !== person) continue;
    unique.set(String(item._id), item);
  }
  return [...unique.values()].sort((a, b) => {
    if (String(a._id) === root) return -1;
    if (String(b._id) === root) return 1;
    return (Date.parse(a.createdAt) || 0) - (Date.parse(b.createdAt) || 0) || String(a._id).localeCompare(String(b._id));
  });
}

export function timelineEntry(version, versions) {
  const original = item => !item.parentAnalysisId && (!item.caseId || String(item.caseId) === String(item._id));
  const isOriginal = original(version);
  const parentIndex = versions.findIndex(item => String(item._id) === String(version.parentAnalysisId));
  const index = versions.findIndex(item => String(item._id) === String(version._id));
  const result = version.result || version;
  const numberAt = position => versions.slice(0, position + 1).filter(item => !original(item)).length;
  return {
    title: isOriginal ? "Relato inicial" : `Complemento ${numberAt(index)}`,
    input: isOriginal ? version.symptoms : version.additionalInfo,
    inputMissing: isOriginal ? "Relato em texto não registrado." : "O texto deste complemento não foi salvo separadamente.",
    summary: result.report?.summary || version.recommendation || result.recommendation || "Resumo não disponível neste registro.",
    parentLabel: !isOriginal && (parentIndex < 0 || parentIndex !== index - 1)
      ? parentIndex < 0 ? "Registro anterior não carregado" : original(versions[parentIndex]) ? "A partir do relato inicial" : `A partir do complemento ${numberAt(parentIndex)}`
      : null,
    isOriginal
  };
}

export function timelineDate(value) {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime())
    ? date.toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Horário não informado";
}
