import { localDate, medicationAgenda } from "./careRecords.js";
import { shiftDay } from "./careCalendar.js";

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  return localDate(new Date(year, month - 1, day, 12)) === value;
}
const validTime = value => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

// Descriptive agenda only: never infer that a missing confirmation means a missed dose.
export function dailyCare(records, doses, now = new Date()) {
  const today = localDate(now);
  const minute = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const ownRecords = records.filter(record => !record.archived && (record.monitoredPersonId || "self") === "self");
  const medicines = ownRecords.filter(record => record.kind === "medication" && record.status === "active"
    && (!record.startDate || validDate(record.startDate)) && (!record.endDate || validDate(record.endDate)))
    .map(record => ({ ...record, times: (Array.isArray(record.times) ? record.times : []).filter(validTime) }));
  const agenda = medicationAgenda(medicines, doses, today);
  const earlier = agenda.filter(item => !item.taken && item.time < minute);
  const candidates = medicines.flatMap(record => {
    const date = record.startDate && record.startDate > today ? record.startDate : today;
    // A daily schedule needs at most today and the next day to find its next slot.
    for (const day of [date, shiftDay(date, 1)]) {
      const next = medicationAgenda([record], doses, day).find(item => !item.taken && (day > today || item.time >= minute));
      if (next) return [next];
    }
    return [];
  }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.record.name.localeCompare(b.record.name));
  const appointments = ownRecords.filter(record => record.kind === "appointment" && record.status === "scheduled" && validDate(record.date) && validTime(record.time))
    .filter(record => record.date > today || record.date === today && record.time >= minute)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.name.localeCompare(b.name));
  const vaccines = ownRecords.filter(record => record.kind === "vaccine" && ["planned", "administered"].includes(record.status))
    .map(record => ({ record, date: record.nextDate || (record.status === "planned" ? record.date : "") }))
    .filter(item => validDate(item.date) && item.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.record.name.localeCompare(b.record.name));
  return {
    medication: candidates[0] || null,
    appointment: appointments[0] || null,
    vaccine: vaccines[0] || null,
    pendingEarlier: earlier.length,
    firstEarlier: earlier[0] || null,
    dosesToday: agenda.length,
    takenToday: agenda.filter(item => item.taken).length
  };
}

export function agendaDateLabel(date, now = new Date()) {
  const today = localDate(now);
  if (date === today) return "Hoje";
  if (date === shiftDay(today, 1)) return "Amanhã";
  const [year, month, day] = date.split("-");
  return `${day}/${month}${year !== String(now.getFullYear()) ? `/${year}` : ""}`;
}
