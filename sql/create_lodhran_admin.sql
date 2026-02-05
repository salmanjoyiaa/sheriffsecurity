-- =====================================================
-- CREATE LODHRAN BRANCH ADMIN USER
-- Run this AFTER the user signs up in Supabase Auth
-- =====================================================

-- INSTRUCTIONS:
-- 1. First, create the user via the Supabase Dashboard:
--    - Go to Authentication > Users
--    - Click "Add user"
--    - Email: your_branch_admin_email
--    - Password: your_secure_password
--    - Click "Create user"
-- 
-- 2. Then run this SQL to make them branch_admin for Lodhran

-- Update the profile for the new user
-- Replace USER_ID_HERE with the actual UUID from Supabase Auth
-- UPDATE profiles 
-- SET role = 'branch_admin', 
--     branch_id = '10000000-0000-0000-0000-000000000003'
-- WHERE id = 'USER_ID_HERE';

-- Alternative: If you know the email, find and update by auth.users join
UPDATE profiles 
SET role = 'branch_admin', 
    branch_id = '10000000-0000-0000-0000-000000000003'
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email = 'lodhran@sheriffsecurity.pk'
);

-- Verify the update
SELECT p.*, au.email 
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.branch_id = '10000000-0000-0000-0000-000000000003';
