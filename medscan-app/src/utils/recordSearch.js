function normalize(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}
function texts(value) {
  if (typeof value === "string" || typeof value === "number") return [String(value)];
  if (Array.isArray(value)) return value.flatMap(texts);
  if (value && typeof value === "object") return Object.values(value).flatMap(texts);
  return [];
}
export function matchesRecord(record, query) {
  const terms = normalize(query).split(" ").filter(Boolean);
  const searchable = [record.name, record.dose, record.location, record.reaction, record.notes,
    record.professional, record.questions, record.documents, record.instructions,
    record.symptoms, record.possibleCondition, record.recommendation, record.additionalInfo,
    ...texts(record.result), ...texts(record.followUpContext)];
  const content = normalize(searchable.filter(Boolean).join(" "));
  return terms.every(term => content.includes(term));
}
