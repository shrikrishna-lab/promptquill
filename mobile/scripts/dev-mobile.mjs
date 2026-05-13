import { spawn } from 'node:child_process';
import {
  capacitorBinPath,
  createEnv,
  findLanIp,
  liveReloadPort,
  mobileDir,
  nodeExecutable,
  runCommand,
  viteBinPath,
  waitForPort
} from './android-utils.mjs';

if (process.argv.includes('--help')) {
  console.log('Start PromptQuill mobile live reload on the LAN and sync the live-reload server URL into the Android project.');
  console.log('Usage: node scripts/dev-mobile.mjs');
  process.exit(0);
}

const localIp = findLanIp();
if (!localIp) {
  throw new Error('Unable to detect a LAN IPv4 address. Connect to Wi-Fi or Ethernet, then retry.');
}

const liveReloadUrl = `http://${localIp}:${liveReloadPort}`;
const liveReloadEnv = createEnv({
  PROMPTQUILL_LIVE_RELOAD: 'true',
  PROMPTQUILL_DEV_SERVER_URL: liveReloadUrl
});

console.log(`Live reload URL: ${liveReloadUrl}`);
console.log('Starting Vite dev server on 0.0.0.0...');

const viteProcess = spawn(
  nodeExecutable(),
  [viteBinPath(), '--config', 'vite.config.mobile.js', '--mode', 'mobile', '--host', '0.0.0.0', '--port', String(liveReloadPort)],
  {
    cwd: mobileDir,
    env: liveReloadEnv,
    stdio: 'inherit'
  }
);

viteProcess.on('error', (error) => {
  throw error;
});

const viteReady = await waitForPort('127.0.0.1', liveReloadPort, 30000);
if (!viteReady) {
  viteProcess.kill('SIGTERM');
  throw new Error(`Vite dev server did not become reachable on port ${liveReloadPort}.`);
}

console.log('Syncing Android live reload config...');
await runCommand(
  nodeExecutable(),
  [capacitorBinPath(), 'copy', 'android'],
  {
    cwd: mobileDir,
    env: liveReloadEnv
  }
);

console.log('Android live reload is ready.');
console.log(`Use npm run test:android:usb to install on a USB device with live reload enabled.`);
console.log(`Use npm run test:android:emulator to boot an emulator first if needed.`);
console.log('Press Ctrl+C to stop the Vite server.');

const shutdown = () => {
  if (!viteProcess.killed) {
    viteProcess.kill('SIGTERM');
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await new Promise((resolve, reject) => {
  viteProcess.on('close', (code) => {
    if (code === 0 || code === null) {
      resolve();
      return;
    }
    reject(new Error(`Vite dev server exited with code ${code}.`));
  });
});
