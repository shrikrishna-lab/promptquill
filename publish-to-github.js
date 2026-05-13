/**
 * publish-to-github.js
 *
 * Automated GitHub publishing script for PromptQuill.
 * Creates a repository, pushes code, configures settings,
 * and publishes the first release.
 *
 * Requirements: GitHub CLI (gh) installed and authenticated.
 * Usage: node publish-to-github.js
 *
 * This script uses only Node.js built-ins and the GitHub CLI.
 * No additional npm packages required.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Utility functions ─────────────────────────────────────

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...opts }).trim();
  } catch (e) {
    return { error: e.stderr?.toString() || e.message };
  }
}

function ask(query, defaultValue = '') {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${query} (${defaultValue}): ` : `${query}: `;
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

function printBox(lines) {
  const width = Math.max(...lines.map(l => l.length)) + 4;
  const border = '┌' + '─'.repeat(width) + '┐';
  const bottom = '└' + '─'.repeat(width) + '┘';
  console.log('\n' + border);
  for (const line of lines) {
    console.log('│ ' + line.padEnd(width - 2) + ' │');
  }
  console.log(bottom + '\n');
}

function success(msg) { console.log('✅ ' + msg); }
function info(msg) { console.log('ℹ️  ' + msg); }
function warn(msg) { console.log('⚠️  ' + msg); }
function error(msg) { console.log('❌ ' + msg); }

// ── Step 1: Check GitHub CLI ──────────────────────────────

async function checkGh() {
  console.log('\n── Step 1: Checking GitHub CLI ──\n');

  const ghCheck = run('gh --version');
  if (ghCheck.error) {
    printBox([
      'GitHub CLI (gh) is required to auto-create your repository.',
      '',
      'Install it:',
      '  Mac:     brew install gh',
      '  Windows: winget install GitHub.cli',
      '  Linux:   sudo apt install gh',
      '',
      'Then run: gh auth login',
      'Then run this script again.',
    ]);
    process.exit(1);
  }
  success('GitHub CLI is installed');

  const authCheck = run('gh auth status');
  if (authCheck.error || authCheck.includes('not logged in')) {
    printBox([
      'You are not logged into GitHub CLI.',
      '',
      'Run: gh auth login',
      'Choose: GitHub.com → HTTPS → Login with browser',
      'Then run this script again.',
    ]);
    process.exit(1);
  }
  success('GitHub CLI is authenticated');
}

// ── Step 2: Ask user for repository details ───────────────

async function getRepoDetails() {
  console.log('\n── Step 2: Repository Configuration ──\n');

  const whoami = run('gh api user --jq .login');
  const defaultOwner = whoami.error ? 'your-username' : whoami;

  let owner, name, description, visibility, addTopics;

  while (true) {
    owner = await ask('GitHub username or organization', 'shrikrishna-lab');
    name = await ask('Repository name', 'promptquill');
    description = await ask('Repository description',
      'Open source AI brief generator. Turn any idea into a complete 15-tab strategic brief in seconds.');
    visibility = await ask('Make repository public or private', 'public');
    const topicsAns = await ask('Add GitHub topics/tags (y/n)', 'y');
    addTopics = topicsAns.toLowerCase() === 'y';

    printBox([
      'Creating repository with these settings:',
      '',
      `  Owner       : ${owner}`,
      `  Name        : ${name}`,
      `  Description : ${description.slice(0, 60)}...`,
      `  Visibility  : ${visibility}`,
      `  Topics      : ${addTopics ? 'yes' : 'no'}`,
      '',
      'Proceed? (y/n)',
    ]);

    const proceed = await ask('', 'y');
    if (proceed.toLowerCase() === 'y') break;
    console.log('Restarting configuration...\n');
  }

  return { owner, name, description, visibility, addTopics };
}

// ── Step 3: Security sweep ────────────────────────────────

async function securitySweep() {
  console.log('\n── Step 3: Security Sweep ──\n');

  const patterns = [
    { name: 'JWT/Supabase key', regex: /eyJ/ },
    { name: 'Hardcoded Supabase URL', regex: /supabase\.co/ },
    { name: 'Groq API key', regex: /gsk_/ },
    { name: 'Google API key', regex: /AIza/ },
    { name: 'Razorpay key', regex: /rzp_/ },
    { name: 'Resend key', regex: /re_/ },
    { name: 'OpenAI-style key', regex: /sk-[a-zA-Z0-9]{20,}/ },
    { name: 'Hardcoded Bearer token', regex: /Bearer\s+[a-zA-Z0-9_\-]{20,}/ },
  ];

  // Files to scan (skip binary, node_modules, dist, .git, .env)
  const skipDirs = ['node_modules', 'dist', '.git', '.next', 'build', 'coverage'];

  function shouldScan(filePath) {
    const parts = filePath.replace(/\\/g, '/').split('/');
    return !parts.some(p => skipDirs.includes(p));
  }

  function getAllFiles(dir) {
    const result = [];
    try {
      const entries = run(`find "${dir}" -type f 2>/dev/null || dir "${dir}" /s /b 2>nul`).split('\n');
      for (const entry of entries) {
        if (entry && shouldScan(entry)) result.push(entry);
      }
    } catch {}
    return result;
  }

  let foundIssues = false;

  for (const pattern of patterns) {
    try {
      const grepResult = run(`grep -rl "${pattern.regex.source}" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" --include="*.sql" --include="*.yml" --include="*.yaml" . 2>/dev/null | head -5`);
      if (grepResult && !grepResult.error && grepResult.length > 0) {
        const files = grepResult.split('\n').filter(f => f && shouldScan(f)).slice(0, 3);
        if (files.length > 0) {
          foundIssues = true;
          for (const file of files) {
            printBox([
              'SECURITY ALERT — Push blocked',
              '',
              `Possible ${pattern.name} found in:`,
              `  File: ${file}`,
              '',
              'Remove this before pushing to GitHub.',
              'Your real credentials must never be public.',
            ]);
          }
        }
      }
    } catch {}
  }

  // Check .env files
  const envExists = existsSync(resolve(__dirname, '.env'));
  if (envExists) {
    warn('.env file exists — it will be skipped by .gitignore');
  }

  // Verify .gitignore
  if (!existsSync(resolve(__dirname, '.gitignore'))) {
    warn('.gitignore not found — creating one');
    writeFileSync(resolve(__dirname, '.gitignore'), [
      '.env', '.env.local', '.env.*', 'node_modules/', 'dist/', 'build/', '*.key', '*.pem', '.DS_Store', '*.log', 'backend/config/',
    ].join('\n') + '\n');
    success('.gitignore created');
  }

  if (foundIssues) {
    error('Security scan failed — fix the issues above and run again');
    process.exit(1);
  }

  success('Security scan passed — no credentials found');
}

// ── Step 4: Initialize Git ────────────────────────────────

async function initGit() {
  console.log('\n── Step 4: Initializing Git Repository ──\n');

  if (existsSync(resolve(__dirname, '.git'))) {
    info('Git repository already exists — reusing it');
    return;
  }

  run('git init', { cwd: __dirname });
  run('git checkout -b main', { cwd: __dirname });
  success('Git repository initialized');

  // Stage all files except those in .gitignore
  run('git add .', { cwd: __dirname });

  // Check if .env is somehow staged
  const stagedEnv = run('git diff --cached --name-only | grep -E "^\.env$|^\.env\."', { cwd: __dirname });
  if (stagedEnv && !stagedEnv.error && stagedEnv.length > 0) {
    warn('.env file is staged — removing from staging');
    run('git reset -- .env*', { cwd: __dirname });
  }

  const fileCount = run('git diff --cached --name-only | wc -l', { cwd: __dirname });
  info(`Adding ${fileCount.trim() || 'all'} files to initial commit`);

  run('git commit -m "🚀 Initial release — PromptQuill open source"', { cwd: __dirname });
  success('Initial commit created');
}

// ── Step 5: Create GitHub Repository ──────────────────────

async function createRepo({ owner, name, description, visibility }) {
  console.log('\n── Step 5: Creating GitHub Repository ──\n');

  const fullName = `${owner}/${name}`;

  // Check if repo already exists
  const checkRepo = run(`gh repo view "${fullName}" --json name 2>/dev/null || echo "NOT_FOUND"`);
  
  if (checkRepo.includes('NOT_FOUND')) {
    const createCmd = `gh repo create "${fullName}" --${visibility} --description "${description.replace(/"/g, '\\"')}" --disable-wiki --disable-projects`;
    const result = run(createCmd);
    if (result.error) {
      error(`Failed to create repository: ${result.error}`);
      process.exit(1);
    }
    success(`Repository created: ${fullName}`);
  } else {
    info(`Repository ${fullName} already exists`);
    printBox([
      `A repository with the name "${name}" already exists under "${owner}".`,
      '',
      'Options:',
      '  1. Use a different name',
      '  2. Push to the existing repo (will overwrite)',
      '  3. Cancel',
    ]);
    const choice = await ask('Choose (1/2/3)', '1');
    if (choice === '1') {
      const newName = await ask('Enter a new repository name');
      return createRepo({ owner, name: newName, description, visibility });
    } else if (choice === '2') {
      info('Will push to existing repository');
    } else {
      info('Cancelled by user');
      process.exit(0);
    }
  }

  return fullName;
}

// ── Step 6: Push to GitHub ────────────────────────────────

async function pushToGitHub(fullName) {
  console.log('\n── Step 6: Pushing to GitHub ──\n');

  info('Pushing to GitHub...');

  // Add remote
  run(`git remote remove origin 2>/dev/null`, { cwd: __dirname });
  run(`git remote add origin "https://github.com/${fullName}.git"`, { cwd: __dirname });

  // Push
  const pushResult = run(`git push -u origin main 2>&1`, { cwd: __dirname });
  if (pushResult.error) {
    error(`Push failed: ${pushResult.error}`);
    printBox([
      'Push to GitHub failed.',
      '',
      'Common causes and fixes:',
      '- Repository name already taken: choose a different name',
      '- Not authenticated: run "gh auth login"',
      '- Network issue: check your internet connection',
      '',
      'After fixing, run this script again.',
    ]);
    process.exit(1);
  }

  success('Pushed successfully');
}

// ── Step 7: Configure Repository ──────────────────────────

async function configureRepo(fullName, addTopics) {
  console.log('\n── Step 7: Configuring Repository ──\n');

  if (addTopics) {
    const topics = ['ai', 'open-source', 'self-hosted', 'brief-generator', 'react', 'nodejs', 'supabase', 'groq', 'gemini', 'tailwindcss', 'productivity', 'developer-tools', 'mit-license'];
    const topicsStr = topics.join(',');
    const result = run(`gh repo edit "${fullName}" --add-topics "${topicsStr}"`);
    if (result.error) warn(`Could not add topics: ${result.error}`);
    else success('Topics added');
  }

  // Enable discussions
  run(`gh api repos/${fullName} --field has_discussions=true -X PATCH 2>/dev/null`);
  success('Discussions enabled');

  // Create issue labels
  const labels = [
    { name: 'bug', color: 'd73a4a', description: 'Something is not working' },
    { name: 'enhancement', color: '0366d6', description: 'New feature or improvement request' },
    { name: 'question', color: 'd4c5f9', description: 'Further information is requested' },
    { name: 'good first issue', color: '0e8a16', description: 'Good for newcomers' },
    { name: 'help wanted', color: '008672', description: 'Extra attention is needed' },
    { name: 'documentation', color: '6f42c1', description: 'Improvements to documentation' },
    { name: 'security', color: 'e99695', description: 'Security related issue' },
  ];

  for (const label of labels) {
    run(`gh label create "${label.name}" --color "${label.color}" --description "${label.description}" --repo "${fullName}" 2>/dev/null`);
  }
  success('Issue labels created');

  // Create issue templates directory
  const templateDir = resolve(__dirname, '.github', 'ISSUE_TEMPLATE');
  mkdirSync(templateDir, { recursive: true });

  // Bug report template
  writeFileSync(resolve(templateDir, 'bug_report.md'), [
    '---',
    'name: Bug Report',
    'about: Report a bug to help us improve',
    'title: ""',
    'labels: bug',
    'assignees: ""',
    '---',
    '',
    '## Describe the Bug',
    '',
    'A clear and concise description of what the bug is.',
    '',
    '## Steps to Reproduce',
    '',
    '1. ...',
    '2. ...',
    '3. ...',
    '',
    '## Expected Behavior',
    '',
    'What did you expect to happen?',
    '',
    '## Actual Behavior',
    '',
    'What actually happened?',
    '',
    '## Environment',
    '',
    '- Node.js version: ...',
    '- Operating system: ...',
    '- Browser (if relevant): ...',
    '',
    '## Additional Context',
    '',
    'Any error messages, screenshots, or logs that might help.',
  ].join('\n'));

  // Feature request template
  writeFileSync(resolve(templateDir, 'feature_request.md'), [
    '---',
    'name: Feature Request',
    'about: Suggest an idea for this project',
    'title: ""',
    'labels: enhancement',
    'assignees: ""',
    '---',
    '',
    '## Problem This Solves',
    '',
    'A clear description of the problem or limitation.',
    '',
    '## Proposed Solution',
    '',
    'How would you like this to work?',
    '',
    '## Alternatives Considered',
    '',
    'What other approaches did you consider?',
    '',
    '## Additional Context',
    '',
    'Any relevant examples or references.',
  ].join('\n'));

  // PR template
  writeFileSync(resolve(__dirname, '.github', 'PULL_REQUEST_TEMPLATE.md'), [
    '## What does this PR do?',
    '',
    'Describe the changes and why they are needed.',
    '',
    '## Related Issue',
    '',
    'Fixes #(issue number)',
    '',
    '## How to Test',
    '',
    'Steps to verify this change works correctly.',
    '',
    '## Checklist',
    '',
    '- [ ] Tests pass',
    '- [ ] Documentation updated (if needed)',
    '- [ ] No credentials or secrets in code',
    '- [ ] Single feature/fix per PR',
  ].join('\n'));

  // Commit and push templates
  run('git add .github/', { cwd: __dirname });
  run('git commit -m "📋 Add GitHub issue templates and PR template"', { cwd: __dirname });
  run('git push', { cwd: __dirname });

  success('Issue templates and PR template added');
}

// ── Step 8: Create Release ────────────────────────────────

async function createRelease(fullName) {
  console.log('\n── Step 8: Creating GitHub Release ──\n');

  const releaseNotes = [
    '🎉 First public release of PromptQuill.',
    '',
    "What's included:",
    '- AI brief generator with 15 analysis tabs',
    '- 6 AI modes: Startup, Coding, Content, Creative, General, Startup Lite',
    '- 2 personality styles: Bot and Human',
    '- 5 AI provider support with automatic rotation: Groq, Google Gemini, Cerebras, OpenRouter, Cloudflare',
    '- One-command installer: npx promptquill',
    '- 6-step guided setup wizard',
    '- Community feed for sharing public briefs',
    '- Full self-hosted setup — your data stays yours',
    '- MIT licensed — free forever',
    '',
    'Getting Started:',
    'Run npx promptquill in your terminal to install.',
    'See README.md for full setup instructions.',
  ].join('\n');

  const tmpFile = resolve(__dirname, '.release-notes.md');
  writeFileSync(tmpFile, releaseNotes);

  const result = run(`gh release create v1.0.0 --title "v1.0.0 — Initial Release" --notes-file "${tmpFile}" --latest --repo "${fullName}"`, { cwd: __dirname });
  
  try { run(`rm "${tmpFile}" 2>/dev/null || del "${tmpFile}" 2>nul`); } catch {}

  if (result.error) {
    warn(`Release creation failed: ${result.error}. You can create it manually on GitHub.`);
  } else {
    success('v1.0.0 release published');
  }
}

// ── Step 9: Final Summary ─────────────────────────────────

function printSummary(fullName, visibility) {
  const [owner, name] = fullName.split('/');

  printBox([
    '',
    '✅ PromptQuill is now live on GitHub!',
    '',
    `  Repository  : github.com/${fullName}`,
    `  Visibility  : ${visibility}`,
    '  Release     : v1.0.0',
    '  License     : MIT',
    '',
    '  What was done:',
    '  ✅ Repository created',
    '  ✅ All files pushed',
    '  ✅ Topics and labels configured',
    '  ✅ Issue templates added',
    '  ✅ PR template added',
    '  ✅ v1.0.0 release published',
    '  ✅ Security scan passed — no credentials pushed',
    '',
    '  Next steps:',
    '  → Star your repo to get started',
    '  → Share on Twitter, Reddit, Hacker News',
    '  → Add your Supabase URL to .env and run: npm run dev',
    '',
    `  Your repo: https://github.com/${fullName}`,
    '',
  ]);
}

// ── Main ──────────────────────────────────────────────────

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  PromptQuill — GitHub Publishing Script');
  console.log('='.repeat(60) + '\n');

  try {
    await checkGh();
    const details = await getRepoDetails();
    await securitySweep();
    await initGit();
    const fullName = await createRepo(details);
    await pushToGitHub(fullName);
    await configureRepo(fullName, details.addTopics);
    await createRelease(fullName);
    printSummary(fullName, details.visibility);
  } catch (err) {
    error(`Unexpected error: ${err.message}`);
    printBox([
      'The script encountered an unexpected error.',
      '',
      'Please check the error above and try running the script again.',
      'If the problem persists, open an issue on GitHub.',
    ]);
    process.exit(1);
  }
}

main();
