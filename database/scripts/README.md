# Scripts and Utilities

This directory contains build scripts, maintenance utilities, testing tools, and data fixtures for Prompt Quill development and administration.

## ⚠️ Important

**These are development/maintenance utilities.** Review the script content before running in any environment, especially production.

## 📁 File Organization

```
database/scripts/
├── *.cjs                    # Common.js fix scripts
├── *.js                     # JavaScript utilities and tests
├── *.json                   # Test results and data fixtures
└── test_results.txt         # Test output log
```

## 📋 Scripts Overview

### Fix Scripts (.cjs)

#### `fix-emojis2.cjs`
Corrects emoji encoding issues in the database.
```bash
node fix-emojis2.cjs
```

#### `fix3.cjs`, `fix4.cjs`, `fix6.cjs`
Various data correction utilities. Review before running.
```bash
node fix3.cjs
node fix4.cjs
node fix6.cjs
```

#### `add-cheers.cjs`
Adds celebration animations or features.
```bash
node add-cheers.cjs
```

#### `run-rls-fix.cjs` / `run-rls-fix.js`
Corrects Row-Level Security (RLS) policies in Supabase.
```bash
# Using Node
node run-rls-fix.js

# Or if CJS version
node run-rls-fix.cjs
```

### Test Scripts (.js)

#### `test-admin-queries.js`
Tests admin panel queries and functionality.
```bash
node test-admin-queries.js
```

#### `test-ai.js` / `test_ai.js`
Tests AI integration and LLM provider failover.
```bash
node test-ai.js
```

#### `test_credits.js`
Validates credit system functionality.
```bash
node test_credits.js
```

## 📊 Test Results

### `admin_data_setup_results.json`
Results from admin table setup operations.

### `db_test_results.json`
Database connectivity and query test results.

### `final_admin_check.json`
Final validation checks for admin functionality.

### `profiles_dump.json`
Snapshot of user profiles (fixture data).

### `test_results.txt`
Combined test output log with timestamps.

## 🚀 Common Workflows

### 1. Verify Database Setup
```bash
node test-admin-queries.js
# Check output for run_rls_fix.cjs results
```

### 2. Test AI Provider Failover
```bash
node test-ai.js
# Verifies Groq → Gemini → OpenRouter cascade
```

### 3. Validate Credits System
```bash
node test_credits.js
# Tests credit tracking and deduction
```

### 4. Fix RLS Policies
```bash
node run-rls-fix.js
# Corrects Row-Level Security on tables
```

### 5. Repair Data Issues
```bash
node fix-emojis2.cjs   # Fix emoji encoding
node fix3.cjs          # General data fixes
node fix4.cjs          # Additional corrections
```

## 🔍 Before Running Any Script

1. **Read the script**: Check what it does
   ```bash
   cat script-name.js
   ```

2. **Backup database**: Always backup before data modifications
   ```sql
   -- In Supabase, export all tables first
   ```

3. **Understand prerequisites**: Check for required API keys/connections
4. **Test on staging**: Never run unknown scripts on production first
5. **Monitor output**: Watch console for errors

## 📝 Script Template

If you need to create a new script:

```javascript
// database/scripts/my-utility.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    // Your code here
    console.log('✅ Operation successful');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
```

## 🔧 Environment Setup for Scripts

Create a `.env` file in the scripts directory (or use ../.env - the Supabase config from database/):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
VITE_OPENROUTER_API_KEY_1=your-key
VITE_GROQ_API_KEY_1=your-key
```

Scripts can access via `process.env.VITE_SUPABASE_URL`.

## ⚡ Development Tips

### View Script Output
```bash
# Run and save output
node script.js > output.log

# Run with timing
time node script.js

# Run with debug info
DEBUG=* node script.js
```

### Monitor Progress
```bash
# Run in background with log
node script.js &> script.log &

# Check status
tail -f script.log
```

## 🆘 Troubleshooting

**Script fails with "Cannot find module"**
```bash
# Ensure dependencies are installed in project
cd frontend
npm install
```

**Authentication errors**
- Verify environment variables are set correctly
- Check Supabase credentials are valid
- Confirm API keys haven't expired

**Database errors**
- Test connection with test-admin-queries.js
- Check Supabase project is running
- Verify RLS policies aren't blocking access

**Timeout errors**
- API providers might be slow
- Increase timeout values in script
- Check network connectivity

## 📚 Related Documentation

- Frontend setup: See `frontend/README.md`
- Database schema & config: See `database/README.md`
- Main docs: See root `README.md`

---
**Last Updated:** April 6, 2026
**Safety Note:** Always backup before running maintenance scripts
