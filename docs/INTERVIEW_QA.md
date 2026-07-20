# Interview Q&A — EventReplay

### "Tell me about this project."
EventReplay is an event-sourcing engine. Instead of storing and mutating current state, it stores an
append-only log of events and *derives* state by folding that log. That gives three things for free:
deterministic replay, time-travel (rebuild state as of any point), and crash recovery. It's modeled on an
account-ledger aggregate with a real write side — commands are validated and either append one event or are
rejected.

### "What was the hardest / most interesting part?"
Guaranteeing **deterministic replay**. State has to be a pure fold of events, so the only source of
non-determinism (timestamps) is injected via a clock. Once that holds, "rebuild from the log" becomes the
universal recovery and debugging tool — I prove it with a snapshot test that must equal a full rebuild for
*every* sequence number.

### "How do snapshots fit in without becoming a second source of truth?"
A snapshot is just a cached fold up to some seq; `rebuildFrom(snapshot, events, target)` applies only the
events after it. It's tested to equal `rebuildUpTo(events, target)` for every target, so a snapshot can
always be discarded and rebuilt — it's an optimization, never authoritative.

### "How does the write side work?"
`decide(state, command)` validates against current state and returns the event to append — or throws.
An overdraft or a deposit on a closed account is rejected and **never written**, so the log only contains
facts. That's the CQRS split: commands decide, events are the record, state is a projection.

### "Why implement it from scratch (no Kafka/DB)?"
To show the pattern cleanly and keep it verifiable with zero dependencies (10 tests on Node's built-in
runner). The store is behind a small interface, so a durable backend (disk/Kafka) drops in later.

### "How does it fit your portfolio?"
It's my distributed-systems / event-sourcing piece, complementing ChronicleLedger, under the local-first
model — pure, deterministic logic that runs anywhere (`#56`).
