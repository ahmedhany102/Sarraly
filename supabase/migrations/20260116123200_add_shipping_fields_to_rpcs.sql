-- Migration: Add user_id and is_free_shipping to all section RPC functions
-- These fields are CRITICAL for shipping calculation

-- Drop and recreate get_last_viewed_products with shipping fields
DROP FUNCTION IF EXISTS public.get_last_viewed_products(uuid, integer, uuid);

CREATE OR REPLACE FUNCTION public.get_last_viewed_products(
  _user_id uuid,
  _limit integer DEFAULT 8,
  _vendor_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  name text,
  price numeric,
  discount numeric,
  image_url text,
  rating numeric,
  stock integer,
  inventory integer,
  vendor_name text,
  vendor_logo_url text,
  vendor_slug text,
  -- NEW: Shipping fields
  user_id uuid,
  is_free_shipping boolean,
  is_fast_shipping boolean
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
    p.price,
    p.discount,
    COALESCE(p.main_image, p.image_url) as image_url,
    p.rating,
    COALESCE(p.stock, 0)::integer as stock,
    COALESCE(p.inventory, 0)::integer as inventory,
    v.name as vendor_name,
    v.logo_url as vendor_logo_url,
    v.slug as vendor_slug,
    -- NEW: Shipping fields
    p.user_id,
    COALESCE(p.is_free_shipping, false) as is_free_shipping,
    COALESCE(p.is_fast_shipping, false) as is_fast_shipping
  FROM product_views pv
  INNER JOIN products p ON p.id = pv.product_id
  LEFT JOIN vendors v ON v.id = p.vendor_id AND v.status = 'active'
  WHERE pv.user_id = _user_id
    AND COALESCE(p.status, 'active') IN ('active', 'approved')
    AND (_vendor_id IS NULL OR p.vendor_id = _vendor_id)
  ORDER BY pv.viewed_at DESC
  LIMIT _limit;
END;
$$;

-- Drop and recreate get_similar_products with shipping fields
DROP FUNCTION IF EXISTS public.get_similar_products(uuid, integer);

CREATE OR REPLACE FUNCTION public.get_similar_products(
  _product_id uuid,
  _limit integer DEFAULT 8
)
RETURNS TABLE(
  id uuid,
  name text,
  price numeric,
  discount numeric,
  image_url text,
  rating numeric,
  stock integer,
  inventory integer,
  vendor_name text,
  vendor_logo_url text,
  vendor_slug text,
  -- NEW: Shipping fields
  user_id uuid,
  is_free_shipping boolean,
  is_fast_shipping boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _category_id uuid;
BEGIN
  SELECT p.category_id INTO _category_id
  FROM products p
  WHERE p.id = _product_id;

  IF _category_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.price,
    p.discount,
    COALESCE(p.main_image, p.image_url) as image_url,
    p.rating,
    COALESCE(p.stock, 0)::integer as stock,
    COALESCE(p.inventory, 0)::integer as inventory,
    v.name as vendor_name,
    v.logo_url as vendor_logo_url,
    v.slug as vendor_slug,
    -- NEW: Shipping fields
    p.user_id,
    COALESCE(p.is_free_shipping, false) as is_free_shipping,
    COALESCE(p.is_fast_shipping, false) as is_fast_shipping
  FROM products p
  LEFT JOIN vendors v ON v.id = p.vendor_id AND v.status = 'active'
  WHERE p.category_id = _category_id
    AND p.id != _product_id
    AND COALESCE(p.status, 'active') IN ('active', 'approved')
  ORDER BY p.rating DESC NULLS LAST, p.created_at DESC
  LIMIT _limit;
END;
$$;

-- Drop and recreate get_vendor_more_products with shipping fields
DROP FUNCTION IF EXISTS public.get_vendor_more_products(uuid, uuid, integer);

CREATE OR REPLACE FUNCTION public.get_vendor_more_products(
  _product_id uuid,
  _vendor_id uuid,
  _limit integer DEFAULT 8
)
RETURNS TABLE(
  id uuid,
  name text,
  price numeric,
  discount numeric,
  image_url text,
  rating numeric,
  stock integer,
  inventory integer,
  vendor_name text,
  vendor_logo_url text,
  vendor_slug text,
  -- NEW: Shipping fields
  user_id uuid,
  is_free_shipping boolean,
  is_fast_shipping boolean
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
    p.price,
    p.discount,
    COALESCE(p.main_image, p.image_url) as image_url,
    p.rating,
    COALESCE(p.stock, 0)::integer as stock,
    COALESCE(p.inventory, 0)::integer as inventory,
    v.name as vendor_name,
    v.logo_url as vendor_logo_url,
    v.slug as vendor_slug,
    -- NEW: Shipping fields
    p.user_id,
    COALESCE(p.is_free_shipping, false) as is_free_shipping,
    COALESCE(p.is_fast_shipping, false) as is_fast_shipping
  FROM products p
  LEFT JOIN vendors v ON v.id = p.vendor_id AND v.status = 'active'
  WHERE p.vendor_id = _vendor_id
    AND p.id != _product_id
    AND COALESCE(p.status, 'active') IN ('active', 'approved')
  ORDER BY p.rating DESC NULLS LAST, p.created_at DESC
  LIMIT _limit;
END;
$$;

-- Drop and recreate get_section_products with shipping fields
DROP FUNCTION IF EXISTS public.get_section_products(uuid, integer);

CREATE OR REPLACE FUNCTION public.get_section_products(
  _section_id uuid,
  _limit integer DEFAULT 20
)
RETURNS TABLE(
  id uuid,
  name text,
  price numeric,
  discount numeric,
  image_url text,
  rating numeric,
  stock integer,
  inventory integer,
  sort_order integer,
  vendor_name text,
  vendor_logo_url text,
  vendor_slug text,
  -- NEW: Shipping fields
  user_id uuid,
  is_free_shipping boolean,
  is_fast_shipping boolean
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
    p.price,
    p.discount,
    COALESCE(p.main_image, p.image_url) as image_url,
    p.rating,
    COALESCE(p.stock, 0)::integer as stock,
    COALESCE(p.inventory, 0)::integer as inventory,
    sp.sort_order,
    v.name as vendor_name,
    v.logo_url as vendor_logo_url,
    v.slug as vendor_slug,
    -- NEW: Shipping fields
    p.user_id,
    COALESCE(p.is_free_shipping, false) as is_free_shipping,
    COALESCE(p.is_fast_shipping, false) as is_fast_shipping
  FROM section_products sp
  INNER JOIN products p ON p.id = sp.product_id
  LEFT JOIN vendors v ON v.id = p.vendor_id AND v.status = 'active'
  WHERE sp.section_id = _section_id
    AND COALESCE(p.status, 'active') IN ('active', 'approved')
  ORDER BY sp.sort_order ASC
  LIMIT _limit;
END;
$$;

-- Drop and recreate get_best_seller_products with shipping fields
DROP FUNCTION IF EXISTS public.get_best_seller_products(integer, uuid);

CREATE OR REPLACE FUNCTION public.get_best_seller_products(
  _limit integer DEFAULT 20,
  _vendor_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  name text,
  price numeric,
  discount numeric,
  image_url text,
  rating numeric,
  stock integer,
  inventory integer,
  vendor_name text,
  vendor_logo_url text,
  vendor_slug text,
  -- NEW: Shipping fields
  user_id uuid,
  is_free_shipping boolean,
  is_fast_shipping boolean
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
    p.price,
    p.discount,
    COALESCE(p.main_image, p.image_url) as image_url,
    p.rating,
    COALESCE(p.stock, 0)::integer as stock,
    COALESCE(p.inventory, 0)::integer as inventory,
    v.name as vendor_name,
    v.logo_url as vendor_logo_url,
    v.slug as vendor_slug,
    -- NEW: Shipping fields
    p.user_id,
    COALESCE(p.is_free_shipping, false) as is_free_shipping,
    COALESCE(p.is_fast_shipping, false) as is_fast_shipping
  FROM products p
  LEFT JOIN vendors v ON v.id = p.vendor_id AND v.status = 'active'
  WHERE p.is_best_seller = true
    AND COALESCE(p.status, 'active') IN ('active', 'approved')
    AND (_vendor_id IS NULL OR p.vendor_id = _vendor_id)
  ORDER BY p.rating DESC NULLS LAST, p.created_at DESC
  LIMIT _limit;
END;
$$;

-- Drop and recreate get_hot_deals_products with shipping fields
DROP FUNCTION IF EXISTS public.get_hot_deals_products(integer, uuid);

CREATE OR REPLACE FUNCTION public.get_hot_deals_products(
  _limit integer DEFAULT 20,
  _vendor_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  name text,
  price numeric,
  discount numeric,
  image_url text,
  rating numeric,
  stock integer,
  inventory integer,
  vendor_name text,
  vendor_logo_url text,
  vendor_slug text,
  -- NEW: Shipping fields
  user_id uuid,
  is_free_shipping boolean,
  is_fast_shipping boolean
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
    p.price,
    p.discount,
    COALESCE(p.main_image, p.image_url) as image_url,
    p.rating,
    COALESCE(p.stock, 0)::integer as stock,
    COALESCE(p.inventory, 0)::integer as inventory,
    v.name as vendor_name,
    v.logo_url as vendor_logo_url,
    v.slug as vendor_slug,
    -- NEW: Shipping fields
    p.user_id,
    COALESCE(p.is_free_shipping, false) as is_free_shipping,
    COALESCE(p.is_fast_shipping, false) as is_fast_shipping
  FROM products p
  LEFT JOIN vendors v ON v.id = p.vendor_id AND v.status = 'active'
  WHERE (p.is_hot_deal = true OR (p.discount IS NOT NULL AND p.discount > 0))
    AND COALESCE(p.status, 'active') IN ('active', 'approved')
    AND (_vendor_id IS NULL OR p.vendor_id = _vendor_id)
  ORDER BY p.discount DESC NULLS LAST, p.created_at DESC
  LIMIT _limit;
END;
$$;

-- Drop and recreate get_products_by_category with shipping fields
DROP FUNCTION IF EXISTS public.get_products_by_category(uuid, uuid, integer, integer);

CREATE OR REPLACE FUNCTION public.get_products_by_category(
  _category_id uuid,
  _exclude_product_id uuid DEFAULT NULL,
  _limit integer DEFAULT 20,
  _offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  name text,
  price numeric,
  discount numeric,
  image_url text,
  rating numeric,
  stock integer,
  inventory integer,
  vendor_name text,
  vendor_logo_url text,
  vendor_slug text,
  -- NEW: Shipping fields
  user_id uuid,
  is_free_shipping boolean,
  is_fast_shipping boolean
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
    p.price,
    p.discount,
    COALESCE(p.main_image, p.image_url) as image_url,
    p.rating,
    COALESCE(p.stock, 0)::integer as stock,
    COALESCE(p.inventory, 0)::integer as inventory,
    v.name as vendor_name,
    v.logo_url as vendor_logo_url,
    v.slug as vendor_slug,
    -- NEW: Shipping fields
    p.user_id,
    COALESCE(p.is_free_shipping, false) as is_free_shipping,
    COALESCE(p.is_fast_shipping, false) as is_fast_shipping
  FROM products p
  LEFT JOIN vendors v ON v.id = p.vendor_id AND v.status = 'active'
  WHERE p.category_id = _category_id
    AND (_exclude_product_id IS NULL OR p.id != _exclude_product_id)
    AND COALESCE(p.status, 'active') IN ('active', 'approved')
  ORDER BY p.rating DESC NULLS LAST, p.created_at DESC
  LIMIT _limit
  OFFSET _offset;
END;
$$;

-- Also update get_products_with_vendor RPC to include is_free_shipping
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
  -- Shipping fields
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
    -- Shipping fields
    p.user_id,
    COALESCE(p.is_free_shipping, false) as is_free_shipping,
    COALESCE(p.is_fast_shipping, false) as is_fast_shipping,
    COALESCE(p.is_best_seller, false) as is_best_seller
  FROM products p
  LEFT JOIN vendors v ON v.id = p.vendor_id AND v.status = 'active'
  WHERE COALESCE(p.status, 'active') IN ('active', 'approved')
    AND (_category_id IS NULL OR p.category_id = _category_id)
    AND (_search_query IS NULL OR p.name ILIKE '%' || _search_query || '%')
  ORDER BY p.created_at DESC
  LIMIT _limit;
END;
$$;
