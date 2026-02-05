-- ============================================
-- Sheriff Security Management Platform
-- CONSOLIDATED DATABASE SCHEMA
-- Run this SINGLE file in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (if starting fresh)
-- ============================================
-- Uncomment these if you want to start completely fresh
-- DROP TABLE IF EXISTS invoice_line_items CASCADE;
-- DROP TABLE IF EXISTS invoices CASCADE;
-- DROP TABLE IF EXISTS attendance CASCADE;
-- DROP TABLE IF EXISTS assignments CASCADE;
-- DROP TABLE IF EXISTS inventory_assignments CASCADE;
-- DROP TABLE IF EXISTS inventory_units CASCADE;
-- DROP TABLE IF EXISTS inventory_items CASCADE;
-- DROP TABLE IF EXISTS guards CASCADE;
-- DROP TABLE IF EXISTS places CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TABLE IF EXISTS branches CASCADE;
-- DROP TABLE IF EXISTS inquiries CASCADE;
-- DROP TABLE IF EXISTS company_settings CASCADE;

-- ============================================
-- BRANCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branches_city ON branches(city);

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'branch_admin')),
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial unique index for branch_admin
CREATE UNIQUE INDEX IF NOT EXISTS unique_branch_admin_per_branch 
    ON profiles(branch_id) 
    WHERE role = 'branch_admin' AND branch_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_branch_id ON profiles(branch_id);

-- ============================================
-- PLACES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT '',
    contact_person TEXT,
    contact_phone TEXT,
    guards_required INTEGER DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_places_branch_id ON places(branch_id);
CREATE INDEX IF NOT EXISTS idx_places_status ON places(status);
CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);

-- ============================================
-- GUARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    full_name TEXT, -- Keep for backwards compatibility
    guard_code TEXT NOT NULL,
    cnic TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_guard_code_per_branch UNIQUE (branch_id, guard_code)
);

CREATE INDEX IF NOT EXISTS idx_guards_branch_id ON guards(branch_id);
CREATE INDEX IF NOT EXISTS idx_guards_status ON guards(status);
CREATE INDEX IF NOT EXISTS idx_guards_guard_code ON guards(guard_code);

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    guard_id UUID NOT NULL REFERENCES guards(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    shift_type TEXT DEFAULT 'day' NOT NULL CHECK (shift_type IN ('day', 'night', 'both')),
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_assignments_branch_id ON assignments(branch_id);
CREATE INDEX IF NOT EXISTS idx_assignments_guard_id ON assignments(guard_id);
CREATE INDEX IF NOT EXISTS idx_assignments_place_id ON assignments(place_id);
CREATE INDEX IF NOT EXISTS idx_assignments_start_date ON assignments(start_date);
CREATE INDEX IF NOT EXISTS idx_assignments_end_date ON assignments(end_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);

-- ============================================
-- ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    guard_id UUID NOT NULL REFERENCES guards(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    shift TEXT NOT NULL CHECK (shift IN ('day', 'night')),
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'leave', 'half_day')),
    check_in_time TEXT,
    check_out_time TEXT,
    half_day_hours NUMERIC CHECK (half_day_hours IS NULL OR (half_day_hours >= 1 AND half_day_hours <= 11)),
    notes TEXT,
    marked_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_attendance UNIQUE (guard_id, place_id, date, shift)
);

