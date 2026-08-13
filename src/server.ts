import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load env files for production custom server (dev mode auto-loads via Next.js)
// Priority: .env.local > .env
// Use both cwd and __dirname to cover dev (src/server.ts) and prod (dist/server.js)
const candidates = [
  resolve(process.cwd(), '.env.local'),
  resolve(process.cwd(), '.env'),
  resolve(__dirname, '.env.local'),
  resolve(__dirname, '.env'),
  resolve(__dirname, '..', '.env.local'),
  resolve(__dirname, '..', '.env'),
];
for (const p of candidates) {
  if (existsSync(p)) {
    config({ path: p, override: true });
    break;
  }
}

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.COZE_PROJECT_ENV !== 'PROD';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '5000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });
  server.once('error', err => {
    console.error(err);
    process.exit(1);
  });
  server.listen(port, () => {
    console.log(
      `> Server listening at http://${hostname}:${port} as ${
        dev ? 'development' : process.env.COZE_PROJECT_ENV
      }`,
    );
  });
});
