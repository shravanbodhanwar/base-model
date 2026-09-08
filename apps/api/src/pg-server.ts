import net from 'net';
import path from 'path';
import { PGlite } from '@electric-sql/pglite';
// @ts-ignore
const { fromNodeSocket } = require('pg-gateway/node');

const dataDir = path.join(__dirname, '../pgdata');
const db = new PGlite(dataDir);

const server = net.createServer(async (socket) => {
  try {
    await fromNodeSocket(socket, {
      db,
      // Omit auth to allow instant completeAuthentication (trust mode)
    });
  } catch (err) {
    console.error('[Embedded PostgreSQL] Connection error:', err);
  }
});

const PORT = 5432;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Embedded PostgreSQL] Ready on 127.0.0.1:${PORT} (Data directory: ${dataDir})`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[PostgreSQL] Port ${PORT} already in use. Assuming external PostgreSQL is running.`);
  } else {
    console.error('[PostgreSQL] Server error:', err);
  }
});
