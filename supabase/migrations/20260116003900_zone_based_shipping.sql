-- Zone-Based Shipping System - Database Schema
-- Creates vendor_shipping_rates table and adds default_shipping_cost to vendor_profiles

-- Step 1: Add default_shipping_cost to vendor_profiles
ALTER TABLE public.vendor_profiles
ADD COLUMN IF NOT EXISTS default_shipping_cost numeric DEFAULT 25;

-- Step 2: Create vendor_shipping_rates table
CREATE TABLE IF NOT EXISTS public.vendor_shipping_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  governorate text NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vendor_id, governorate)
);

-- Step 3: Enable RLS
ALTER TABLE public.vendor_shipping_rates ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS Policies

-- Vendors can view their own rates
CREATE POLICY "vendors_select_own_shipping_rates" ON public.vendor_shipping_rates
  FOR SELECT
  USING (vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid()));

-- Vendors can insert their own rates
CREATE POLICY "vendors_insert_own_shipping_rates" ON public.vendor_shipping_rates
  FOR INSERT
  WITH CHECK (vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid()));

-- Vendors can update their own rates
CREATE POLICY "vendors_update_own_shipping_rates" ON public.vendor_shipping_rates
  FOR UPDATE
  USING (vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid()));

-- Vendors can delete their own rates
CREATE POLICY "vendors_delete_own_shipping_rates" ON public.vendor_shipping_rates
  FOR DELETE
  USING (vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid()));

-- Public can read shipping rates (for checkout calculation)
CREATE POLICY "public_read_shipping_rates" ON public.vendor_shipping_rates
  FOR SELECT
  USING (true);

-- Admins can manage all rates
CREATE POLICY "admins_manage_shipping_rates" ON public.vendor_shipping_rates
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Step 5: Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_vendor_shipping_rates_lookup 
  ON public.vendor_shipping_rates(vendor_id, governorate);

-- Step 6: Grant permissions
GRANT SELECT ON public.vendor_shipping_rates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vendor_shipping_rates TO authenticated;
