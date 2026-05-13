import fs from 'node:fs';
import path from 'node:path';
import qrModule from 'qrcode-terminal';
import {
  capacitorBinPath,
  copyFile,
  ensureDir,
  ensureReleaseServer,
  fileExists,
  findLanIp,
  formatBytes,
  getDebugApkPath,
  getGradleCommand,
  mobileDir,
  nodeExecutable,
  releasesDebugDir,
  runCommand,
  stripNativePurchasesAndroidPlugin,
  viteBinPath
} from './android-utils.mjs';

const qrcodeTerminal = qrModule.default ?? qrModule;

if (process.argv.includes('--help')) {
  console.log('Build a PromptQuill Android debug APK, copy it to /mobile/releases/debug, and expose it on the LAN with a terminal QR code.');
  console.log('Usage: node scripts/build-debug-apk.mjs');
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

console.log('Applying local Android debug build patches...');
stripNativePurchasesAndroidPlugin();

console.log('Assembling Android debug APK...');
const gradle = getGradleCommand('assembleDebug');
await runCommand(gradle.command, gradle.args, {
  cwd: gradle.cwd
});

const apkSourcePath = getDebugApkPath();
ensureDir(releasesDebugDir);
const apkFileName = path.basename(apkSourcePath);
const apkDestinationPath = path.join(releasesDebugDir, apkFileName);
copyFile(apkSourcePath, apkDestinationPath);

const apkStats = fs.statSync(apkDestinationPath);
console.log('');
console.log('Debug APK ready');
console.log(`Path: ${apkDestinationPath}`);
console.log(`Size: ${formatBytes(apkStats.size)}`);

const downloadPagePath = path.join(releasesDebugDir, 'index.html');
const downloadPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>PromptQuill APK Download</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #08111f, #111c33 48%, #1b2e4d);
        color: #f5f7fb;
      }
      main {
        width: min(92vw, 28rem);
        padding: 2rem;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 1.5rem;
        background: rgba(6, 11, 20, 0.72);
        backdrop-filter: blur(18px);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
      }
      h1 {
        margin: 0 0 0.75rem;
        font-size: 1.7rem;
      }
      p {
        margin: 0 0 1.25rem;
        line-height: 1.5;
        color: rgba(245, 247, 251, 0.82);
      }
      a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 3.25rem;
        border-radius: 999px;
        background: #f5f7fb;
        color: #08111f;
        font-weight: 700;
        text-decoration: none;
      }
      small {
        display: block;
        margin-top: 1rem;
        color: rgba(245, 247, 251, 0.65);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>PromptQuill APK</h1>
      <p>If the download does not start automatically on mobile, tap the button below.</p>
      <a id="downloadLink" href="./${apkFileName}" download>Download APK</a>
      <small>File: ${apkFileName}</small>
    </main>
    <script>
      const link = document.getElementById('downloadLink');
      setTimeout(() => link.click(), 250);
    </script>
  </body>
</html>
`;
fs.writeFileSync(downloadPagePath, downloadPage, 'utf8');

const localIp = findLanIp();
if (!localIp) {
  console.log('QR share skipped: no LAN IPv4 address was detected on this machine.');
  process.exit(0);
}

try {
  const { port, pid } = await ensureReleaseServer(path.join(mobileDir, 'releases'));
  const downloadUrl = `http://${localIp}:${port}/debug/`;

  console.log(`LAN URL: ${downloadUrl}`);
  console.log(`Share server PID: ${pid}`);
  console.log('QR code:');
  qrcodeTerminal.generate(downloadUrl, { small: true });
} catch (error) {
  console.log(`QR share skipped: ${error.message}`);
}
