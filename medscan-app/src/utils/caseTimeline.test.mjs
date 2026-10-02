import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCaseVersions, timelineEntry, timelineDate } from './caseTimeline.js';
const original = { _id: 'a', createdAt: '2026-09-20T10:00:00Z', symptoms: 'Relato inicial', recommendation: 'Orientação inicial' };
const addition = { _id: 'b', caseId: 'a', parentAnalysisId: 'a', createdAt: '2026-09-21T10:00:00Z', symptoms: 'Relato inicial + novo texto', additionalInfo: 'Novo texto', result: { report: { summary: 'Nova orientação' } } };

test('orders and deduplicates one case, excluding unrelated records and other people', () => {
  const data = [addition, { ...addition, _id: 'x', monitoredPersonId: 'family' }, { _id: 'unrelated', symptoms: 'Relato inicial' }, original, addition];
  assert.deepEqual(getCaseVersions(addition, data).map(v => v._id), ['a', 'b']);
  assert.equal(data[0], addition);
});
test('keeps the opened record when history is empty or incomplete', () => {
  assert.deepEqual(getCaseVersions(addition), [addition]);
  assert.deepEqual(getCaseVersions(addition, [original]).map(v => v._id), ['a', 'b']);
  assert.deepEqual(getCaseVersions(null), []);
});
test('shows only the new information for each complement, not accumulated symptoms', () => {
  const entry = timelineEntry(addition, [original, addition]);
  assert.equal(entry.input, 'Novo texto'); assert.equal(entry.summary, 'Nova orientação');
  assert.equal(timelineEntry(original, [original, addition]).title, 'Relato inicial');
});
test('missing original or legacy addition is not presented as an initial report', () => {
  const entry = timelineEntry({ ...addition, additionalInfo: undefined }, [addition]);
  assert.equal(entry.isOriginal, false); assert.equal(entry.input, undefined);
  assert.equal(entry.parentLabel, 'Registro anterior não carregado');
});
test('identifies a complement made from an older version rather than pretending a linear history', () => {
  const branch = { ...addition, _id: 'c', createdAt: '2026-09-22T10:00:00Z' };
  const entry = timelineEntry(branch, [original, addition, branch]);
  assert.equal(entry.parentLabel, 'A partir do relato inicial');
});
test('missing or malformed dates remain explicit', () => {
  assert.equal(timelineDate(undefined), 'Horário não informado');
  assert.equal(timelineDate('bad'), 'Horário não informado');
});
