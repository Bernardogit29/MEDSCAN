export const careKinds = {
  medication: { title: "Medicamentos", singular: "medicamento", icon: "pill" },
  allergy: { title: "Alergias", singular: "alergia", icon: "shield-alert-outline" },
  vaccine: { title: "Vacinação", singular: "vacina", icon: "needle" },
  appointment: { title: "Consultas", singular: "consulta", icon: "calendar-clock" }
};
export const careStatuses = { active: "Ativo", paused: "Pausado", inactive: "Inativo", administered: "Recebida", planned: "Prevista", scheduled: "Marcada", completed: "Realizada", cancelled: "Cancelada" };
export const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
export function displayDate(value) {
  if (!value) return "Data não informada";
  const [year, month, day] = value.slice(0,10).split("-");
  return `${day}/${month}/${year}`;
}
export function inputDate(value) {
  if (!value.trim()) return "";
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) throw new Error("Use dia/mês/ano nas datas, por exemplo 03/10/2026.");
  const result = `${match[3]}-${match[2]}-${match[1]}`;
  if (!Number.isFinite(Date.parse(result)) || new Date(result).toISOString().slice(0,10) !== result) throw new Error("Confira a data informada.");
  return result;
}
export const measurementOrigin = record => record.origin === "simulation" || record.source === "simulation" ? "Simulação" : record.origin === "sensor" ? "Sensor" : record.origin === "manual" || record.source === "recorded" ? "Manual" : "Origem não informada";
export function medicationAgenda(records, doses, date = localDate()) {
  return records.filter(record => record.kind === "medication" && !record.archived && record.status === "active" && (!record.startDate || record.startDate <= date) && (!record.endDate || record.endDate >= date)).flatMap(record => (record.times || []).map(time => ({ record, time, date, taken: doses.find(dose => String(dose.medicationId) === String(record._id) && dose.date === date && dose.time === time) }))).sort((a,b) => a.time.localeCompare(b.time) || a.record.name.localeCompare(b.record.name));
}
export function careTimeline(analyses, measurements, records, doses) {
  const events = [
    ...analyses.map(record => ({ id:`analysis:${record._id}`, at:record.createdAt, kind:record.type === "symptoms" ? "report" : "exam", title:record.parentAnalysisId ? "Relato complementado" : record.type === "symptoms" ? "Relato analisado" : "Exame ou imagem analisado", detail:record.possibleCondition || "Orientação disponível", analysis:record })),
    ...measurements.map(record => ({ id:`measurement:${record._id}`, at:record.measuredAt, kind:"measurement", title:"Medição registrada", detail:[record.heartRate != null && `${record.heartRate} bpm`,record.glucose != null && `${record.glucose} mg/dL`,measurementOrigin(record)].filter(Boolean).join(" · "), measurement:record })),
    ...records.map(record => ({ id:`care:${record._id}`, at:record.date ? `${record.date}T${record.time || "12:00"}:00` : record.createdAt, dateOnly:Boolean(record.date && !record.time), kind:record.kind, title:record.name, detail:[careKinds[record.kind]?.title,careStatuses[record.status],record.archived && "Arquivado"].filter(Boolean).join(" · "), record })),
    ...records.filter(record => record.kind === "vaccine" && !record.archived && record.nextDate).map(record => ({ id:`next:${record._id}`, at:`${record.nextDate}T12:00:00`, dateOnly:true, kind:"vaccine", title:`Próxima dose: ${record.name}`, detail:"Data informada pelo usuário · confirmar no posto", record })),
    ...doses.map(dose => ({ id:`dose:${dose._id}`, at:dose.takenAt, kind:"medication", title:`Tomada registrada: ${dose.name}`, detail:`${dose.dose || ""} · agenda de ${displayDate(dose.date)} às ${dose.time}` }))
  ];
  return events.filter(event => Number.isFinite(Date.parse(event.at))).sort((a,b) => Date.parse(b.at)-Date.parse(a.at) || a.id.localeCompare(b.id));
}
export function chartPoints(records, metric, days, now = Date.now()) {
  return records.filter(record => Number.isFinite(record[metric]) && Number.isFinite(Date.parse(record.measuredAt)) && Date.parse(record.measuredAt) <= now && (!days || Date.parse(record.measuredAt) >= now-days*86400000)).sort((a,b)=>Date.parse(a.measuredAt)-Date.parse(b.measuredAt));
}
