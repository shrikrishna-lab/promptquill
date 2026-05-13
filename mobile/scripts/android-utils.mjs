import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const mobileDir = path.resolve(__dirname, '..');
export const repoRoot = path.resolve(mobileDir, '..');
export const androidDir = path.join(mobileDir, 'android');
export const releasesDebugDir = path.join(mobileDir, 'releases', 'debug');
export const releasesReleaseDir = path.join(mobileDir, 'releases', 'release');
export const isWindows = process.platform === 'win32';
export const liveReloadPort = 5173;
export const apkSharePort = 8787;

const privateRanges = [
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./
];

export function resolveFromRepo(...segments) {
  return path.join(repoRoot, ...segments);
}

export function resolveFromMobile(...segments) {
  return path.join(mobileDir, ...segments);
}

export function fileExists(targetPath) {
  try {
    fs.accessSync(targetPath);
    return true;
  } catch {
    return false;
  }
}

export function ensureDir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

export function findLanIp() {
  const interfaces = os.networkInterfaces();
  const matches = [];

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses ?? []) {
      if (address.family !== 'IPv4' || address.internal) continue;
      matches.push(address.address);
    }
  }

  const preferred = matches.find((address) => privateRanges.some((pattern) => pattern.test(address)));
  return preferred || matches[0] || '';
}

export function createEnv(extraEnv = {}) {
  return {
    ...process.env,
    ...extraEnv
  };
}

export function runCommand(command, args = [], options = {}) {
  const { cwd = mobileDir, env = process.env, shell = false, capture = false } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      shell,
      stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit'
    });

    let stdout = '';
    let stderr = '';

    if (capture) {
      child.stdout?.on('data', (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on('data', (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on('error', (error) => {
      const wrapped = new Error(
        `Unable to start command: ${command} ${args.join(' ')}${error.code ? ` (${error.code})` : ''}`
      );
      wrapped.code = error.code;
      wrapped.cause = error;
      reject(wrapped);
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ code, stdout, stderr });
        return;
      }

      const error = new Error(`Command failed: ${command} ${args.join(' ')}`);
      error.code = code;
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
  });
}

export function resolveExecutable(candidateNames = []) {
  const pathEntries = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  const extensions = isWindows ? ['.exe', '.cmd', '.bat', ''] : [''];

  for (const candidate of candidateNames.filter(Boolean)) {
    if (path.isAbsolute(candidate) && fileExists(candidate)) return candidate;

    for (const entry of pathEntries) {
      for (const extension of extensions) {
        const fullPath = path.join(entry, `${candidate}${extension}`);
        if (fileExists(fullPath)) return fullPath;
      }
    }
  }

  return '';
}

export function getAndroidSdkRoot() {
  const candidates = [
    process.env.ANDROID_SDK_ROOT,
    process.env.ANDROID_HOME,
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk') : '',
    process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Android', 'Sdk') : '',
    path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
    path.join(os.homedir(), 'Android', 'Sdk')
  ].filter(Boolean);

  return candidates.find((candidate) => fileExists(candidate)) || '';
}

export function getAdbPath() {
  const sdkRoot = getAndroidSdkRoot();
  const fromSdk = sdkRoot
    ? path.join(sdkRoot, 'platform-tools', isWindows ? 'adb.exe' : 'adb')
    : '';
  const adbPath = resolveExecutable([fromSdk, 'adb']);

  if (!adbPath) {
    throw new Error('Android adb was not found. Install Android SDK Platform Tools and set ANDROID_SDK_ROOT or ANDROID_HOME.');
  }

  return adbPath;
}

export function getEmulatorPath() {
  const sdkRoot = getAndroidSdkRoot();
  const fromSdk = sdkRoot
    ? path.join(sdkRoot, 'emulator', isWindows ? 'emulator.exe' : 'emulator')
    : '';
  const emulatorPath = resolveExecutable([fromSdk, 'emulator']);

  if (!emulatorPath) {
    throw new Error('Android emulator was not found. Install Android Studio/SDK and set ANDROID_SDK_ROOT or ANDROID_HOME.');
  }

  return emulatorPath;
}

export async function getUsbDeviceIds() {
  const adbPath = getAdbPath();
  const { stdout } = await runCommand(adbPath, ['devices'], { capture: true });
  const lines = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1);

  return lines
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts[1] === 'device' && !parts[0].startsWith('emulator-'))
    .map((parts) => parts[0]);
}

export async function getRunningEmulatorIds() {
  const adbPath = getAdbPath();
  const { stdout } = await runCommand(adbPath, ['devices'], { capture: true });
  const lines = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1);

  return lines
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts[1] === 'device' && parts[0].startsWith('emulator-'))
    .map((parts) => parts[0]);
}

export async function getAvdNames() {
  const emulatorPath = getEmulatorPath();
  const { stdout } = await runCommand(emulatorPath, ['-list-avds'], { capture: true });
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function waitForPort(host, port, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const reachable = await new Promise((resolve) => {
      const socket = net.createConnection({ host, port });
      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('error', () => {
        socket.destroy();
        resolve(false);
      });
      socket.setTimeout(1000, () => {
        socket.destroy();
        resolve(false);
      });
    });

    if (reachable) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
}

export async function findFreePort(preferredPort) {
  const tryPort = (port) =>
    new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close(() => resolve(true));
      });
      server.listen(port, '0.0.0.0');
    });

  for (let offset = 0; offset < 20; offset += 1) {
    const port = preferredPort + offset;
    if (await tryPort(port)) return port;
  }

  throw new Error(`Unable to find an open port near ${preferredPort}.`);
}

