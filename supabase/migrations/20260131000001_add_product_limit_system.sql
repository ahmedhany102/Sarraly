-- =====================================================
-- PRODUCT LIMIT SYSTEM (Quota Management)
-- =====================================================
-- This migration adds product limits to vendors and enforces them via triggers
-- Created: 2026-01-31
-- =====================================================

-- =====================================================
-- STEP 1: Add max_products column to vendor_profiles
-- =====================================================
ALTER TABLE vendor_profiles 
ADD COLUMN IF NOT EXISTS max_products INTEGER DEFAULT 50 NOT NULL;

-- Also add to vendors table for consistency
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS max_products INTEGER DEFAULT 50 NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN vendor_profiles.max_products IS 'Maximum number of products this vendor can upload. Default is 50.';
COMMENT ON COLUMN vendors.max_products IS 'Maximum number of products this vendor can upload. Default is 50.';

-- =====================================================
-- STEP 2: Create the product limit check function
-- =====================================================
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_product_count INTEGER;
  vendor_max_products INTEGER;
  vendor_name TEXT;
BEGIN
  -- Count current products for this vendor
  SELECT COUNT(*) INTO current_product_count
  FROM products
  WHERE vendor_id = NEW.vendor_id;

  -- Get the max_products limit for this vendor
  -- First try vendors table, then fallback to vendor_profiles
  SELECT v.max_products, v.name INTO vendor_max_products, vendor_name
  FROM vendors v
  WHERE v.id = NEW.vendor_id;

  -- If not found in vendors, try vendor_profiles by matching owner_id
  IF vendor_max_products IS NULL THEN
    SELECT vp.max_products, vp.store_name INTO vendor_max_products, vendor_name
    FROM vendor_profiles vp
    JOIN vendors v ON v.owner_id = vp.user_id
    WHERE v.id = NEW.vendor_id;
  END IF;

  -- Default to 50 if still not found
  IF vendor_max_products IS NULL THEN
    vendor_max_products := 50;
    vendor_name := 'Unknown Vendor';
  END IF;

  -- Check if limit is exceeded
  IF current_product_count >= vendor_max_products THEN
    RAISE EXCEPTION 'Product limit exceeded. Vendor "%" has reached their maximum of % products. Current: %. Please contact support to increase your limit.',
      vendor_name, vendor_max_products, current_product_count;
  END IF;

  -- Allow the insert
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: Create the BEFORE INSERT trigger
-- =====================================================
-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS enforce_product_limit ON products;

-- Create the trigger
CREATE TRIGGER enforce_product_limit
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_product_limit();

-- =====================================================
-- STEP 4: Create RPC function to update vendor limit
-- =====================================================
CREATE OR REPLACE FUNCTION update_vendor_product_limit(
  target_vendor_profile_id UUID,
  new_limit INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  vendor_user_id UUID;
  vendor_id_from_vendors UUID;
BEGIN
  -- Validate limit
  IF new_limit < 1 THEN
    RAISE EXCEPTION 'Product limit must be at least 1';
  END IF;

  IF new_limit > 10000 THEN
    RAISE EXCEPTION 'Product limit cannot exceed 10000';
  END IF;

  -- Update vendor_profiles
  UPDATE vendor_profiles
  SET max_products = new_limit,
      updated_at = NOW()
  WHERE id = target_vendor_profile_id
  RETURNING user_id INTO vendor_user_id;

  IF vendor_user_id IS NULL THEN
    RAISE EXCEPTION 'Vendor profile not found';
  END IF;

  -- Also update vendors table if exists
  UPDATE vendors
  SET max_products = new_limit,
      updated_at = NOW()
  WHERE owner_id = vendor_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 5: Create RPC to get vendor product count
-- =====================================================
CREATE OR REPLACE FUNCTION get_vendor_product_count(target_vendor_profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  vendor_user_id UUID;
  vendor_id_from_vendors UUID;
  product_count INTEGER;
BEGIN
  -- Get user_id from vendor_profiles
  SELECT user_id INTO vendor_user_id
  FROM vendor_profiles
  WHERE id = target_vendor_profile_id;

  IF vendor_user_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Get vendor_id from vendors table
  SELECT id INTO vendor_id_from_vendors
  FROM vendors
  WHERE owner_id = vendor_user_id;

  IF vendor_id_from_vendors IS NULL THEN
    RETURN 0;
  END IF;

  -- Count products
  SELECT COUNT(*) INTO product_count
  FROM products
  WHERE vendor_id = vendor_id_from_vendors;

  RETURN COALESCE(product_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 6: Update get_vendor_profiles_with_users to include product count and limit
-- =====================================================
-- Drop existing function first (required when changing return type)
DROP FUNCTION IF EXISTS get_vendor_profiles_with_users(TEXT);

CREATE OR REPLACE FUNCTION get_vendor_profiles_with_users(status_filter TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  store_name TEXT,
  store_description TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  cover_url TEXT,
  slug TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_email TEXT,
  user_name TEXT,
  sales_channel_link TEXT,
  has_physical_store BOOLEAN,
  registration_notes TEXT,
  max_products INTEGER,
  product_count BIGINT
) AS $$
DECLARE
  rec RECORD;
  vendor_id_lookup UUID;
BEGIN
  FOR rec IN
    SELECT 
      vp.id,
      vp.user_id,
      vp.store_name::TEXT,
      vp.store_description::TEXT,
      vp.phone::TEXT,
      vp.address::TEXT,
      vp.logo_url::TEXT,
      vp.cover_url::TEXT,
      vp.slug::TEXT,
      vp.status::TEXT,
      vp.created_at,
      vp.updated_at,
      u.email::TEXT as user_email,
      COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')::TEXT as user_name,
      vp.sales_channel_link::TEXT,
      vp.has_physical_store,
      vp.registration_notes::TEXT,
      COALESCE(vp.max_products, 50) as max_products
    FROM vendor_profiles vp
    LEFT JOIN auth.users u ON u.id = vp.user_id
    WHERE (status_filter IS NULL OR vp.status = status_filter)
    ORDER BY vp.created_at DESC
  LOOP
    -- Get vendor_id from vendors table
    SELECT v.id INTO vendor_id_lookup
    FROM vendors v
    WHERE v.owner_id = rec.user_id;
    
    -- Return the row with product count
    RETURN QUERY
    SELECT 
      rec.id,
      rec.user_id,
      rec.store_name,
      rec.store_description,
      rec.phone,
      rec.address,
      rec.logo_url,
      rec.cover_url,
      rec.slug,
      rec.status,
      rec.created_at,
      rec.updated_at,
      rec.user_email,
      rec.user_name,
      rec.sales_channel_link,
      rec.has_physical_store,
      rec.registration_notes,
      rec.max_products,
      COALESCE((SELECT COUNT(*) FROM products p WHERE p.vendor_id = vendor_id_lookup), 0)::BIGINT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 7: Grant permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION update_vendor_product_limit(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_vendor_product_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_vendor_profiles_with_users(TEXT) TO authenticated;

-- =====================================================
-- STEP 8: Add indexes for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendors_owner_id ON vendors(owner_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON vendor_profiles(user_id);

-- =====================================================
-- Done! Product limit system is now active.
-- =====================================================
