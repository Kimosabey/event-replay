// The domain: a small account-ledger aggregate. Events are the source of truth;
// state is derived by folding events. Commands are validated against current state
// and either produce an event or are rejected (the write side of CQRS/event sourcing).

export type EventInput =
  | { type: 'AccountOpened'; owner: string }
  | { type: 'Deposited'; amount: number }
  | { type: 'Withdrew'; amount: number };

/** A stored event = an input stamped with a monotonic sequence number and a timestamp. */
export type Event = EventInput & { seq: number; at: number };

export interface State {
  open: boolean;
  owner: string | null;
  balance: number;
  version: number; // seq of the last event applied
}

export const initialState: State = { open: false, owner: null, balance: 0, version: 0 };

/** Pure reducer: fold one event into state. No I/O, no mutation. */
export function apply(state: State, e: Event): State {
  switch (e.type) {
    case 'AccountOpened':
      return { ...state, open: true, owner: e.owner, version: e.seq };
    case 'Deposited':
      return { ...state, balance: state.balance + e.amount, version: e.seq };
    case 'Withdrew':
      return { ...state, balance: state.balance - e.amount, version: e.seq };
    default:
      return state;
  }
}

export type Command =
  | { type: 'Open'; owner: string }
  | { type: 'Deposit'; amount: number }
  | { type: 'Withdraw'; amount: number };

/** Command handler (write side): validate against current state, return the event to append. */
export function decide(state: State, cmd: Command): EventInput {
  switch (cmd.type) {
    case 'Open':
      if (state.open) throw new Error('account already open');
      if (!cmd.owner) throw new Error('owner required');
      return { type: 'AccountOpened', owner: cmd.owner };
    case 'Deposit':
      if (!state.open) throw new Error('account not open');
      if (cmd.amount <= 0) throw new Error('amount must be positive');
      return { type: 'Deposited', amount: cmd.amount };
    case 'Withdraw':
      if (!state.open) throw new Error('account not open');
      if (cmd.amount <= 0) throw new Error('amount must be positive');
      if (cmd.amount > state.balance) throw new Error('insufficient funds');
      return { type: 'Withdrew', amount: cmd.amount };
    default:
      throw new Error(`unknown command`);
  }
}
