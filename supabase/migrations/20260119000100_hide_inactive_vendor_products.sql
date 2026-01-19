-- Migration: Hide products from inactive/deactivated vendors in marketplace
-- This ensures products only appear if their vendor has status = 'active'

-- ============================================
-- 1. Fix get_products_with_vendor RPC (list view)
-- ============================================
DROP FUNCTION IF EXISTS public.get_products_with_vendor(uuid, text, integer);

CREATE OR REPLACE FUNCTION public.get_products_with_vendor(
  _category_id uuid DEFAULT NULL,
  _search_query text DEFAULT NULL,
  _limit integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  price numeric,
  discount numeric,
  main_image text,
  image_url text,
  images jsonb,
  colors jsonb,
  sizes jsonb,
  stock integer,
  inventory integer,
  featured boolean,
  status text,
  category_id uuid,
  vendor_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  rating numeric,
  vendor_name text,
  vendor_logo_url text,
  vendor_slug text,
  user_id uuid,
  is_free_shipping boolean,
  is_fast_shipping boolean,
  is_best_seller boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.discount,
    p.main_image,
    p.image_url,
    p.images,
    p.colors,
    p.sizes,
    COALESCE(p.stock, 0)::integer as stock,
    COALESCE(p.inventory, 0)::integer as inventory,
    COALESCE(p.featured, false) as featured,
    p.status,
    p.category_id,
    p.vendor_id,
    p.created_at,
    p.updated_at,
    p.rating,
    v.name as vendor_name,
    v.logo_url as vendor_logo_url,
    v.slug as vendor_slug,
    p.user_id,
    COALESCE(p.is_free_shipping, false) as is_free_shipping,
    COALESCE(p.is_fast_shipping, false) as is_fast_shipping,
    COALESCE(p.is_best_seller, false) as is_best_seller
  FROM products p
  -- CRITICAL: INNER JOIN ensures products only appear if vendor is active
  INNER JOIN vendors v ON v.id = p.vendor_id AND v.status = 'active'
  WHERE COALESCE(p.status, 'active') IN ('active', 'approved')
    AND (_category_id IS NULL OR p.category_id = _category_id)
    AND (_search_query IS NULL OR p.name ILIKE '%' || _search_query || '%')
  ORDER BY p.created_at DESC
  LIMIT _limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_products_with_vendor(uuid, text, integer) TO authenticated, anon;

-- ============================================
-- 2. Fix get_product_with_vendor RPC (single product view)
-- ============================================
DROP FUNCTION IF EXISTS public.get_product_with_vendor(uuid);

CREATE OR REPLACE FUNCTION public.get_product_with_vendor(p_product_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  price numeric,
  category text,
  category_id uuid,
  main_image text,
  image_url text,
  images jsonb,
  colors jsonb,
  sizes jsonb,
  discount numeric,
  featured boolean,
  stock integer,
  inventory integer,
  status text,
  user_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  vendor_id uuid,
  vendor_slug text,
  vendor_store_name text,
  vendor_logo_url text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.category,
    p.category_id,
    p.main_image,
    p.image_url,
    p.images,
    p.colors,
    p.sizes,
    p.discount,
    p.featured,
    p.stock,
    p.inventory,
    p.status,
    p.user_id,
    p.created_at,
    p.updated_at,
    v.id as vendor_id,
    v.slug as vendor_slug,
    COALESCE(v.name, vp.store_name, pr.name, 'المتجر الرئيسي') as vendor_store_name,
    COALESCE(v.logo_url, vp.logo_url) as vendor_logo_url
  FROM public.products p
  LEFT JOIN public.vendors v ON v.id = p.vendor_id
  LEFT JOIN public.vendor_profiles vp ON vp.user_id = p.user_id
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.id = p_product_id
    AND (p.status IN ('active', 'approved') OR p.user_id = auth.uid() OR is_admin(auth.uid()))
    -- CRITICAL: Only show product if vendor is active (or if user is the owner/admin)
    AND (v.status = 'active' OR v.id IS NULL OR p.user_id = auth.uid() OR is_admin(auth.uid()));
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_product_with_vendor(uuid) TO authenticated, anon;
