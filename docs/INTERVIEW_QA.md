# Interview Q&A — EventReplay

### "Tell me about this project."
EventReplay is event-sourced state reconstruction by replaying the event log deterministically. EventReplay treats the event log as the source of truth and rebuilds current state — or any past state — by replaying events deterministically, enabling recovery and time-travel debugging.

### "What was the hardest part?"
Guaranteeing deterministic replay so the same log always yields the same state.

### "Why did you choose this stack?"
- **Kafka** — durable event-streaming backbone.
- **Postgres** — relational source of truth.

### "How does it fit the rest of your portfolio?"
It follows my "Antigravity" model — local logic/state/UI, cloud reasoning where it earns its cost — and shares the documentation and deployment conventions used across all my projects (#56).
