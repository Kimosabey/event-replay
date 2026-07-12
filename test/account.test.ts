import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventStore } from '../src/eventStore.ts';
import { Account } from '../src/account.ts';

function fresh() {
  let t = 0;
  return new Account(new EventStore(() => ++t));
}

test('a valid command appends exactly one event', () => {
  const acc = fresh();
  acc.handle({ type: 'Open', owner: 'a' });
  acc.handle({ type: 'Deposit', amount: 40 });
  assert.equal(acc.events().length, 2);
  assert.equal(acc.state().balance, 40);
});

test('overdraft is rejected and never touches the log', () => {
  const acc = fresh();
  acc.handle({ type: 'Open', owner: 'a' });
  acc.handle({ type: 'Deposit', amount: 20 });
  assert.throws(() => acc.handle({ type: 'Withdraw', amount: 100 }), /insufficient funds/);
  assert.equal(acc.events().length, 2); // withdraw was not recorded
  assert.equal(acc.state().balance, 20);
});

test('commands on an unopened account are rejected', () => {
  const acc = fresh();
  assert.throws(() => acc.handle({ type: 'Deposit', amount: 10 }), /not open/);
});

test('opening twice is rejected', () => {
  const acc = fresh();
  acc.handle({ type: 'Open', owner: 'a' });
  assert.throws(() => acc.handle({ type: 'Open', owner: 'b' }), /already open/);
});

test('sequence numbers are monotonic from 1', () => {
  const acc = fresh();
  acc.handle({ type: 'Open', owner: 'a' });
  acc.handle({ type: 'Deposit', amount: 10 });
  assert.deepEqual(
    acc.events().map((e) => e.seq),
    [1, 2],
  );
});
