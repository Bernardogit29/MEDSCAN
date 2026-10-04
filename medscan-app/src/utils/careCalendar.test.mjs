import { test } from "node:test";
import assert from "node:assert/strict";
import { monthCells, shiftDay, shiftMonth } from "./careCalendar.js";
import { medicationAgenda } from "./careRecords.js";

test("month calendar aligns weekdays and includes leap day without spilling into another month", () => {
  const cells = monthCells("2024-02-18");
  assert.equal(cells[4], "2024-02-01");
  assert.equal(cells.filter(Boolean).length, 29);
  assert.equal(cells.filter(Boolean).at(-1), "2024-02-29");
  assert.equal(cells.length % 7, 0);
  assert.equal(monthCells("2026-02-10").filter(Boolean).length, 28);
});
test("calendar navigation crosses year boundaries and avoids end-of-month rollover", () => {
  assert.equal(shiftDay("2026-12-31",1), "2027-01-01");
  assert.equal(shiftDay("2026-01-01",-1), "2025-12-31");
  assert.equal(shiftMonth("2026-01-31",1), "2026-02-01");
  assert.equal(shiftMonth("2026-01-31",-1), "2025-12-01");
});
test("selected-day medication schedule respects course dates and keeps doses on their recorded day", () => {
  const records = [{_id:"a",kind:"medication",name:"Registro A",status:"active",times:["08:00"],startDate:"2026-10-04",endDate:"2026-10-08"}];
  const doses = [{medicationId:"a",date:"2026-10-04",time:"08:00"}];
  assert.ok(medicationAgenda(records,doses,"2026-10-04")[0].taken);
  assert.equal(medicationAgenda(records,doses,"2026-10-05")[0].taken,undefined);
  assert.equal(medicationAgenda(records,doses,"2026-10-03").length,0);
  assert.equal(medicationAgenda(records,doses,"2026-10-09").length,0);
});
