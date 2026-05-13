# Database Configuration & Scripts

This directory contains all database configuration, migrations, schemas, scripts, and utilities for the Prompt Quill project.

## 📁 Directory Structure

```
database/
├── .env                 # Database configuration (Supabase credentials)
├── migrations/          # SQL migration files for schema setup
│   ├── migration.sql
│   ├── admin-tables-fix.sql
│   ├── data-isolation-fix.sql
│   ├── prompt-quill-migration.sql
│   └── example_migration.sql
├── schemas/            # SQL schema definitions
│   └── users_table.sql
├── seeds/              # Seed data for testing
│   └── seed_data.sql
├── scripts/            # Development and maintenance scripts
│   ├── *.cjs          # CommonJS fix scripts
│   ├── *.js           # JavaScript utilities and tests
│   └── *.json         # Test results and data fixtures
└── README.md          # This file
```

## 🔐 Environment Configuration

### `.env` File

The `.env` file contains all database credentials and API keys needed for the application:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Provider Keys
VITE_OPENROUTER_API_KEY_1=your-openrouter-key
VITE_GROQ_API_KEY_1=your-groq-key
VITE_GEMINI_API_KEY_1=your-gemini-key
```

### Supabase Configuration

#### Getting Your Keys

**From Supabase Dashboard:**
1. Go to Project Settings → API
2. Copy `Project URL` → Use as `VITE_SUPABASE_URL`
3. Copy `anon public` key → Use as `VITE_SUPABASE_ANON_KEY`

#### Staging vs Production

Create separate environment files:
```
database/.env               # Local development
database/.env.staging      # Staging environment
database/.env.production   # Production environment
```

### Security Best Practices

#### ✅ DO:
- Keep `/database/.env` secure and never commit
- Use different keys for dev/staging/production
- Rotate keys periodically
- Reference environment variables via `process.env.VITE_*`
- Add `.env*` to `.gitignore`

#### ❌ DON'T:
- Commit `.env` files to Git
- Share keys in messages/emails
- Use production keys in development
- Hardcode keys in source code
- Push credentials to remote repositories

---

## 🗄️ Database Schema & Migrations

## 🔄 Migration Files

### 1. migration.sql
**Initial database setup**
- User profiles table
- Sessions/prompts table
- Community features
- Authentication setup

Run first during initial setup.

### 2. admin-tables-fix.sql
**Admin functionality corrections**
- Admin profile fields
- Permissions structure
- Admin-specific tables

Apply after initial migration.

### 3. data-isolation-fix.sql
**Row-Level Security (RLS) policies**
- User data isolation
- Admin access rules
- Public session visibility
- Privacy controls

Critical for production security. Apply before launch.

### 4. prompt-quill-migration.sql
**Prompt Quill specific schema**
- AI generation related tables
- Prompt storage and versioning
- Export history

Apply as needed for new features.

## 🚀 How to Apply Migrations

### Option A: Supabase Console
1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Paste the entire SQL file content
4. Run the query

### Option B: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

### Option C: Direct Connection
Use your favorite SQL client to connect to your Supabase database and run the scripts.

## 🔐 Security - Row Level Security (RLS)

The `data-isolation-fix.sql` file implements RLS policies:

- **Users can only see their own profile**
- **Users can only access their own sessions**
- **Admin users have elevated permissions**
- **Public sessions are visible to all**
- **Admin tables only accessible to admin role**

Ensure RLS is enabled on all tables:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

## ✅ Verification

After applying migrations, verify:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 📝 Common Tables

### profiles
- user_id (UUID, PK)
- email
- full_name
- role (user, admin, pro)
- credits_balance
- created_at

### sessions
- id (UUID, PK)
- user_id (FK to profiles)
- content
- is_public
- created_at
- updated_at

### admin_announcements
- id (UUID, PK)
- title
- message
- type (info, warning)
- created_by (admin user_id)
- created_at

### promo_codes
- id (UUID, PK)
- code
- discount_percentage
- created_by (admin)
- created_at

## 🔄 Running Migrations Safely

1. **Backup first**: Always backup production data before migrations
2. **Test on staging**: Apply migrations to test database first
3. **Review changes**: Read through SQL carefully before executing
4. **Monitor performance**: Watch database metrics during large migrations
5. **Rollback strategy**: Keep backups available for rollback

## ⚠️ Important Notes

- Migrations are cumulative - run in order
- Do NOT modify or delete migration files after applying
- Keep original SQL files as documentation
- Comment changes when updating existing migrations

## 🆘 Troubleshooting

**Foreign key constraint error:**
- Check referenced tables exist
- Verify column types match

**Permission denied error:**
- Ensure you're authenticated as Supabase admin
- Check your database role permissions

**RLS policy errors:**
- Verify `auth.uid()` function is available
- Check Supabase Auth is properly configured

---

## 🚀 Scripts & Utilities

All development, maintenance, and testing scripts are located in `scripts/`.

### ⚠️ Important

**These are development/maintenance utilities.** Review script content before running in any environment, especially production.

### Fix Scripts (.cjs)

#### `fix-emojis2.cjs`
Corrects emoji encoding issues in the database.
```bash
node database/scripts/fix-emojis2.cjs
```

#### `fix3.cjs`, `fix4.cjs`, `fix6.cjs`
Various data correction utilities. Review before running.
```bash
node database/scripts/fix3.cjs
node database/scripts/fix4.cjs
node database/scripts/fix6.cjs
```

#### `add-cheers.cjs`
Adds celebration animations or features.
```bash
node database/scripts/add-cheers.cjs
```

#### `run-rls-fix.cjs` / `run-rls-fix.js`
Corrects Row-Level Security (RLS) policies in Supabase.
```bash
node database/scripts/run-rls-fix.js
```

### Test Scripts (.js)

#### `test-admin-queries.js`
Tests admin panel queries and functionality.
```bash
node database/scripts/test-admin-queries.js
```

#### `test-ai.js` / `test_ai.js`
Tests AI integration and LLM provider failover.
```bash
node database/scripts/test-ai.js
```

#### `test_credits.js`
Validates credit system functionality.
```bash
node database/scripts/test_credits.js
```

### Test Results

- **`admin_data_setup_results.json`** - Admin table setup operation results
- **`db_test_results.json`** - Database connectivity and query test results
- **`final_admin_check.json`** - Final validation checks for admin functionality
- **`profiles_dump.json`** - Snapshot of user profiles (fixture data)
- **`test_results.txt`** - Combined test output log

---

## 📊 Common Workflows

### 1. Verify Database Setup
```bash
node database/scripts/test-admin-queries.js
# Check output for RLS fix results
```

### 2. Test AI Provider Failover
```bash
node database/scripts/test-ai.js
# Verifies Groq → Gemini → OpenRouter cascade
```

### 3. Validate Credits System
```bash
node database/scripts/test_credits.js
# Tests credit tracking and deduction
```

### 4. Fix RLS Policies
```bash
node database/scripts/run-rls-fix.js
# Corrects Row-Level Security on tables
```

### 5. Repair Data Issues
```bash
node database/scripts/fix-emojis2.cjs   # Fix emoji encoding
node database/scripts/fix3.cjs          # General data fixes
node database/scripts/fix4.cjs          # Additional corrections
```

---

## 🔍 Before Running Any Script

1. **Read the script** - Check what it does:
   ```bash
   cat database/scripts/script-name.js
   ```

2. **Backup database** - Always backup before data modifications:
   ```
   In Supabase, export all tables first
   ```

3. **Understand prerequisites** - Check for required API keys/connections

4. **Test on staging** - Never run unknown scripts on production first

5. **Monitor output** - Watch console for errors and warnings

---

## 📝 Script Template

If creating a new script:

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

---

## ⚡ Development Tips

### View Script Output
```bash
# Run and save output
node database/scripts/script.js > output.log

# Run with timing
time node database/scripts/script.js

# Run with debug info
DEBUG=* node database/scripts/script.js
```

### Monitor Progress
```bash
# Run in background with log
node database/scripts/script.js &> script.log &

# Check status
tail -f script.log
```

---

## 🆘 Troubleshooting

**Script fails with "Cannot find module"**
```bash
# Ensure dependencies are installed
npm install
```

**Authentication errors**
- Verify environment variables are set correctly in `database/.env`
- Check Supabase credentials are valid
- Confirm API keys haven't expired

**Database connection errors**
- Test connection with `test-admin-queries.js`
- Check Supabase project is running
- Verify RLS policies aren't blocking access

**Timeout errors**
- API providers might be slow
- Increase timeout values in script
- Check network connectivity

---

## 📚 Related Documentation

- Frontend setup: See `frontend/README.md`
- Backend setup: See `backend/README.md`
- Main documentation: See root `README.md`
- Getting started guide: See `docs/getting-started.md`

---

**Last Updated:** April 6, 2026
**Database Provider:** Supabase (PostgreSQL 13+)
