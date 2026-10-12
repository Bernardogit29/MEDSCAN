import { test } from "node:test";
import assert from "node:assert/strict";
import { dailyCare, agendaDateLabel } from "./dailyCare.js";

const now = new Date(2026, 9, 12, 10, 30);
const medicine = (id, values = {}) => ({ _id: id, kind: "medication", name: id, status: "active", times: ["08:00", "12:00"], ...values });

test("next medication skips taken doses and distinguishes earlier missing confirmations", () => {
  const data = dailyCare([medicine("a"), medicine("b", { times: ["11:00"] })], [{ medicationId: "b", date: "2026-10-12", time: "11:00" }], now);
  assert.equal(data.medication.record._id, "a");
  assert.equal(data.medication.time, "12:00");
  assert.equal(data.pendingEarlier, 1);
  assert.equal(data.takenToday, 1);
  assert.equal(data.dosesToday, 3);
});

test("medication rolls to tomorrow and respects treatment starts, ends and paused records", () => {
  const data = dailyCare([
    medicine("expired", { endDate: "2026-10-11" }),
    medicine("ends-today", { times: ["08:00"], endDate: "2026-10-12" }),
    medicine("paused", { status: "paused", times: ["11:00"] }),
    medicine("later", { startDate: "2026-10-20" }),
    medicine("daily", { times: ["09:00"] })
  ], [], now);
  assert.equal(data.medication.record._id, "daily");
  assert.equal(data.medication.date, "2026-10-13");
  assert.equal(data.pendingEarlier, 2);
  assert.equal(dailyCare([medicine("later", { startDate: "2026-10-20" })], [], now).medication.date, "2026-10-20");
});

test("all confirmations suppress today's medicine without suppressing tomorrow", () => {
  const data = dailyCare([medicine("a")], ["08:00", "12:00"].map(time => ({ medicationId: "a", date: "2026-10-12", time })), now);
  assert.equal(data.medication.date, "2026-10-13");
  assert.equal(data.medication.time, "08:00");
  assert.equal(data.pendingEarlier, 0);
  assert.equal(data.takenToday, 2);
});

test("next appointment ignores past, cancelled, completed and malformed records", () => {
  const appointment = (name, values = {}) => ({ kind: "appointment", name, date: "2026-10-12", time: "11:00", status: "scheduled", ...values });
  const data = dailyCare([
    appointment("past", { time: "10:00" }), appointment("cancelled", { status: "cancelled" }),
    appointment("completed", { status: "completed" }), appointment("invalid", { date: "2026-02-30" }),
    appointment("future", { date: "2026-10-14" }), appointment("next", { time: "15:00" })
  ], [], now);
  assert.equal(data.appointment.name, "next");
});

test("vaccines use the next date supplied, without inventing a schedule for received doses", () => {
  const vaccine = (name, values = {}) => ({ kind: "vaccine", name, status: "administered", date: "2026-10-01", ...values });
  const data = dailyCare([
    vaccine("received"), vaccine("past", { nextDate: "2026-10-11" }),
    vaccine("planned", { status: "planned", date: "2026-10-16" }),
    vaccine("next", { nextDate: "2026-10-12" })
  ], [], now);
  assert.equal(data.vaccine.record.name, "next");
  assert.equal(data.vaccine.date, "2026-10-12");
  assert.equal(dailyCare([vaccine("received")], [], now).vaccine, null);
});

test("archived and family records never enter the titular's panel", () => {
  const records = [medicine("archived", { archived: true }), medicine("relative", { monitoredPersonId: "relative-1" }),
    { kind: "appointment", name: "family", status: "scheduled", date: "2026-10-12", time: "12:00", monitoredPersonId: "relative-1" },
    { kind: "vaccine", name: "archived", status: "planned", date: "2026-10-12", archived: true }];
  const data = dailyCare(records, [], now);
  assert.equal(data.medication, null);
  assert.equal(data.appointment, null);
  assert.equal(data.vaccine, null);
  assert.equal(data.dosesToday, 0);
});

test("local dates cross midnight and the year boundary without UTC day shifts", () => {
  const evening = new Date(2026, 11, 31, 23, 59);
  const data = dailyCare([medicine("a", { times: ["08:00"] })], [], evening);
  assert.equal(data.medication.date, "2027-01-01");
  assert.equal(agendaDateLabel("2027-01-01", evening), "Amanhã");
  assert.equal(agendaDateLabel("2026-12-31", evening), "Hoje");
  assert.equal(agendaDateLabel("2027-01-03", evening), "03/01/2027");
});
