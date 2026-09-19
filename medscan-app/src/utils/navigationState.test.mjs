import { test } from 'node:test';
import assert from 'node:assert/strict';
import { publicNavigationState } from './navigationState.js';

test('health data stays in memory and is excluded from URL state', () => {
  const state = { index: 0, routes: [{ name: 'Analyze', params: { initialSymptoms: 'private symptoms', monitoredPersonId: 'relative' } }] };
  const sanitized = publicNavigationState(state);
  assert.deepEqual(sanitized, { index: 0, routes: [{ name: 'Analyze' }] });
  assert.equal(state.routes[0].params.initialSymptoms, 'private symptoms');
});
test('nested navigator parameters are also excluded', () => {
  const state = { routes: [{ name: 'Root', state: { routes: [{ name: 'Result', params: { analysis: { symptoms: 'private' } } }] } }] };
  assert.equal(JSON.stringify(publicNavigationState(state)).includes('private'), false);
});