CREATE INDEX IF NOT EXISTS idx_attendance_branch_id ON attendance(branch_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_place_id ON attendance(place_id);
CREATE INDEX IF NOT EXISTS idx_attendance_guard_id ON attendance(guard_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_assignment_id ON attendance(assignment_id);

-- ============================================
-- INVENTORY ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Equipment', 'Safety Gear', 'Communication', 'Weapon', 'Other')),
    tracking_type TEXT NOT NULL CHECK (tracking_type IN ('quantity', 'serialised')),
    total_quantity INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_branch_id ON inventory_items(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_tracking_type ON inventory_items(tracking_type);

-- ============================================
-- INVENTORY UNITS TABLE (for serialised items)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    serial_number TEXT NOT NULL,
    status TEXT DEFAULT 'available' NOT NULL CHECK (status IN ('available', 'assigned', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_serial_per_branch UNIQUE (branch_id, serial_number)
);

CREATE INDEX IF NOT EXISTS idx_inventory_units_branch_id ON inventory_units(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_units_item_id ON inventory_units(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_units_status ON inventory_units(status);

-- ============================================
-- INVENTORY ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    assigned_to_type TEXT NOT NULL CHECK (assigned_to_type IN ('place', 'guard')),
    place_id UUID REFERENCES places(id) ON DELETE SET NULL,
    guard_id UUID REFERENCES guards(id) ON DELETE SET NULL,
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES inventory_units(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    returned_at TIMESTAMPTZ,
    condition TEXT,
    notes TEXT,
    CONSTRAINT valid_assignment_target CHECK (
        (assigned_to_type = 'place' AND place_id IS NOT NULL AND guard_id IS NULL) OR
        (assigned_to_type = 'guard' AND guard_id IS NOT NULL AND place_id IS NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_inventory_assignments_branch_id ON inventory_assignments(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_assignments_item_id ON inventory_assignments(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_assignments_place_id ON inventory_assignments(place_id);
CREATE INDEX IF NOT EXISTS idx_inventory_assignments_guard_id ON inventory_assignments(guard_id);
CREATE INDEX IF NOT EXISTS idx_inventory_assignments_active ON inventory_assignments(returned_at);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    period_start DATE,
    period_end DATE,
    subtotal NUMERIC DEFAULT 0 NOT NULL,
    tax_rate NUMERIC DEFAULT 0 NOT NULL,
    tax_amount NUMERIC DEFAULT 0 NOT NULL,
    total NUMERIC DEFAULT 0 NOT NULL,
    total_amount NUMERIC GENERATED ALWAYS AS (subtotal + tax_amount) STORED,
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'unpaid', 'overdue', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_invoice_number_per_branch UNIQUE (branch_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_branch_id ON invoices(branch_id);
CREATE INDEX IF NOT EXISTS idx_invoices_place_id ON invoices(place_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ============================================
-- INVOICE LINE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC DEFAULT 1 NOT NULL,
    unit_price NUMERIC DEFAULT 0 NOT NULL,
    amount NUMERIC DEFAULT 0 NOT NULL,
    line_total NUMERIC GENERATED ALWAYS AS (quantity * unit_price) STORED,
    sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

-- ============================================
-- INQUIRIES TABLE (public contact form)
-- ============================================
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- ============================================
-- COMPANY SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT DEFAULT 'Sheriff Security Company Pvt. Ltd' NOT NULL,
    tagline TEXT DEFAULT 'The Name of Conservation',
    address TEXT DEFAULT 'Mohalla Nawaban Main Street Jalwana Chock',
    city TEXT DEFAULT 'Bahawalpur',
    phone TEXT DEFAULT '03018689990',
    phone_secondary TEXT DEFAULT '03336644631',
    email TEXT DEFAULT 'sheriffsgssc@gmail.com',
    website TEXT,
    logo_url TEXT,
    invoice_prefix TEXT DEFAULT 'INV' NOT NULL,
    invoice_footer TEXT DEFAULT 'Thank you for your business!',
    tax_rate NUMERIC DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default company settings
INSERT INTO company_settings (
    id, company_name, tagline, address, city, phone, phone_secondary, email,
    invoice_prefix, invoice_footer, tax_rate
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Sheriff Security Company Pvt. Ltd',
    'The Name of Conservation',
    'Mohalla Nawaban Main Street Jalwana Chock',
    'Bahawalpur',
    '03018689990',
    '03336644631',
    'sheriffsgssc@gmail.com',
    'INV',
    'Thank you for your business!',
    0
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Function to get current user's branch_id
CREATE OR REPLACE FUNCTION get_user_branch_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT branch_id FROM profiles WHERE id = auth.uid();
$$;

-- Function to check if user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    );
$$;

-- Function to check overlapping assignments
CREATE OR REPLACE FUNCTION check_assignment_overlap(
    p_guard_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM assignments
        WHERE guard_id = p_guard_id
        AND id != COALESCE(p_exclude_id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status = 'active'
        AND (
            (p_end_date IS NULL AND (end_date IS NULL OR end_date >= p_start_date))
            OR
            (p_end_date IS NOT NULL AND (
                (end_date IS NULL AND start_date <= p_end_date)
                OR
                (end_date IS NOT NULL AND start_date <= p_end_date AND end_date >= p_start_date)
            ))
        )
    );
END;
$$;

-- Function to check if guard has active assignment for attendance
CREATE OR REPLACE FUNCTION has_active_assignment(
    p_guard_id UUID,
    p_place_id UUID,
    p_date DATE,
    p_shift TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM assignments
        WHERE guard_id = p_guard_id
        AND place_id = p_place_id
        AND start_date <= p_date
        AND (end_date IS NULL OR end_date >= p_date)
        AND status = 'active'
        AND (shift_type = p_shift OR shift_type = 'both')
    );
END;
$$;

-- ============================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO profiles (id, role, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'branch_admin'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TRIGGER: Sync full_name and name on guards
-- ============================================
CREATE OR REPLACE FUNCTION sync_guard_names()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.name IS NOT NULL AND NEW.full_name IS NULL THEN
        NEW.full_name := NEW.name;
    ELSIF NEW.full_name IS NOT NULL AND NEW.name IS NULL THEN
        NEW.name := NEW.full_name;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_guard_names_trigger ON guards;
CREATE TRIGGER sync_guard_names_trigger
    BEFORE INSERT OR UPDATE ON guards
    FOR EACH ROW
    EXECUTE FUNCTION sync_guard_names();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE guards ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BRANCHES POLICIES
-- ============================================
DROP POLICY IF EXISTS "super_admin_branches_all" ON branches;
CREATE POLICY "super_admin_branches_all" ON branches
    FOR ALL TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "branch_admin_branches_select" ON branches;
CREATE POLICY "branch_admin_branches_select" ON branches
    FOR SELECT TO authenticated
    USING (NOT is_super_admin() AND id = get_user_branch_id());

-- ============================================
-- PROFILES POLICIES
-- ============================================
DROP POLICY IF EXISTS "super_admin_profiles_all" ON profiles;
CREATE POLICY "super_admin_profiles_all" ON profiles
    FOR ALL TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ============================================
-- PLACES POLICIES
-- ============================================
DROP POLICY IF EXISTS "super_admin_places_all" ON places;
CREATE POLICY "super_admin_places_all" ON places
    FOR ALL TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "branch_admin_places_all" ON places;
CREATE POLICY "branch_admin_places_all" ON places
    FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- ============================================
-- GUARDS POLICIES
-- ============================================
DROP POLICY IF EXISTS "super_admin_guards_all" ON guards;
CREATE POLICY "super_admin_guards_all" ON guards
    FOR ALL TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "branch_admin_guards_all" ON guards;
CREATE POLICY "branch_admin_guards_all" ON guards
    FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- ============================================
-- ASSIGNMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "super_admin_assignments_all" ON assignments;
CREATE POLICY "super_admin_assignments_all" ON assignments
    FOR ALL TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "branch_admin_assignments_all" ON assignments;
CREATE POLICY "branch_admin_assignments_all" ON assignments
    FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- ============================================
-- ATTENDANCE POLICIES
-- ============================================
DROP POLICY IF EXISTS "super_admin_attendance_all" ON attendance;
CREATE POLICY "super_admin_attendance_all" ON attendance
    FOR ALL TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "branch_admin_attendance_all" ON attendance;
CREATE POLICY "branch_admin_attendance_all" ON attendance
    FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- ============================================
-- INVENTORY ITEMS POLICIES
-- ============================================
DROP POLICY IF EXISTS "super_admin_inventory_items_all" ON inventory_items;
CREATE POLICY "super_admin_inventory_items_all" ON inventory_items
    FOR ALL TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "branch_admin_inventory_items_all" ON inventory_items;
CREATE POLICY "branch_admin_inventory_items_all" ON inventory_items
    FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- ============================================
-- INVENTORY UNITS POLICIES
-- ============================================
DROP POLICY IF EXISTS "super_admin_inventory_units_all" ON inventory_units;
CREATE POLICY "super_admin_inventory_units_all" ON inventory_units
    FOR ALL TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "branch_admin_inventory_units_all" ON inventory_units;
CREATE POLICY "branch_admin_inventory_units_all" ON inventory_units
    FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- ============================================
-- INVENTORY ASSIGNMENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "super_admin_inventory_assignments_all" ON inventory_assignments;
CREATE POLICY "super_admin_inventory_assignments_all" ON inventory_assignments
    FOR ALL TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "branch_admin_inventory_assignments_all" ON inventory_assignments;
CREATE POLICY "branch_admin_inventory_assignments_all" ON inventory_assignments
    FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- ============================================
-- INVOICES POLICIES
-- ============================================
DROP POLICY IF EXISTS "super_admin_invoices_all" ON invoices;
CREATE POLICY "super_admin_invoices_all" ON invoices
    FOR ALL TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "branch_admin_invoices_all" ON invoices;
CREATE POLICY "branch_admin_invoices_all" ON invoices
    FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- ============================================
-- INVOICE LINE ITEMS POLICIES
-- ============================================
DROP POLICY IF EXISTS "super_admin_invoice_line_items_all" ON invoice_line_items;
CREATE POLICY "super_admin_invoice_line_items_all" ON invoice_line_items
    FOR ALL TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "branch_admin_invoice_line_items_all" ON invoice_line_items;
CREATE POLICY "branch_admin_invoice_line_items_all" ON invoice_line_items
    FOR ALL TO authenticated
    USING (
        NOT is_super_admin() 
        AND EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = invoice_line_items.invoice_id 
            AND invoices.branch_id = get_user_branch_id()
        )
    )
    WITH CHECK (
        NOT is_super_admin() 
        AND EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = invoice_line_items.invoice_id 
            AND invoices.branch_id = get_user_branch_id()
        )
    );

-- ============================================
-- INQUIRIES POLICIES
-- ============================================
DROP POLICY IF EXISTS "public_insert_inquiries" ON inquiries;
CREATE POLICY "public_insert_inquiries" ON inquiries
    FOR INSERT TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_read_inquiries" ON inquiries;
CREATE POLICY "authenticated_read_inquiries" ON inquiries
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "super_admin_delete_inquiries" ON inquiries;
CREATE POLICY "super_admin_delete_inquiries" ON inquiries
    FOR DELETE TO authenticated
    USING (is_super_admin());

-- ============================================
-- COMPANY SETTINGS POLICIES
-- ============================================
DROP POLICY IF EXISTS "authenticated_read_company_settings" ON company_settings;
CREATE POLICY "authenticated_read_company_settings" ON company_settings
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "super_admin_update_company_settings" ON company_settings;
CREATE POLICY "super_admin_update_company_settings" ON company_settings
    FOR UPDATE TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "super_admin_insert_company_settings" ON company_settings;
CREATE POLICY "super_admin_insert_company_settings" ON company_settings
    FOR INSERT TO authenticated
    WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS "public_read_company_settings" ON company_settings;
CREATE POLICY "public_read_company_settings" ON company_settings
    FOR SELECT TO anon
    USING (true);

-- ============================================
-- STORAGE BUCKETS (Run separately in dashboard if needed)
-- ============================================
-- Create these buckets manually in Supabase Dashboard:
-- 1. guard_photos (Private bucket)
-- 2. company_assets (Public bucket)

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Bahawalpur Head Office
INSERT INTO branches (id, name, city, address, phone) VALUES
('10000000-0000-0000-0000-000000000001', 'Bahawalpur Head Office', 'Bahawalpur', 
 'Mohalla Nawaban Main Street Jalwana Chock, Bahawalpur 63100', '03018689990'),
('10000000-0000-0000-0000-000000000002', 'Multan Branch', 'Multan', 
 'Gulgasht Colony Main Boulevard, Multan 60000', '03336644631')
ON CONFLICT (id) DO NOTHING;

-- Sample Places
INSERT INTO places (id, branch_id, name, address, city, contact_person, contact_phone, guards_required, status) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 
 'Allied Bank Main Branch', 'Circular Road, Bahawalpur', 'Bahawalpur', 'Mr. Ahmed Khan', '03001234567', 4, 'active'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 
 'Metro Cash & Carry', 'Ahmadpur Road, Bahawalpur', 'Bahawalpur', 'Mr. Naveed Hussain', '03007654321', 6, 'active'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 
 'Nishtar Medical Hospital', 'Nishtar Road, Multan', 'Multan', 'Dr. Imran Ali', '03111234567', 8, 'active')
ON CONFLICT (id) DO NOTHING;

-- Sample Guards  
INSERT INTO guards (id, branch_id, name, guard_code, cnic, phone, status) VALUES
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 
 'Muhammad Aslam', 'BWP-001', '31101-1234567-1', '03001111111', 'active'),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 
 'Ghulam Mustafa', 'BWP-002', '31101-2234567-2', '03002222222', 'active'),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 
 'Arshad Ali', 'MLT-001', '36101-1234567-1', '03111111111', 'active')
ON CONFLICT (id) DO NOTHING;

-- Sample Assignments
INSERT INTO assignments (id, branch_id, guard_id, place_id, start_date, shift_type, status, notes) VALUES
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 
 '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 
 CURRENT_DATE - INTERVAL '30 days', 'day', 'active', 'Main gate duty'),
('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 
 '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 
 CURRENT_DATE - INTERVAL '30 days', 'night', 'active', 'Night patrol')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Sheriff Security Database Setup Complete!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Tables created: branches, profiles, places, guards, assignments, attendance, inventory_items, inventory_units, inventory_assignments, invoices, invoice_line_items, inquiries, company_settings';
    RAISE NOTICE 'RLS policies applied to all tables';
    RAISE NOTICE 'Helper functions created';
    RAISE NOTICE 'Sample data inserted';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Create storage buckets: guard_photos (private), company_assets (public)';
    RAISE NOTICE '2. Create a user in Auth and update their profile to super_admin role';
    RAISE NOTICE '===========================================';
END $$;
