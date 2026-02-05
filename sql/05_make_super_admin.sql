-- =====================================================
-- STEP 5: RUN THIS AFTER CREATING A USER
-- =====================================================
-- 
-- FIRST: Create a user in Supabase Dashboard
-- 1. Go to Authentication > Users
-- 2. Click "Add user" > "Create new user"  
-- 3. Enter email and password
-- 4. Copy the user UUID from the table
-- 5. Replace 'YOUR_USER_ID' below with the actual UUID
-- 6. Run this SQL
--
-- =====================================================

-- Replace this with your actual user ID!
-- Example: '12345678-1234-1234-1234-123456789012'

UPDATE profiles 
SET role = 'super_admin',
    full_name = 'Admin User',
    branch_id = NULL
WHERE id = 'YOUR_USER_ID';

-- Verify it worked
SELECT id, role, full_name, branch_id FROM profiles;

-- =====================================================
-- DONE! You can now login at http://localhost:3000/login
-- =====================================================
