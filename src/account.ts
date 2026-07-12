// The Account aggregate ties it together: current state is always derived from the log,
// commands are validated against that state, and valid commands append one event.

import { decide, type Command, type Event, type State } from './domain.ts';
import { EventStore } from './eventStore.ts';
import { rebuild, rebuildUpTo } from './replay.ts';

export class Account {
  private store: EventStore;

  constructor(store: EventStore) {
    this.store = store;
  }

  /** Current state, rebuilt from the log. */
  state(): State {
    return rebuild(this.store.events());
  }

  /** Time-travel: state as of a sequence number. */
  stateAt(seq: number): State {
    return rebuildUpTo(this.store.events(), seq);
  }

  events(): Event[] {
    return this.store.events();
  }

  /** Handle a command: validate against current state, append the resulting event. */
  handle(cmd: Command): Event {
    const input = decide(this.state(), cmd);
    return this.store.append(input);
  }
}
