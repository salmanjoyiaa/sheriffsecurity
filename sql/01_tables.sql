-- =====================================================
-- STEP 1: RUN THIS FIRST - Core Tables
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- BRANCHES TABLE
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'branch_admin')),
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PLACES TABLE
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

-- GUARDS TABLE
CREATE TABLE IF NOT EXISTS guards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    full_name TEXT,
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

-- ASSIGNMENTS TABLE
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

-- ATTENDANCE TABLE
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

-- INVENTORY ITEMS TABLE
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

-- INVENTORY UNITS TABLE
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

-- INVENTORY ASSIGNMENTS TABLE
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

-- INVOICES TABLE
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
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'unpaid', 'overdue', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_invoice_number_per_branch UNIQUE (branch_id, invoice_number)
);

-- INVOICE LINE ITEMS TABLE
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC DEFAULT 1 NOT NULL,
    unit_price NUMERIC DEFAULT 0 NOT NULL,
    amount NUMERIC DEFAULT 0 NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- COMPANY SETTINGS TABLE
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
INSERT INTO company_settings (id) VALUES ('a0000000-0000-0000-0000-000000000001') ON CONFLICT (id) DO NOTHING;

SELECT 'STEP 1 COMPLETE: All tables created!' as status;
