-- Enable Realtime for order_items and add RLS policy for vendor notifications

-- Step 1: Enable Realtime replication for order_items table
-- (Run this in Supabase Dashboard > Database > Replication if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- Step 2: Enable RLS on order_items if not already
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing vendor select policy if any
DROP POLICY IF EXISTS "vendor_can_select_own_order_items" ON public.order_items;
DROP POLICY IF EXISTS "order_items_vendor_select" ON public.order_items;

-- Step 4: Create RLS policy for vendors to SELECT their order items
-- This is required for Supabase Realtime to deliver events to vendors
CREATE POLICY "order_items_vendor_select" ON public.order_items
  FOR SELECT
  USING (
    -- Vendor can see order items where vendor_id matches their vendor profile
    vendor_id IN (
      SELECT user_id FROM vendor_profiles WHERE user_id = auth.uid()
    )
    OR
    -- Or if vendor_id matches their vendor ID directly (different data model)
    vendor_id IN (
      SELECT id FROM vendors WHERE owner_id = auth.uid()
    )
    OR
    -- Admins can see all
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Note: Users who placed the order should also be able to see their order items
-- This is typically handled by a separate policy checking order_id ownership
