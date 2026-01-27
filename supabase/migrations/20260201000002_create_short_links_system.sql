-- Create short_links table for URL shortening
CREATE TABLE IF NOT EXISTS public.short_links (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  resource_type TEXT CHECK (resource_type IN ('product', 'store', 'category', 'section')),
  resource_id UUID,
  visits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_short_links_code ON public.short_links(code);
CREATE INDEX IF NOT EXISTS idx_short_links_resource ON public.short_links(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_short_links_original_url ON public.short_links(original_url);

-- Enable RLS
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read short links (for redirect)
DROP POLICY IF EXISTS "Anyone can read short links" ON public.short_links;
CREATE POLICY "Anyone can read short links"
ON public.short_links FOR SELECT
USING (true);

-- Only authenticated users can create short links
DROP POLICY IF EXISTS "Authenticated users can create short links" ON public.short_links;
CREATE POLICY "Authenticated users can create short links"
ON public.short_links FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Function to generate unique short code
CREATE OR REPLACE FUNCTION public.generate_short_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
  code_length INTEGER := 6;
  max_attempts INTEGER := 10;
  attempts INTEGER := 0;
BEGIN
  -- Generate random 6-character code
  LOOP
    result := '';
    FOR i IN 1..code_length LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Check if code already exists
    EXIT WHEN NOT EXISTS (SELECT 1 FROM short_links WHERE code = result);
    
    attempts := attempts + 1;
    IF attempts >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique code after % attempts', max_attempts;
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Function to get or create short link
CREATE OR REPLACE FUNCTION public.get_or_create_short_link(
  p_original_url TEXT,
  p_resource_type TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL
)
RETURNS TABLE(
  code TEXT,
  short_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_code TEXT;
  v_base_url TEXT := 'https://sarraly.app'; -- Update with your actual domain
BEGIN
  -- Check if short link already exists for this URL
  SELECT sl.code INTO v_code
  FROM short_links sl
  WHERE sl.original_url = p_original_url
  LIMIT 1;

  -- If not found, create new short link
  IF v_code IS NULL THEN
    v_code := generate_short_code();
    
    INSERT INTO short_links (code, original_url, resource_type, resource_id)
    VALUES (v_code, p_original_url, p_resource_type, p_resource_id);
  END IF;

  -- Return the code and full short URL
  RETURN QUERY
  SELECT v_code, v_base_url || '/s/' || v_code;
END;
$$;

-- Function to resolve short link and increment visit counter
CREATE OR REPLACE FUNCTION public.resolve_short_link(p_code TEXT)
RETURNS TABLE(
  original_url TEXT,
  resource_type TEXT,
  resource_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Increment visit counter
  UPDATE short_links
  SET visits = visits + 1, updated_at = now()
  WHERE code = p_code;

  -- Return the original URL
  RETURN QUERY
  SELECT sl.original_url, sl.resource_type, sl.resource_id
  FROM short_links sl
  WHERE sl.code = p_code;
END;
$$;
