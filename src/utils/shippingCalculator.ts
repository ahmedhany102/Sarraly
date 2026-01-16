import { supabase } from '@/integrations/supabase/client';

interface CartItem {
    productId: string;
    vendor_id?: string | null;
    is_free_shipping?: boolean;
    quantity: number;
}

interface ShippingResult {
    totalShipping: number;
    breakdown: {
        vendorId: string | null;
        cost: number;
        reason: 'free_product' | 'zone_rate' | 'default_rate';
    }[];
}

/**
 * Calculate shipping cost based on zone-based rates
 * 
 * Algorithm:
 * 1. Group items by vendor_id
 * 2. For each vendor:
 *    - If ANY item has is_free_shipping → vendor cost = 0
 *    - Else if specific rate exists for governorate → use it
 *    - Else → use vendor's default_shipping_cost
 * 3. Sum all vendor costs
 */
export async function calculateShipping(
    cartItems: CartItem[],
    destinationGovernorate: string
): Promise<ShippingResult> {
    const breakdown: ShippingResult['breakdown'] = [];
    let totalShipping = 0;

    // Group items by vendor_id
    const vendorGroups = new Map<string | null, CartItem[]>();

    for (const item of cartItems) {
        const vendorId = item.vendor_id || null;
        if (!vendorGroups.has(vendorId)) {
            vendorGroups.set(vendorId, []);
        }
        vendorGroups.get(vendorId)!.push(item);
    }

    // Process each vendor group
    for (const [vendorId, items] of vendorGroups) {
        // Check if any item has free shipping
        const hasFreeShippingItem = items.some(item => item.is_free_shipping === true);

        if (hasFreeShippingItem) {
            breakdown.push({ vendorId, cost: 0, reason: 'free_product' });
            continue;
        }

        // No vendor = platform products, use default 25
        if (!vendorId) {
            const defaultCost = 25;
            totalShipping += defaultCost;
            breakdown.push({ vendorId: null, cost: defaultCost, reason: 'default_rate' });
            continue;
        }

        // Try to find zone-specific rate
        const { data: zoneRate } = await supabase
            .from('vendor_shipping_rates')
            .select('cost')
            .eq('vendor_id', vendorId)
            .eq('governorate', destinationGovernorate)
            .maybeSingle();

        if (zoneRate) {
            totalShipping += zoneRate.cost;
            breakdown.push({ vendorId, cost: zoneRate.cost, reason: 'zone_rate' });
            continue;
        }

        // Fallback to vendor's default shipping cost
        const { data: vendorProfile } = await supabase
            .from('vendor_profiles')
            .select('default_shipping_cost')
            .eq('id', vendorId)
            .maybeSingle();

        const defaultCost = vendorProfile?.default_shipping_cost ?? 25;
        totalShipping += defaultCost;
        breakdown.push({ vendorId, cost: defaultCost, reason: 'default_rate' });
    }

    return { totalShipping, breakdown };
}

/**
 * Simplified version - returns just the total
 */
export async function getShippingCost(
    cartItems: CartItem[],
    destinationGovernorate: string
): Promise<number> {
    const result = await calculateShipping(cartItems, destinationGovernorate);
    return result.totalShipping;
}

/**
 * Get shipping cost for a single vendor
 */
export async function getVendorShippingCost(
    vendorId: string,
    destinationGovernorate: string,
    hasFreeShippingProduct: boolean = false
): Promise<number> {
    if (hasFreeShippingProduct) {
        return 0;
    }

    // Try zone-specific rate
    const { data: zoneRate } = await supabase
        .from('vendor_shipping_rates')
        .select('cost')
        .eq('vendor_id', vendorId)
        .eq('governorate', destinationGovernorate)
        .maybeSingle();

    if (zoneRate) {
        return zoneRate.cost;
    }

    // Fallback to default
    const { data: vendorProfile } = await supabase
        .from('vendor_profiles')
        .select('default_shipping_cost')
        .eq('id', vendorId)
        .maybeSingle();

    return vendorProfile?.default_shipping_cost ?? 25;
}
