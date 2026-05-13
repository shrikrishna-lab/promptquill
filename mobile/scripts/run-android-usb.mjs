import {
  capacitorBinPath,
  findLanIp,
  getUsbDeviceIds,
  liveReloadPort,
  mobileDir,
  nodeExecutable,
  runCommand,
  waitForPort
} from './android-utils.mjs';

if (process.argv.includes('--help')) {
  console.log('Run the Android app on the first USB-connected device detected by adb.');
  console.log('Usage: node scripts/run-android-usb.mjs');
  process.exit(0);
}

const deviceIds = await getUsbDeviceIds();
if (deviceIds.length === 0) {
  throw new Error('No USB-connected Android device was found. Connect a device with USB debugging enabled, then retry.');
}

const targetId = process.env.PROMPTQUILL_ANDROID_TARGET || deviceIds[0];
const localIp = findLanIp();
const liveReloadReady = localIp ? await waitForPort('127.0.0.1', liveReloadPort, 1500) : false;
const args = [capacitorBinPath(), 'run', 'android', '--target', targetId];

if (liveReloadReady && localIp) {
  console.log(`Detected Vite dev server on ${localIp}:${liveReloadPort}. Using Capacitor live reload for this run.`);
  args.push(
    '--live-reload',
    '--host',
    localIp,
    '--port',
    String(liveReloadPort),
    '--forwardPorts',
    `${liveReloadPort}:${liveReloadPort}`
  );
}

console.log(`Running PromptQuill on USB device ${targetId}...`);

await runCommand(nodeExecutable(), args, { cwd: mobileDir });
