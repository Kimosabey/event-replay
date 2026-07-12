# Getting Started — EventReplay

## Prerequisites
- **Node.js 22.6+** (runs the TypeScript directly via type-stripping — no build step).
- **Docker** (optional) to run the HTTP service.

No external services or API keys — the event store is in-memory.

## Run it
```bash
git clone https://github.com/Kimosabey/event-replay.git
cd event-replay

npm test          # 10 tests, zero dependencies
npm run demo      # replay, time-travel, and snapshot equivalence, proven live
docker compose up # serve the HTTP API on :4000
```

## Environment variables
| Key | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `4000` | HTTP port for the command/query API |

## Running tests
```bash
npm test          # node --test over test/**/*.test.ts
```

## Try the API
```bash
curl -s localhost:4000/commands -H 'content-type: application/json' -d '{"type":"Open","owner":"me"}'
curl -s localhost:4000/commands -H 'content-type: application/json' -d '{"type":"Deposit","amount":100}'
curl -s localhost:4000/state          # current state
curl -s "localhost:4000/state?at=1"   # time-travel to seq 1
```
