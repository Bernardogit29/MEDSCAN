import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSessionUsable } from './session.js';
const session = exp => ({ user: { id: 'test' }, token: `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature` });
test('restores only a non-expired structurally valid session', () => { assert.equal(isSessionUsable(session(2000), 1000000), true); assert.equal(isSessionUsable(session(1000), 1000000), false); assert.equal(isSessionUsable(session('2000'), 1000000), false); assert.equal(isSessionUsable({ user: {}, token: 'broken' }), false); assert.equal(isSessionUsable(null), false); });
