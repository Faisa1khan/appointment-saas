-- Migration: Enable Row Level Security (RLS)

-- 1. Helper Function for Membership Check
CREATE OR REPLACE FUNCTION public.is_org_member(org_id uuid)
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
  );
$$;

-- 1.5 Fix SECURITY DEFINER permissions
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated, service_role;

-- 2. Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;

-- 3. Policies for 'organizations'
-- Note: Role-based permissions (Owner vs Staff) are out of scope for the MVP.
-- Currently, any authenticated member can update or delete the organization.
DROP POLICY IF EXISTS "Organizations are viewable by members" ON organizations;
CREATE POLICY "Organizations are viewable by members" ON organizations
  FOR SELECT TO authenticated USING (public.is_org_member(id));

DROP POLICY IF EXISTS "Organizations are updatable by members" ON organizations;
CREATE POLICY "Organizations are updatable by members" ON organizations
  FOR UPDATE TO authenticated 
  USING (public.is_org_member(id))
  WITH CHECK (public.is_org_member(id));

DROP POLICY IF EXISTS "Organizations are deletable by members" ON organizations;
CREATE POLICY "Organizations are deletable by members" ON organizations
  FOR DELETE TO authenticated USING (public.is_org_member(id));

-- 4. Policies for 'organization_members'
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;
CREATE POLICY "Users can view their own memberships" ON organization_members
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 5. Policies for 'customers'
DROP POLICY IF EXISTS "Customers are viewable by org members" ON customers;
CREATE POLICY "Customers are viewable by org members" ON customers
  FOR SELECT TO authenticated USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Customers are insertable by org members" ON customers;
CREATE POLICY "Customers are insertable by org members" ON customers
  FOR INSERT TO authenticated WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Customers are updatable by org members" ON customers;
CREATE POLICY "Customers are updatable by org members" ON customers
  FOR UPDATE TO authenticated 
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Customers are deletable by org members" ON customers;
CREATE POLICY "Customers are deletable by org members" ON customers
  FOR DELETE TO authenticated USING (public.is_org_member(organization_id));

-- 6. Policies for 'services' (Public SELECT)
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Services are insertable by org members" ON services;
CREATE POLICY "Services are insertable by org members" ON services
  FOR INSERT TO authenticated WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Services are updatable by org members" ON services;
CREATE POLICY "Services are updatable by org members" ON services
  FOR UPDATE TO authenticated 
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Services are deletable by org members" ON services;
CREATE POLICY "Services are deletable by org members" ON services
  FOR DELETE TO authenticated USING (public.is_org_member(organization_id));

-- 7. Policies for 'resources' (Public SELECT)
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON resources;
CREATE POLICY "Resources are viewable by everyone" ON resources
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Resources are insertable by org members" ON resources;
CREATE POLICY "Resources are insertable by org members" ON resources
  FOR INSERT TO authenticated WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Resources are updatable by org members" ON resources;
CREATE POLICY "Resources are updatable by org members" ON resources
  FOR UPDATE TO authenticated 
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Resources are deletable by org members" ON resources;
CREATE POLICY "Resources are deletable by org members" ON resources
  FOR DELETE TO authenticated USING (public.is_org_member(organization_id));

-- 8. Policies for 'business_hours' (Public SELECT)
DROP POLICY IF EXISTS "Business hours are viewable by everyone" ON business_hours;
CREATE POLICY "Business hours are viewable by everyone" ON business_hours
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Business hours are insertable by org members" ON business_hours;
CREATE POLICY "Business hours are insertable by org members" ON business_hours
  FOR INSERT TO authenticated WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Business hours are updatable by org members" ON business_hours;
CREATE POLICY "Business hours are updatable by org members" ON business_hours
  FOR UPDATE TO authenticated 
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Business hours are deletable by org members" ON business_hours;
CREATE POLICY "Business hours are deletable by org members" ON business_hours
  FOR DELETE TO authenticated USING (public.is_org_member(organization_id));

-- 9. Policies for 'business_closures' (Public SELECT)
DROP POLICY IF EXISTS "Business closures are viewable by everyone" ON business_closures;
CREATE POLICY "Business closures are viewable by everyone" ON business_closures
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Business closures are insertable by org members" ON business_closures;
CREATE POLICY "Business closures are insertable by org members" ON business_closures
  FOR INSERT TO authenticated WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Business closures are updatable by org members" ON business_closures;
CREATE POLICY "Business closures are updatable by org members" ON business_closures
  FOR UPDATE TO authenticated 
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Business closures are deletable by org members" ON business_closures;
CREATE POLICY "Business closures are deletable by org members" ON business_closures
  FOR DELETE TO authenticated USING (public.is_org_member(organization_id));

-- 10. Policies for 'resource_schedules' (Public SELECT)
DROP POLICY IF EXISTS "Resource schedules are viewable by everyone" ON resource_schedules;
CREATE POLICY "Resource schedules are viewable by everyone" ON resource_schedules
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Resource schedules are insertable by org members" ON resource_schedules;
CREATE POLICY "Resource schedules are insertable by org members" ON resource_schedules
  FOR INSERT TO authenticated WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Resource schedules are updatable by org members" ON resource_schedules;
CREATE POLICY "Resource schedules are updatable by org members" ON resource_schedules
  FOR UPDATE TO authenticated 
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Resource schedules are deletable by org members" ON resource_schedules;
CREATE POLICY "Resource schedules are deletable by org members" ON resource_schedules
  FOR DELETE TO authenticated USING (public.is_org_member(organization_id));

-- 11. Policies for 'bookings'
DROP POLICY IF EXISTS "Bookings are viewable by org members and the customer" ON bookings;
CREATE POLICY "Bookings are viewable by org members and the customer" ON bookings
  FOR SELECT TO authenticated
  USING (
    public.is_org_member(organization_id) OR
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Bookings are insertable by org members" ON bookings;
CREATE POLICY "Bookings are insertable by org members" ON bookings
  FOR INSERT TO authenticated WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Bookings are updatable by org members" ON bookings;
CREATE POLICY "Bookings are updatable by org members" ON bookings
  FOR UPDATE TO authenticated 
  USING (public.is_org_member(organization_id))
  WITH CHECK (public.is_org_member(organization_id));

DROP POLICY IF EXISTS "Bookings are deletable by org members" ON bookings;
CREATE POLICY "Bookings are deletable by org members" ON bookings
  FOR DELETE TO authenticated USING (public.is_org_member(organization_id));

-- 12. Policies for 'booking_services'
DROP POLICY IF EXISTS "Booking services are viewable by org members and the customer" ON booking_services;
CREATE POLICY "Booking services are viewable by org members and the customer" ON booking_services
  FOR SELECT TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE 
        public.is_org_member(organization_id) OR 
        customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Booking services are insertable by org members" ON booking_services;
CREATE POLICY "Booking services are insertable by org members" ON booking_services
  FOR INSERT TO authenticated
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE public.is_org_member(organization_id)
    )
  );

DROP POLICY IF EXISTS "Booking services are updatable by org members" ON booking_services;
CREATE POLICY "Booking services are updatable by org members" ON booking_services
  FOR UPDATE TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE public.is_org_member(organization_id)
    )
  )
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE public.is_org_member(organization_id)
    )
  );

DROP POLICY IF EXISTS "Booking services are deletable by org members" ON booking_services;
CREATE POLICY "Booking services are deletable by org members" ON booking_services
  FOR DELETE TO authenticated
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE public.is_org_member(organization_id)
    )
  );
