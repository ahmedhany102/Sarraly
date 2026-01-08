import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VendorFooterSettings {
    id?: string;
    vendor_id: string;
    whatsapp_link: string | null;
    facebook_link: string | null;
    instagram_link: string | null;
    email: string | null;
    privacy_policy: string | null;
    return_policy: string | null;
    show_home_link: boolean;
    show_cart_link: boolean;
    show_profile_link: boolean;
    show_orders_link: boolean;
}

const defaultSettings: Omit<VendorFooterSettings, 'vendor_id'> = {
    whatsapp_link: null,
    facebook_link: null,
    instagram_link: null,
    email: null,
    privacy_policy: null,
    return_policy: null,
    show_home_link: true,
    show_cart_link: true,
    show_profile_link: true,
    show_orders_link: true,
};

export const useVendorFooter = (vendorId: string | undefined) => {
    const [settings, setSettings] = useState<VendorFooterSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch footer settings
    const fetchSettings = useCallback(async () => {
        if (!vendorId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('vendor_footer_settings')
                .select('*')
                .eq('vendor_id', vendorId)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 = no rows returned (not an error, just no settings yet)
                console.error('Error fetching vendor footer settings:', error);
            }

            if (data) {
                setSettings(data as VendorFooterSettings);
            } else {
                // Return default settings if none exist
                setSettings({ vendor_id: vendorId, ...defaultSettings });
            }
        } catch (err) {
            console.error('Exception fetching footer settings:', err);
        } finally {
            setLoading(false);
        }
    }, [vendorId]);

    // Save/update footer settings
    const saveSettings = async (updates: Partial<VendorFooterSettings>) => {
        if (!vendorId) {
            toast.error('Vendor ID is required');
            return false;
        }

        try {
            setSaving(true);

            const settingsToSave = {
                vendor_id: vendorId,
                whatsapp_link: updates.whatsapp_link ?? settings?.whatsapp_link ?? null,
                facebook_link: updates.facebook_link ?? settings?.facebook_link ?? null,
                instagram_link: updates.instagram_link ?? settings?.instagram_link ?? null,
                email: updates.email ?? settings?.email ?? null,
                privacy_policy: updates.privacy_policy ?? settings?.privacy_policy ?? null,
                return_policy: updates.return_policy ?? settings?.return_policy ?? null,
                show_home_link: updates.show_home_link ?? settings?.show_home_link ?? true,
                show_cart_link: updates.show_cart_link ?? settings?.show_cart_link ?? true,
                show_profile_link: updates.show_profile_link ?? settings?.show_profile_link ?? true,
                show_orders_link: updates.show_orders_link ?? settings?.show_orders_link ?? true,
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from('vendor_footer_settings')
                .upsert(settingsToSave, { onConflict: 'vendor_id' })
                .select()
                .single();

            if (error) {
                console.error('Error saving footer settings:', error);
                toast.error('فشل في حفظ إعدادات الفوتر');
                return false;
            }

            setSettings(data as VendorFooterSettings);
            toast.success('تم حفظ إعدادات الفوتر بنجاح');
            return true;
        } catch (err) {
            console.error('Exception saving footer settings:', err);
            toast.error('حدث خطأ أثناء حفظ الإعدادات');
            return false;
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        loading,
        saving,
        saveSettings,
        refetch: fetchSettings,
    };
};
