const kinds = ["medication", "allergy", "vaccine", "appointment"];
const statuses = { medication: ["active", "paused"], allergy: ["active", "inactive"], vaccine: ["administered", "planned"], appointment: ["scheduled", "completed", "cancelled"] };
function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
const validTime = value => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
function validateCare(body, kind) {
  if (!kinds.includes(kind)) throw new Error("Categoria inválida.");
  const output = { kind };
  for (const field of ["name", "dose", "location", "reaction", "severity", "lot", "notes"]) {
    if (body[field] != null && typeof body[field] !== "string") throw new Error("Preencha os campos com texto.");
    const value = (body[field] || "").trim();
    if (value.length > (field === "notes" ? 2000 : 200)) throw new Error("Um dos campos excede o tamanho permitido.");
    output[field] = value;
  }
  if (!output.name) throw new Error("Informe o nome.");
  for (const field of ["date", "startDate", "endDate", "nextDate"]) {
    output[field] = body[field] || "";
    if (output[field] && !validDate(output[field])) throw new Error("Informe uma data válida no formato dia/mês/ano.");
  }
  output.time = body.time || "";
  if (output.time && !validTime(output.time)) throw new Error("Informe um horário válido, como 08:30.");
  output.status = body.status || statuses[kind][0];
  if (!statuses[kind].includes(output.status)) throw new Error("Situação inválida para este registro.");
  if (body.archived !== undefined && typeof body.archived !== "boolean") throw new Error("Situação de arquivamento inválida.");
  output.archived = body.archived === true;
  if (kind === "medication") {
    if (!Array.isArray(body.times) || !body.times.length || body.times.length > 12 || body.times.some(time => !validTime(time))) throw new Error("Informe de 1 a 12 horários válidos para a agenda diária.");
    output.times = [...new Set(body.times)].sort();
    if (!output.dose) throw new Error("Informe a dose conforme a prescrição.");
    if (output.startDate && output.endDate && output.endDate < output.startDate) throw new Error("O término não pode ser anterior ao início.");
  }
  if (["vaccine", "appointment"].includes(kind) && !output.date) throw new Error("Informe a data.");
  if (kind === "appointment" && !output.time) throw new Error("Informe o horário da consulta.");
  if (kind === "vaccine" && output.nextDate && output.nextDate < output.date) throw new Error("A próxima dose não pode ser anterior à data registrada.");
  return output;
}
module.exports = { validateCare, validDate, validTime };
