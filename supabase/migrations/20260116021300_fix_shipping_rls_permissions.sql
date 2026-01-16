-- Fix RLS for Shipping System
-- Ensures all users can read shipping rates and vendor shipping defaults

-- ============================================
-- PART 1: Fix vendor_shipping_rates permissions
-- ============================================

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "public_read_shipping_rates" ON public.vendor_shipping_rates;
DROP POLICY IF EXISTS "vendors_select_own_shipping_rates" ON public.vendor_shipping_rates;
DROP POLICY IF EXISTS "anyone_can_read_shipping_rates" ON public.vendor_shipping_rates;

-- Create universal read access policy
CREATE POLICY "anyone_can_read_shipping_rates" ON public.vendor_shipping_rates
  FOR SELECT
  TO anon, authenticated, public
  USING (true);

-- Re-grant permissions explicitly
GRANT SELECT ON public.vendor_shipping_rates TO anon;
GRANT SELECT ON public.vendor_shipping_rates TO authenticated;

-- ============================================
-- PART 2: Fix vendor_profiles permissions for shipping
-- ============================================

-- Allow public to read essential vendor profile fields (including default_shipping_cost)
DROP POLICY IF EXISTS "public_read_vendor_profiles" ON public.vendor_profiles;
DROP POLICY IF EXISTS "anyone_can_read_vendor_profiles" ON public.vendor_profiles;

-- Universal read policy for vendor profiles
CREATE POLICY "anyone_can_read_vendor_profiles" ON public.vendor_profiles
  FOR SELECT
  TO anon, authenticated, public
  USING (true);

-- Ensure default_shipping_cost column exists
ALTER TABLE public.vendor_profiles
ADD COLUMN IF NOT EXISTS default_shipping_cost numeric DEFAULT 25;

-- ============================================
-- PART 3: Ensure products table has required fields
-- ============================================

-- Ensure is_free_shipping column exists on products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_free_shipping boolean DEFAULT false;

-- Ensure vendor_id or user_id is accessible
-- Products use user_id to link to vendor (auth.uid())

-- ============================================
-- PART 4: Grant read access
-- ============================================

GRANT SELECT ON public.vendor_profiles TO anon;
GRANT SELECT ON public.vendor_profiles TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;

-- ============================================
-- PART 5: Verify tables exist (safety)
-- ============================================

-- Recreate vendor_shipping_rates if not exists
CREATE TABLE IF NOT EXISTS public.vendor_shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  governorate text NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vendor_id, governorate)
);

-- Make sure RLS is enabled
ALTER TABLE public.vendor_shipping_rates ENABLE ROW LEVEL SECURITY;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_vendor_shipping_rates_lookup 
  ON public.vendor_shipping_rates(vendor_id, governorate);
