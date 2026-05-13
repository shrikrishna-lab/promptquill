import fs from 'node:fs';
import path from 'node:path';
import {
  capacitorBinPath,
  copyFile,
  ensureDir,
  formatBytes,
  getApkPath,
  getGradleCommand,
  mobileDir,
  nodeExecutable,
  releasesReleaseDir,
  runCommand,
  stripNativePurchasesAndroidPlugin,
  viteBinPath
} from './android-utils.mjs';

if (process.argv.includes('--help')) {
  console.log('Build a PromptQuill Android release APK and copy it to /mobile/releases/release.');
  console.log('Usage: node scripts/build-release-apk.mjs');
  process.exit(0);
}

console.log('Building mobile web bundle...');
await runCommand(nodeExecutable(), [viteBinPath(), 'build', '--config', 'vite.config.mobile.js', '--mode', 'mobile'], {
  cwd: mobileDir
});

console.log('Syncing Capacitor Android assets...');
await runCommand(nodeExecutable(), [capacitorBinPath(), 'sync', 'android'], {
  cwd: mobileDir
});

console.log('Applying local Android release build patches...');
stripNativePurchasesAndroidPlugin();

console.log('Assembling Android release APK...');
const gradle = getGradleCommand('assembleRelease');
await runCommand(gradle.command, gradle.args, {
  cwd: gradle.cwd
});

const apkSourcePath = getApkPath('release');
ensureDir(releasesReleaseDir);
const apkFileName = path.basename(apkSourcePath);
const apkDestinationPath = path.join(releasesReleaseDir, apkFileName);
copyFile(apkSourcePath, apkDestinationPath);

const apkStats = fs.statSync(apkDestinationPath);
console.log('');
console.log('Release APK ready');
console.log(`Path: ${apkDestinationPath}`);
console.log(`Size: ${formatBytes(apkStats.size)}`);
