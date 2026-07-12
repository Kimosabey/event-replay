// Offline demo: run commands, then prove the three event-sourcing properties —
// deterministic replay, time-travel, and snapshot-accelerated rebuild.
// `npm run demo`.

import { EventStore } from './eventStore.ts';
import { Account } from './account.ts';
import { rebuild, rebuildFrom, snapshot } from './replay.ts';

let t = 0;
const store = new EventStore(() => ++t); // deterministic clock
const acc = new Account(store);

acc.handle({ type: 'Open', owner: 'harshan' });
acc.handle({ type: 'Deposit', amount: 100 });
acc.handle({ type: 'Withdraw', amount: 30 });
acc.handle({ type: 'Deposit', amount: 50 });

console.log('event log:');
for (const e of acc.events()) console.log(' ', JSON.stringify(e));

console.log('\ncurrent balance:', acc.state().balance); // 120
console.log('balance @seq 2 (after first deposit):', acc.stateAt(2).balance); // 100

// snapshot at seq 2, then rebuild forward from it — must equal a full rebuild
const snap = snapshot(acc.events(), 2);
const fromSnap = rebuildFrom(snap, acc.events(), acc.events().length);
const full = rebuild(acc.events());
console.log('\nsnapshot rebuild == full rebuild:', JSON.stringify(fromSnap) === JSON.stringify(full));

// determinism: replaying the same log twice yields identical state
const a = JSON.stringify(rebuild(acc.events()));
const b = JSON.stringify(rebuild(acc.events()));
console.log('replay is deterministic:', a === b);

// a rejected command never touches the log
try {
  acc.handle({ type: 'Withdraw', amount: 9999 });
} catch (e) {
  console.log('\noverdraft rejected:', (e as Error).message, '| log length still', acc.events().length);
}
