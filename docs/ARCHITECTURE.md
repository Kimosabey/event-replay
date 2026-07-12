# Architecture — EventReplay

## High-Level Design (HLD)
EventReplay treats the event log as the source of truth and rebuilds current state — or any past state — by replaying events deterministically, enabling recovery and time-travel debugging.

```mermaid
%%{init: {'theme':'base','themeVariables':{'primaryColor':'#ffffff','lineColor':'#2563eb','mainBkg':'#ffffff'}}}%%
graph LR
    A([Event Log])
    B([Replay Engine])
    C([Fold / Apply])
    D([Rebuilt State])
    A --> B
    B --> C
    C --> D
    style A fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e40af
    style B fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e40af
    style C fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e40af
    style D fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e40af
```

**Flow:** Event Log → Replay Engine → Fold / Apply → Rebuilt State

## Low-Level Design (LLD)
- **Components:** `Kafka`, `Postgres`
- **Interfaces / contracts:** to be finalized during implementation.
- **Data model:** to be defined per component.

## Decision Log
- **Why this stack:** **Kafka** — durable event-streaming backbone; **Postgres** — relational source of truth.
- **Antigravity constraint:** run logic/state/UI locally; offload heavy reasoning to cloud APIs; target modest hardware.

## Concept Deep Dive
Guaranteeing deterministic replay so the same log always yields the same state.
