// Append-only event log — the single source of truth. Sequence numbers are assigned
// on append; timestamps come from an injectable clock so replay stays deterministic in tests.

import type { Event, EventInput } from './domain.ts';

export class EventStore {
  private log: Event[] = [];
  private clock: () => number;

  constructor(clock: () => number = () => Date.now()) {
    this.clock = clock;
  }

  /** Append an event; returns the stored event stamped with seq + timestamp. */
  append(input: EventInput): Event {
    const e = { ...input, seq: this.log.length + 1, at: this.clock() } as Event;
    this.log.push(e);
    return e;
  }

  get length(): number {
    return this.log.length;
  }

  /** A copy of the full log (never hand out the internal array). */
  events(): Event[] {
    return [...this.log];
  }

  upTo(seq: number): Event[] {
    return this.log.filter((e) => e.seq <= seq);
  }

  /** Recover the store from a persisted log (disaster recovery / rehydration). */
  load(events: Event[]): void {
    this.log = [...events].sort((a, b) => a.seq - b.seq);
  }
}
