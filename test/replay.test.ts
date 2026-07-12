import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventStore } from '../src/eventStore.ts';
import { Account } from '../src/account.ts';
import { rebuild, rebuildUpTo, rebuildFrom, snapshot } from '../src/replay.ts';

function seeded() {
  let t = 0;
  const store = new EventStore(() => ++t);
  const acc = new Account(store);
  acc.handle({ type: 'Open', owner: 'a' });
  acc.handle({ type: 'Deposit', amount: 100 });
  acc.handle({ type: 'Withdraw', amount: 30 });
  acc.handle({ type: 'Deposit', amount: 50 });
  return acc;
}

test('replay is deterministic — same log yields identical state', () => {
  const events = seeded().events();
  assert.deepEqual(rebuild(events), rebuild(events));
  assert.equal(rebuild(events).balance, 120);
});

test('time-travel — state as of an earlier seq', () => {
  const events = seeded().events();
  assert.equal(rebuildUpTo(events, 1).balance, 0); // just opened
  assert.equal(rebuildUpTo(events, 2).balance, 100); // after first deposit
  assert.equal(rebuildUpTo(events, 3).balance, 70); // after withdraw
  assert.equal(rebuildUpTo(events, 4).balance, 120); // final
});

test('snapshot rebuild equals full rebuild for every target seq', () => {
  const events = seeded().events();
  const snap = snapshot(events, 2);
  for (let seq = 2; seq <= events.length; seq++) {
    assert.deepEqual(rebuildFrom(snap, events, seq), rebuildUpTo(events, seq));
  }
});

test('recovery — a fresh store loaded from the log reproduces state', () => {
  const events = seeded().events();
  const recovered = new EventStore();
  recovered.load(events);
  assert.deepEqual(rebuild(recovered.events()), rebuild(events));
});

test('version tracks the last applied seq', () => {
  const events = seeded().events();
  assert.equal(rebuild(events).version, 4);
});
