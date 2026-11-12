import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { takeCoverage } from 'node:v8';

const root = await mkdtemp(join(tmpdir(), 'trihbau-rest-assured-'));
const port = '15303';
const baseURL = 'http://127.0.0.1:' + port;
process.env.TRIHBAU_DB_PATH = join(root, 'test.db');
process.env.TRIHBAU_PORT = port;
process.env.TRIHBAU_HOST = '127.0.0.1';

try {
  const { server, db } = await import('../server/index.js');
  try {
    if (!server.listening) await once(server, 'listening');
    const args = ['-B', '-ntp', '-f', 'api-tests/pom.xml', '-DbaseUrl=' + baseURL, 'test'];
    const maven = process.platform === 'win32'
      ? spawn('cmd.exe', ['/d', '/c', 'mvn', ...args], { stdio: 'inherit' })
      : spawn('mvn', args, { stdio: 'inherit' });
    const [status] = await once(maven, 'exit');
    process.exitCode = status ?? 1;
  } finally {
    server.close();
    server.closeAllConnections();
    db.close();
  }
} finally {
  takeCoverage();
  await rm(root, { recursive: true, force: true });
}
