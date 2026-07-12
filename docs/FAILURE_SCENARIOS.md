# Failure Scenarios — EventReplay

Event sourcing turns most "failures" into recoverable ones, because the log — not mutable state — is the
source of truth.

## Fault Analysis
- **Process crash / restart.** In-memory derived state is lost, but the event log is authoritative:
  `EventStore.load(events)` rehydrates a fresh store and `rebuild()` reproduces state exactly. Tested by
  *"recovery — a fresh store loaded from the log reproduces state."*
- **Invalid command (overdraft, deposit on a closed account).** `decide()` throws; **no event is appended**,
  so the log stays a record of things that actually happened. The API returns `400`. Tested.
- **Corrupted / reordered log on load.** `load()` sorts by `seq` before use, so out-of-order persistence
  still replays correctly (folds apply in sequence order).
- **Snapshot mistrust.** Snapshots are only an optimization: `rebuildFrom(snapshot, …)` is tested to equal a
  full rebuild for *every* target seq, so a bad/stale snapshot can be discarded and state rebuilt from the log.

## Recovery Strategy
- **Rebuild from the log** is the universal recovery path — current state, any past state (`@seq`), or a
  post-corruption state all come from replaying events.
- Determinism (pure `apply`, injected clock) guarantees recovery yields the identical state every time.

## Known limits
- The demo store is in-memory, so durability depends on persisting the log (disk/Kafka) — a listed future
  enhancement. The design already isolates the store behind a small interface for exactly this.

## Verification
- 10 tests including deterministic replay, time-travel at every seq, snapshot==full-rebuild, recovery from
  a reloaded log, and command-rejection (overdraft / closed / double-open).
