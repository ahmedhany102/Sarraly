-- Secure RLS for order_items - Enable vendor SELECT access for Realtime
-- CONFIRMED: order_items.vendor_id = auth.uid() (user's auth ID)
-- See migration 20260101165721 comment: "order_items.vendor_id = user_id = vendors.owner_id"

-- Step 1: Ensure Realtime is enabled for order_items
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Table order_items already in supabase_realtime publication';
END $$;

-- Step 2: Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Step 3: Remove the dangerous temp policy and any conflicting policies
DROP POLICY IF EXISTS "temp_allow_select" ON public.order_items;
DROP POLICY IF EXISTS "order_items_vendor_select" ON public.order_items;
DROP POLICY IF EXISTS "vendor_can_select_own_order_items" ON public.order_items;
DROP POLICY IF EXISTS "Vendors can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Step 4: Create SECURE SELECT policy for vendors
-- vendor_id in order_items IS the vendor's auth.uid() directly
CREATE POLICY "Vendors can view their own order items" ON public.order_items
  FOR SELECT
  USING (vendor_id = auth.uid());

-- Step 5: Admin access using simple subquery
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Verification query (run manually to check):
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'order_items';
