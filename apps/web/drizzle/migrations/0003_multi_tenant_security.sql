-- Migration: Enforce Multi-Tenant Security Model (RLS)
-- Includes the `is_org_owner` helper and strict write policies for all tables.

-- 1. Helper Function for Owner Check
CREATE OR REPLACE FUNCTION public.is_org_owner(org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = 'OWNER'
  );
$$;

-- Fix SECURITY DEFINER permissions
REVOKE EXECUTE ON FUNCTION public.is_org_owner(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_org_owner(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_org_owner(uuid) TO authenticated, service_role;

-- 2. Enable RLS on newly added tables
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- 3. Policies for 'app_users'
DROP POLICY IF EXISTS "Users can view their own profile" ON app_users;
CREATE POLICY "Users can view their own profile" ON app_users
  FOR SELECT TO authenticated USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON app_users;
CREATE POLICY "Users can update their own profile" ON app_users
  FOR UPDATE TO authenticated 
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- (INSERT and DELETE are intentionally omitted to allow only server-side operations)

-- 4. Policies for 'service_categories'
DROP POLICY IF EXISTS "Service categories are viewable by everyone" ON service_categories;
CREATE POLICY "Service categories are viewable by everyone" ON service_categories
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Service categories are insertable by org owners" ON service_categories;
CREATE POLICY "Service categories are insertable by org owners" ON service_categories
  FOR INSERT TO authenticated WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Service categories are updatable by org owners" ON service_categories;
CREATE POLICY "Service categories are updatable by org owners" ON service_categories
  FOR UPDATE TO authenticated 
  USING (public.is_org_owner(organization_id))
  WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Service categories are deletable by org owners" ON service_categories;
CREATE POLICY "Service categories are deletable by org owners" ON service_categories
  FOR DELETE TO authenticated USING (public.is_org_owner(organization_id));

-- 5. Update Policies for 'organizations'
DROP POLICY IF EXISTS "Organizations are updatable by members" ON organizations;
CREATE POLICY "Organizations are updatable by owners" ON organizations
  FOR UPDATE TO authenticated 
  USING (public.is_org_owner(id))
  WITH CHECK (public.is_org_owner(id));

DROP POLICY IF EXISTS "Organizations are deletable by members" ON organizations;
CREATE POLICY "Organizations are deletable by owners" ON organizations
  FOR DELETE TO authenticated USING (public.is_org_owner(id));

-- 6. Update Policies for 'customers'
DROP POLICY IF EXISTS "Customers are insertable by org members" ON customers;
CREATE POLICY "Customers are insertable by org owners" ON customers
  FOR INSERT TO authenticated WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Customers are updatable by org members" ON customers;
CREATE POLICY "Customers are updatable by org owners" ON customers
  FOR UPDATE TO authenticated 
  USING (public.is_org_owner(organization_id))
  WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Customers are deletable by org members" ON customers;
CREATE POLICY "Customers are deletable by org owners" ON customers
  FOR DELETE TO authenticated USING (public.is_org_owner(organization_id));

-- 7. Update Policies for 'services'
DROP POLICY IF EXISTS "Services are insertable by org members" ON services;
CREATE POLICY "Services are insertable by org owners" ON services
  FOR INSERT TO authenticated WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Services are updatable by org members" ON services;
CREATE POLICY "Services are updatable by org owners" ON services
  FOR UPDATE TO authenticated 
  USING (public.is_org_owner(organization_id))
  WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Services are deletable by org members" ON services;
CREATE POLICY "Services are deletable by org owners" ON services
  FOR DELETE TO authenticated USING (public.is_org_owner(organization_id));

-- 8. Update Policies for 'resources'
DROP POLICY IF EXISTS "Resources are insertable by org members" ON resources;
CREATE POLICY "Resources are insertable by org owners" ON resources
  FOR INSERT TO authenticated WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Resources are updatable by org members" ON resources;
CREATE POLICY "Resources are updatable by org owners" ON resources
  FOR UPDATE TO authenticated 
  USING (public.is_org_owner(organization_id))
  WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Resources are deletable by org members" ON resources;
CREATE POLICY "Resources are deletable by org owners" ON resources
  FOR DELETE TO authenticated USING (public.is_org_owner(organization_id));

-- 9. Update Policies for 'business_hours'
DROP POLICY IF EXISTS "Business hours are insertable by org members" ON business_hours;
CREATE POLICY "Business hours are insertable by org owners" ON business_hours
  FOR INSERT TO authenticated WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Business hours are updatable by org members" ON business_hours;
CREATE POLICY "Business hours are updatable by org owners" ON business_hours
  FOR UPDATE TO authenticated 
  USING (public.is_org_owner(organization_id))
  WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Business hours are deletable by org members" ON business_hours;
CREATE POLICY "Business hours are deletable by org owners" ON business_hours
  FOR DELETE TO authenticated USING (public.is_org_owner(organization_id));

-- 10. Update Policies for 'business_closures'
DROP POLICY IF EXISTS "Business closures are insertable by org members" ON business_closures;
CREATE POLICY "Business closures are insertable by org owners" ON business_closures
  FOR INSERT TO authenticated WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Business closures are updatable by org members" ON business_closures;
CREATE POLICY "Business closures are updatable by org owners" ON business_closures
  FOR UPDATE TO authenticated 
  USING (public.is_org_owner(organization_id))
  WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Business closures are deletable by org members" ON business_closures;
CREATE POLICY "Business closures are deletable by org owners" ON business_closures
  FOR DELETE TO authenticated USING (public.is_org_owner(organization_id));

-- 11. Update Policies for 'resource_schedules'
DROP POLICY IF EXISTS "Resource schedules are insertable by org members" ON resource_schedules;
CREATE POLICY "Resource schedules are insertable by org owners" ON resource_schedules
  FOR INSERT TO authenticated WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Resource schedules are updatable by org members" ON resource_schedules;
CREATE POLICY "Resource schedules are updatable by org owners" ON resource_schedules
  FOR UPDATE TO authenticated 
  USING (public.is_org_owner(organization_id))
  WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Resource schedules are deletable by org members" ON resource_schedules;
CREATE POLICY "Resource schedules are deletable by org owners" ON resource_schedules
  FOR DELETE TO authenticated USING (public.is_org_owner(organization_id));

-- 12. Update Policies for 'bookings'
DROP POLICY IF EXISTS "Bookings are insertable by org members" ON bookings;
CREATE POLICY "Bookings are insertable by org owners" ON bookings
  FOR INSERT TO authenticated WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Bookings are updatable by org members" ON bookings;
CREATE POLICY "Bookings are updatable by org owners" ON bookings
  FOR UPDATE TO authenticated 
  USING (public.is_org_owner(organization_id))
  WITH CHECK (public.is_org_owner(organization_id));

DROP POLICY IF EXISTS "Bookings are deletable by org members" ON bookings;
CREATE POLICY "Bookings are deletable by org owners" ON bookings
  FOR DELETE TO authenticated USING (public.is_org_owner(organization_id));

-- 13. Update Policies for 'booking_services'
DROP POLICY IF EXISTS "Booking services are insertable by org members" ON booking_services;
CREATE POLICY "Booking services are insertable by org owners" ON booking_services
  FOR INSERT TO authenticated
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE public.is_org_owner(organization_id)
    )
  );

DROP POLICY IF EXISTS "Booking services are updatable by org members" ON booking_services;
CREATE POLICY "Booking services are updatable by org owners" ON booking_services
  FOR UPDATE TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE public.is_org_owner(organization_id)
    )
  )
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE public.is_org_owner(organization_id)
    )
  );

DROP POLICY IF EXISTS "Booking services are deletable by org members" ON booking_services;
CREATE POLICY "Booking services are deletable by org owners" ON booking_services
  FOR DELETE TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE public.is_org_owner(organization_id)
    )
  );
