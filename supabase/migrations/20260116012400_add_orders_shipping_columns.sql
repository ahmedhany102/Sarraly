-- Add shipping fields to orders table
-- This allows storing the calculated shipping cost and destination for each order

-- Step 1: Add shipping_cost column to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS shipping_cost numeric DEFAULT 0;

-- Step 2: Add governorate column to orders (for zone-based lookup)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS governorate text;

-- Step 3: Ensure subtotal column exists (product total before shipping)
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0;

-- Step 4: Update any existing orders to have subtotal = total_amount (backwards compat)
UPDATE public.orders
SET subtotal = total_amount
WHERE subtotal IS NULL OR subtotal = 0;

-- Step 5: Add index for governorate lookups
CREATE INDEX IF NOT EXISTS idx_orders_governorate ON public.orders(governorate);
