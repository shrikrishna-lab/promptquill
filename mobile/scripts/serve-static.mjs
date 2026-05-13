import path from 'node:path';
import { createStaticFileServer } from './android-utils.mjs';

const directoryToServe = process.argv[2];
const requestedPort = Number(process.argv[3] || 8787);

if (!directoryToServe) {
  console.error('Usage: node serve-static.mjs <directory> [port]');
  process.exit(1);
}

const rootDirectory = path.resolve(directoryToServe);
const server = await createStaticFileServer(rootDirectory, requestedPort);

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
