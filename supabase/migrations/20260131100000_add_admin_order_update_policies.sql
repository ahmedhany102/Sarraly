-- Add Admin UPDATE policies for orders and order_items
-- This allows Super Admin to update order statuses from the dashboard

-- =====================================================
-- 1. Admin UPDATE policy for order_items
-- =====================================================

-- Drop existing admin update policy if any
DROP POLICY IF EXISTS "Admins can update all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON public.order_items;

-- Create Admin UPDATE policy using is_admin function
CREATE POLICY "Admins can update all order items"
ON public.order_items
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- =====================================================
-- 2. Ensure Admin has full access to orders table
-- =====================================================

-- The "Admins can manage all orders" policy exists but let's ensure it works
-- First, check if there's a conflict with other UPDATE policies

-- Drop and recreate the admin all-access policy to ensure it's correct
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

CREATE POLICY "Admins can manage all orders"
ON public.orders
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- =====================================================
-- 3. Add Admin INSERT policy for order_items (for completeness)
-- =====================================================

DROP POLICY IF EXISTS "Admins can insert order items" ON public.order_items;

CREATE POLICY "Admins can insert order items"
ON public.order_items
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

-- =====================================================
-- 4. Add Admin DELETE policy for order_items (for completeness)
-- =====================================================

DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;

CREATE POLICY "Admins can delete order items"
ON public.order_items
FOR DELETE
USING (public.is_admin(auth.uid()));

-- =====================================================
-- Verification (run manually):
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'order_items';
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'orders';
-- =====================================================
