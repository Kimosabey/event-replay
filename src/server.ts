// HTTP surface (Node built-in http — no framework):
//   POST /commands  { "type": "Open"|"Deposit"|"Withdraw", ... }  -> { event, state }
//   GET  /state           -> current state
//   GET  /state?at=<seq>  -> time-travelled state
//   GET  /events          -> the full log
//   GET  /health

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { EventStore } from './eventStore.ts';
import { Account } from './account.ts';
import type { Command } from './domain.ts';

const account = new Account(new EventStore());

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (req.method === 'POST' && url.pathname === '/commands') {
      const cmd = JSON.parse((await readBody(req)) || '{}') as Command;
      const event = account.handle(cmd);
      return json(res, 200, { event, state: account.state() });
    }
    if (req.method === 'GET' && url.pathname === '/state') {
      const at = url.searchParams.get('at');
      return json(res, 200, at ? account.stateAt(Number(at)) : account.state());
    }
    if (req.method === 'GET' && url.pathname === '/events') return json(res, 200, account.events());
    if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true });
    return json(res, 404, { error: 'not found' });
  } catch (e) {
    return json(res, 400, { error: (e as Error).message });
  }
});

const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => console.log(`EventReplay listening on :${port}`));

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let d = '';
    req.on('data', (c) => (d += c));
    req.on('end', () => resolve(d));
  });
}

function json(res: ServerResponse, code: number, obj: unknown): void {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(obj));
}
