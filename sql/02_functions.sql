-- =====================================================
-- STEP 2: RUN THIS SECOND - Helper Functions
-- =====================================================

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

-- Trigger: Auto-create profile on user signup
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

-- Trigger: Sync guard names
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

SELECT 'STEP 2 COMPLETE: Functions and triggers created!' as status;
