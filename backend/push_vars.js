import fs from 'fs';
import { execSync } from 'child_process';

const envContent = fs.readFileSync('.env', 'utf-8');
const lines = envContent.split('\n');

const variables = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  
  const separatorIdx = trimmed.indexOf('=');
  if (separatorIdx === -1) continue;
  
  const key = trimmed.substring(0, separatorIdx).trim();
  let val = trimmed.substring(separatorIdx + 1).trim();
  
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.slice(1, -1);
  }
  
  if (!val) continue; // Skip empty keys
  
  // Need to escape quotes inside value for Windows CMD/Powershell
  const escapedVal = val.replace(/"/g, '\\"');
  variables.push(`${key}="${escapedVal}"`);
}

if (variables.length === 0) {
  console.log("No variables found.");
  process.exit(0);
}

console.log(`Found ${variables.length} valid variables in .env`);

// Use larger batches but not too large for Windows command line limits
for (let i = 0; i < variables.length; i += 5) {
  const batch = variables.slice(i, i + 5);
  const cmd = `railway variable set --skip-deploys ${batch.join(' ')}`;
  console.log(`Setting batch ${Math.floor(i/5) + 1}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error("❌ Error setting variables:", err.message);
  }
}

console.log("\n✅ All variables injected! Restarting Railway service...");
try {
  execSync("railway up", { stdio: 'inherit' });
} catch (err) {
  console.error("Railway deployment failed:", err.message);
}
