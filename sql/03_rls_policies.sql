-- =====================================================
-- STEP 3: RUN THIS THIRD - Row Level Security
-- =====================================================

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

-- BRANCHES POLICIES
CREATE POLICY "super_admin_branches_all" ON branches FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "branch_admin_branches_select" ON branches FOR SELECT TO authenticated
    USING (NOT is_super_admin() AND id = get_user_branch_id());

-- PROFILES POLICIES
CREATE POLICY "super_admin_profiles_all" ON profiles FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "users_read_own_profile" ON profiles FOR SELECT TO authenticated
    USING (id = auth.uid());
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE TO authenticated
    USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- PLACES POLICIES
CREATE POLICY "super_admin_places_all" ON places FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "branch_admin_places_all" ON places FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- GUARDS POLICIES
CREATE POLICY "super_admin_guards_all" ON guards FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "branch_admin_guards_all" ON guards FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- ASSIGNMENTS POLICIES
CREATE POLICY "super_admin_assignments_all" ON assignments FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "branch_admin_assignments_all" ON assignments FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- ATTENDANCE POLICIES
CREATE POLICY "super_admin_attendance_all" ON attendance FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "branch_admin_attendance_all" ON attendance FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- INVENTORY ITEMS POLICIES
CREATE POLICY "super_admin_inventory_items_all" ON inventory_items FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "branch_admin_inventory_items_all" ON inventory_items FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- INVENTORY UNITS POLICIES
CREATE POLICY "super_admin_inventory_units_all" ON inventory_units FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "branch_admin_inventory_units_all" ON inventory_units FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- INVENTORY ASSIGNMENTS POLICIES
CREATE POLICY "super_admin_inventory_assignments_all" ON inventory_assignments FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "branch_admin_inventory_assignments_all" ON inventory_assignments FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- INVOICES POLICIES
CREATE POLICY "super_admin_invoices_all" ON invoices FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "branch_admin_invoices_all" ON invoices FOR ALL TO authenticated
    USING (NOT is_super_admin() AND branch_id = get_user_branch_id())
    WITH CHECK (NOT is_super_admin() AND branch_id = get_user_branch_id());

-- INVOICE LINE ITEMS POLICIES
CREATE POLICY "super_admin_invoice_line_items_all" ON invoice_line_items FOR ALL TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "branch_admin_invoice_line_items_all" ON invoice_line_items FOR ALL TO authenticated
    USING (
        NOT is_super_admin() 
        AND EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_line_items.invoice_id AND invoices.branch_id = get_user_branch_id())
    )
    WITH CHECK (
        NOT is_super_admin() 
        AND EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_line_items.invoice_id AND invoices.branch_id = get_user_branch_id())
    );

-- INQUIRIES POLICIES
CREATE POLICY "public_insert_inquiries" ON inquiries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "authenticated_read_inquiries" ON inquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "super_admin_delete_inquiries" ON inquiries FOR DELETE TO authenticated USING (is_super_admin());

-- COMPANY SETTINGS POLICIES
CREATE POLICY "authenticated_read_company_settings" ON company_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "super_admin_update_company_settings" ON company_settings FOR UPDATE TO authenticated
    USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "public_read_company_settings" ON company_settings FOR SELECT TO anon USING (true);

SELECT 'STEP 3 COMPLETE: RLS policies created!' as status;
