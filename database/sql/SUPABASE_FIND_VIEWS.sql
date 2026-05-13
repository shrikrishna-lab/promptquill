-- ========================================
-- Find Tables vs Views (for RLS Setup)
-- ========================================
-- 
-- Run this to see which objects are TABLES (can have RLS)
-- and which are VIEWS (cannot have RLS)
--

SELECT 
  table_name,
  table_type,
  CASE 
    WHEN table_type = 'BASE TABLE' THEN '✅ Can enable RLS'
    WHEN table_type = 'VIEW' THEN '❌ View - skip RLS'
    ELSE 'Other'
  END as rls_support
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_type, table_name;

-- Results:
-- table_type = 'BASE TABLE' → These can have RLS enabled
-- table_type = 'VIEW' → These CANNOT have RLS (skip them)
-- table_type = 'MATERIALIZED VIEW' → These CANNOT have RLS either
