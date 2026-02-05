-- =====================================================
-- COMPLETE LODHRAN BRANCH SETUP
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create Lodhran Branch if not exists
INSERT INTO branches (id, name, city, address, phone) VALUES
('10000000-0000-0000-0000-000000000003', 'Lodhran Branch', 'Lodhran', 
 'Main Bazaar Road, Near Clock Tower, Lodhran 59320', '03009876543')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone;

-- Step 2: Update the profile for lodhran@sheriffsecurity.pk user
-- This sets them as branch_admin for Lodhran branch
UPDATE profiles 
SET role = 'branch_admin', 
    branch_id = '10000000-0000-0000-0000-000000000003',
    full_name = 'Lodhran Branch Admin'
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email = 'lodhran@sheriffsecurity.pk'
);

-- Step 3: Add sample places for Lodhran
INSERT INTO places (id, branch_id, name, address, city, contact_person, contact_phone, guards_required, status) VALUES
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 
 'National Bank Lodhran', 'Main Market Road, Lodhran', 'Lodhran', 'Mr. Tariq Mehmood', '03021234567', 3, 'active'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 
 'District Hospital Lodhran', 'Hospital Road, Lodhran', 'Lodhran', 'Dr. Shahid Hassan', '03031234567', 5, 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  contact_person = EXCLUDED.contact_person,
  contact_phone = EXCLUDED.contact_phone,
  guards_required = EXCLUDED.guards_required,
  status = EXCLUDED.status;

-- Step 4: Add sample guards for Lodhran
INSERT INTO guards (id, branch_id, name, guard_code, cnic, phone, address, status) VALUES
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 
 'Riaz Ahmed', 'LDN-001', '36301-1234567-1', '03041111111', 'Village Karor, Lodhran', 'active'),
('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 
 'Bashir Khan', 'LDN-002', '36301-2234567-2', '03042222222', 'Mohalla Islamabad, Lodhran', 'active'),
('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 
 'Waqar Ali', 'LDN-003', '36301-3234567-3', '03043333333', 'Near Jama Masjid, Lodhran', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  guard_code = EXCLUDED.guard_code,
  cnic = EXCLUDED.cnic,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  status = EXCLUDED.status;

-- Step 5: Create sample assignments for Lodhran
INSERT INTO assignments (id, branch_id, guard_id, place_id, start_date, shift_type, status, notes) VALUES
('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 
 '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 
 CURRENT_DATE - INTERVAL '15 days', 'day', 'active', 'Main entrance duty'),
('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 
 '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', 
 CURRENT_DATE - INTERVAL '15 days', 'night', 'active', 'Night security'),
('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 
 '30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', 
 CURRENT_DATE - INTERVAL '10 days', 'both', 'active', 'Hospital main gate 24/7')
ON CONFLICT (id) DO UPDATE SET
  guard_id = EXCLUDED.guard_id,
  place_id = EXCLUDED.place_id,
  start_date = EXCLUDED.start_date,
  shift_type = EXCLUDED.shift_type,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;

-- Step 6: Add sample inventory items for Lodhran
INSERT INTO inventory_items (id, branch_id, name, category, tracking_type, total_quantity) VALUES
('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 
 'Walkie Talkie', 'Communication', 'serialised', 5),
('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 
 'Security Baton', 'Equipment', 'quantity', 10),
('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 
 'Flashlight', 'Equipment', 'serialised', 8)
ON CONFLICT (id) DO NOTHING;

-- Verify the setup
SELECT 'SETUP VERIFICATION' as section;
SELECT '==================' as divider;

SELECT 'User Profile:' as item;
SELECT p.id, p.role, p.branch_id, p.full_name, au.email 
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE au.email = 'lodhran@sheriffsecurity.pk';

SELECT 'Branch:' as item;
SELECT id, name, city FROM branches WHERE id = '10000000-0000-0000-0000-000000000003';

SELECT 'Places Count:' as item;
SELECT COUNT(*) as total FROM places WHERE branch_id = '10000000-0000-0000-0000-000000000003';

SELECT 'Guards Count:' as item;
SELECT COUNT(*) as total FROM guards WHERE branch_id = '10000000-0000-0000-0000-000000000003';

SELECT 'Assignments Count:' as item;
SELECT COUNT(*) as total FROM assignments WHERE branch_id = '10000000-0000-0000-0000-000000000003';

SELECT 'Inventory Items Count:' as item;
SELECT COUNT(*) as total FROM inventory_items WHERE branch_id = '10000000-0000-0000-0000-000000000003';
