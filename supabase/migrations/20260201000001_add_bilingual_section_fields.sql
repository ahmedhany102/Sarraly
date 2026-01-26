-- Add bilingual fields to sections table if they don't exist
ALTER TABLE public.sections 
ADD COLUMN IF NOT EXISTS title_en text,
ADD COLUMN IF NOT EXISTS subtitle text,
ADD COLUMN IF NOT EXISTS subtitle_en text;

-- Update get_sections_by_scope to include bilingual fields
DROP FUNCTION IF EXISTS public.get_sections_by_scope(text, uuid);

CREATE OR REPLACE FUNCTION public.get_sections_by_scope(
  _scope text DEFAULT 'global',
  _vendor_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  title text,
  title_en text,
  subtitle text,
  subtitle_en text,
  type text,
  scope text,
  vendor_id uuid,
  sort_order integer,
  is_active boolean,
  slug text,
  config jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.title_en,
    s.subtitle,
    s.subtitle_en,
    s.type,
    s.scope,
    s.vendor_id,
    s.sort_order,
    s.is_active,
    s.slug,
    s.config
  FROM sections s
  WHERE 
    s.is_active = true
    AND s.scope = _scope
    AND (
      (_scope = 'global' AND s.vendor_id IS NULL)
      OR (_scope = 'vendor' AND s.vendor_id = _vendor_id)
    )
  ORDER BY s.sort_order ASC;
END;
$$;
