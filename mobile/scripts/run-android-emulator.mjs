import { spawn } from 'node:child_process';
import { getAvdNames, getEmulatorPath, getRunningEmulatorIds } from './android-utils.mjs';

if (process.argv.includes('--help')) {
  console.log('Launch the configured Android emulator for PromptQuill testing.');
  console.log('Usage: node scripts/run-android-emulator.mjs');
  process.exit(0);
}

const runningEmulators = await getRunningEmulatorIds();
if (runningEmulators.length > 0) {
  console.log(`Android emulator already running: ${runningEmulators[0]}`);
  process.exit(0);
}

const avdNames = await getAvdNames();
if (avdNames.length === 0) {
  throw new Error('No Android Virtual Device (AVD) was found. Create one in Android Studio Device Manager first.');
}

const targetAvd = process.env.PROMPTQUILL_ANDROID_AVD || avdNames[0];
const emulatorPath = getEmulatorPath();

console.log(`Launching Android emulator ${targetAvd}...`);
const child = spawn(emulatorPath, ['-avd', targetAvd], {
  detached: true,
  stdio: 'ignore'
});

child.unref();
console.log('Emulator launch requested. Give it a minute to boot before running the app.');
