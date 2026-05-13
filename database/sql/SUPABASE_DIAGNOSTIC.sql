-- ========================================
-- DIAGNOSTIC: Show All Tables and Views
-- ========================================
-- 
-- Run this to see what tables and views exist
-- TABLES can have RLS enabled
-- VIEWS cannot have RLS (skip them)
--

-- Show all database objects with their type
SELECT 
  table_name,
  table_type,
  CASE 
    WHEN table_type = 'BASE TABLE' THEN '✅ RLS supported'
    WHEN table_type = 'VIEW' THEN '❌ Skip (view)'
    WHEN table_type = 'MATERIALIZED VIEW' THEN '❌ Skip (materialized view)'
    ELSE '❓ Unknown'
  END as rls_support
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_type, table_name;

-- This shows:
-- table_type = 'BASE TABLE' → Can have RLS
-- table_type = 'VIEW' → Cannot have RLS (read-only)
-- table_type = 'MATERIALIZED VIEW' → Cannot have RLS
--
-- If you see "Cannot be performed on views", 
-- that means you tried to enable RLS on a VIEW
-- Views are read-only, so RLS isn't needed

