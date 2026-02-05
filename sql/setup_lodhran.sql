-- =====================================================
-- SETUP LODHRAN BRANCH WITH ADMIN USER
-- Run this in Supabase SQL Editor
-- =====================================================

-- 0. Make current user super_admin (salmanjoyiaa@gmail.com)
UPDATE profiles 
SET role = 'super_admin' 
WHERE id = 'da998c3a-2d90-4352-b9ac-18d7b0ebed45';

-- 1. Create Lodhran Branch
INSERT INTO branches (id, name, city, address, phone) VALUES
('10000000-0000-0000-0000-000000000003', 'Lodhran Branch', 'Lodhran', 
 'Main Bazaar Road, Near Clock Tower, Lodhran 59320', '03009876543')
ON CONFLICT (id) DO NOTHING;

-- 2. Add sample places for Lodhran
INSERT INTO places (id, branch_id, name, address, city, contact_person, contact_phone, guards_required, status) VALUES
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 
 'National Bank Lodhran', 'Main Market Road, Lodhran', 'Lodhran', 'Mr. Tariq Mehmood', '03021234567', 3, 'active'),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 
 'District Hospital Lodhran', 'Hospital Road, Lodhran', 'Lodhran', 'Dr. Shahid Hassan', '03031234567', 5, 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. Add sample guards for Lodhran
INSERT INTO guards (id, branch_id, name, guard_code, cnic, phone, address, status) VALUES
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 
 'Riaz Ahmed', 'LDN-001', '36301-1234567-1', '03041111111', 'Village Karor, Lodhran', 'active'),
('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 
 'Bashir Khan', 'LDN-002', '36301-2234567-2', '03042222222', 'Mohalla Islamabad, Lodhran', 'active'),
('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 
 'Waqar Ali', 'LDN-003', '36301-3234567-3', '03043333333', 'Near Jama Masjid, Lodhran', 'active')
ON CONFLICT (id) DO NOTHING;

-- 4. Create sample assignments for Lodhran
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
ON CONFLICT (id) DO NOTHING;

-- 5. Add some attendance records for reports
INSERT INTO attendance (branch_id, guard_id, place_id, assignment_id, date, shift, status, check_in_time, check_out_time) VALUES
('10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', 
 '20000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003',
 CURRENT_DATE - INTERVAL '2 days', 'day', 'present', '08:00', '20:00'),
('10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000004', 
 '20000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003',
 CURRENT_DATE - INTERVAL '1 day', 'day', 'present', '08:15', '20:00'),
('10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005', 
 '20000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004',
 CURRENT_DATE - INTERVAL '2 days', 'night', 'present', '20:00', '08:00'),
('10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005', 
 '20000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004',
 CURRENT_DATE - INTERVAL '1 day', 'night', 'absent', NULL, NULL),
('10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000006', 
 '20000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005',
 CURRENT_DATE - INTERVAL '2 days', 'day', 'present', '07:45', '19:45')
ON CONFLICT DO NOTHING;

SELECT 'Lodhran Branch setup complete!' as status;
SELECT 'Branches:' as info, count(*) as count FROM branches;
SELECT 'Places:' as info, count(*) as count FROM places WHERE branch_id = '10000000-0000-0000-0000-000000000003';
SELECT 'Guards:' as info, count(*) as count FROM guards WHERE branch_id = '10000000-0000-0000-0000-000000000003';