export function viteBinPath() {
  const localPath = resolveFromMobile('node_modules', 'vite', 'bin', 'vite.js');
  if (fileExists(localPath)) return localPath;
  return resolveFromRepo('node_modules', 'vite', 'bin', 'vite.js');
}

export function capacitorBinPath() {
  const localPath = resolveFromMobile('node_modules', '@capacitor', 'cli', 'bin', 'capacitor');
  if (fileExists(localPath)) return localPath;
  return resolveFromRepo('node_modules', '@capacitor', 'cli', 'bin', 'capacitor');
}

export function nodeExecutable() {
  return process.execPath;
}

export function getGradleCommand(task) {
  const wrapperJar = path.join(androidDir, 'gradle', 'wrapper', 'gradle-wrapper.jar');
  const javaFromHome = process.env.JAVA_HOME
    ? path.join(process.env.JAVA_HOME, 'bin', isWindows ? 'java.exe' : 'java')
    : '';
  const javaExecutable = resolveExecutable([javaFromHome, 'java']);

  if (!javaExecutable) {
    throw new Error('Java was not found. Install a JDK and set JAVA_HOME before building Android APKs.');
  }

  return {
    command: javaExecutable,
    args: [
      '-Dorg.gradle.appname=gradlew',
      '-classpath',
      wrapperJar,
      'org.gradle.wrapper.GradleWrapperMain',
      task
    ],
    cwd: androidDir
  };
}

export function getApkPath(buildType = 'debug') {
  const apkDir = path.join(androidDir, 'app', 'build', 'outputs', 'apk', buildType);
  const candidates = fs
    .readdirSync(apkDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.apk'))
    .map((entry) => path.join(apkDir, entry.name));

  if (candidates.length === 0) {
    throw new Error(`No ${buildType} APK was found in ${apkDir}`);
  }

  return candidates[0];
}

export function getDebugApkPath() {
  return getApkPath('debug');
}

export function copyFile(sourcePath, destinationPath) {
  ensureDir(path.dirname(destinationPath));
  fs.copyFileSync(sourcePath, destinationPath);
}

export function stripNativePurchasesAndroidPlugin() {
  const settingsGradlePath = path.join(androidDir, 'capacitor.settings.gradle');
  const capacitorBuildGradlePath = path.join(androidDir, 'app', 'capacitor.build.gradle');
  const capacitorPluginsJsonPath = path.join(androidDir, 'app', 'src', 'main', 'assets', 'capacitor.plugins.json');

  if (fileExists(settingsGradlePath)) {
    const original = fs.readFileSync(settingsGradlePath, 'utf8');
    const updated = original
      .replace(/\r?\ninclude ':capgo-native-purchases'\r?\nproject\(':capgo-native-purchases'\)\.projectDir = new File\('\.\.\/\.\.\/node_modules\/@capgo\/native-purchases\/android'\)\r?\n?/g, '\n')
      .replace(/\r?\n{3,}/g, '\n\n');
    fs.writeFileSync(settingsGradlePath, updated, 'utf8');
  }

  if (fileExists(capacitorBuildGradlePath)) {
    const original = fs.readFileSync(capacitorBuildGradlePath, 'utf8');
    const updated = original
      .replace(/\s*implementation project\(':capgo-native-purchases'\)\r?\n/g, '\n')
      .replace(/\r?\n{3,}/g, '\n\n');
    fs.writeFileSync(capacitorBuildGradlePath, updated, 'utf8');
  }

  if (fileExists(capacitorPluginsJsonPath)) {
    const original = JSON.parse(fs.readFileSync(capacitorPluginsJsonPath, 'utf8'));
    const filtered = original.filter((plugin) => plugin.pkg !== '@capgo/native-purchases');
    fs.writeFileSync(capacitorPluginsJsonPath, `${JSON.stringify(filtered, null, '\t')}\n`, 'utf8');
  }
}

export async function ensureReleaseServer(directoryToServe, preferredPort = apkSharePort) {
  const port = await findFreePort(preferredPort);
  const pidFile = path.join(directoryToServe, '.share-server.pid');
  const child = spawn(
    nodeExecutable(),
    [path.join(__dirname, 'serve-static.mjs'), directoryToServe, String(port)],
    {
      cwd: mobileDir,
      detached: true,
      stdio: 'ignore'
    }
  );

  child.unref();
  fs.writeFileSync(pidFile, `${child.pid}\n`, 'utf8');

  const ready = await waitForPort('127.0.0.1', port, 10000);
  if (!ready) {
    throw new Error(`Release file server did not start on port ${port}.`);
  }

  return { port, pid: child.pid, pidFile };
}

export function createStaticFileServer(rootDirectory, port) {
  const server = http.createServer((request, response) => {
    const urlPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const sanitized = urlPath.replace(/^\/+/, '');
    const resolvedPath = path.resolve(rootDirectory, sanitized);
    const normalizedRoot = path.resolve(rootDirectory);

    if (!resolvedPath.startsWith(normalizedRoot)) {
      response.writeHead(403);
      response.end('Forbidden');
      return;
    }

    let filePath = resolvedPath;
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      response.writeHead(404);
      response.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    const contentTypes = {
      '.apk': 'application/vnd.android.package-archive',
      '.html': 'text/html; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.txt': 'text/plain; charset=utf-8'
    };

    const headers = {
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    };

    if (ext === '.apk') {
      headers['Content-Disposition'] = `attachment; filename="${fileName}"`;
    }

    response.writeHead(200, headers);

    fs.createReadStream(filePath).pipe(response);
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '0.0.0.0', () => resolve(server));
  });
}

export function printHelp(scriptName, description) {
  console.log(description);
  console.log(`Usage: node ${scriptName} [options]`);
}
