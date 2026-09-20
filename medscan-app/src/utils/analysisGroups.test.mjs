import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupAnalyses } from './analysisGroups.js';
test('groups linked revisions without merging unrelated matching titles', () => {
  const history = [
    { _id: 'a', createdAt: '2026-01-01', type: 'exam', possibleCondition: 'Título' },
    { _id: 'b', caseId: 'a', createdAt: '2026-01-03', type: 'symptoms' },
    { _id: 'c', createdAt: '2026-01-02', possibleCondition: 'Título' }
  ];
  const grouped = groupAnalyses(history);
  assert.equal(grouped.length, 2); assert.equal(grouped[0].id, 'a'); assert.equal(grouped[0].original.type, 'exam'); assert.equal(grouped[0].latest._id, 'b'); assert.equal(grouped[0].versions.length, 2);
  assert.equal(groupAnalyses(history, true)[0].id, 'c'); assert.equal(history[0]._id, 'a');
});
