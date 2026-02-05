-- =====================================================
-- CREATE SUPER ADMIN USER
-- =====================================================
-- Run this AFTER creating a user in Supabase Auth
-- 
-- Steps:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Enter email and password
-- 4. Copy the user's ID (UUID)
-- 5. Replace 'YOUR_USER_ID_HERE' below with the actual UUID
-- 6. Run this SQL in Supabase SQL Editor
-- =====================================================

-- Option 1: Update existing profile to super_admin
UPDATE profiles 
SET role = 'super_admin', 
    full_name = 'Admin User'
WHERE id = 'YOUR_USER_ID_HERE';

-- Option 2: If profile doesn't exist, insert it
-- INSERT INTO profiles (id, role, full_name, branch_id)
-- VALUES (
--     'YOUR_USER_ID_HERE',
--     'super_admin',
--     'Admin User',
--     NULL  -- super_admin doesn't need a branch
-- ) ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- =====================================================
-- VERIFY SETUP
-- =====================================================
-- Check your user profile:
-- SELECT * FROM profiles WHERE id = 'YOUR_USER_ID_HERE';

-- Check all profiles:
-- SELECT p.*, b.name as branch_name 
-- FROM profiles p 
-- LEFT JOIN branches b ON p.branch_id = b.id;
