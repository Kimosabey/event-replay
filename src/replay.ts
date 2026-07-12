// The replay engine: rebuild current or past state from the event log, and use
// snapshots to avoid replaying the whole log every time.

import { apply, initialState, type Event, type State } from './domain.ts';

/** Rebuild full state by folding every event. Deterministic: same log -> same state. */
export function rebuild(events: Event[]): State {
  return events.reduce(apply, initialState);
}

/** Time-travel: rebuild state as of a given sequence number. */
export function rebuildUpTo(events: Event[], seq: number): State {
  return events.filter((e) => e.seq <= seq).reduce(apply, initialState);
}

export interface Snapshot {
  seq: number;
  state: State;
}

/** Capture a snapshot of state as of `seq`. */
export function snapshot(events: Event[], seq: number): Snapshot {
  return { seq, state: rebuildUpTo(events, seq) };
}

/**
 * Rebuild up to `targetSeq` starting from a snapshot, applying only the events after it.
 * Equivalent to rebuildUpTo(events, targetSeq) but cheaper for long logs.
 */
export function rebuildFrom(snap: Snapshot, events: Event[], targetSeq: number): State {
  if (targetSeq < snap.seq) return rebuildUpTo(events, targetSeq); // snapshot is in the future
  return events
    .filter((e) => e.seq > snap.seq && e.seq <= targetSeq)
    .reduce(apply, snap.state);
}
