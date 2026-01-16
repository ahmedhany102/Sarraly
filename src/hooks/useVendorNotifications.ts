import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Vendor order notifications using POLLING (more reliable than Realtime)
 * Checks for new orders every 30 seconds
 */
export function useVendorNotifications() {
    const { user } = useAuth();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUnlockedRef = useRef<boolean>(false);
    const lastCheckedAtRef = useRef<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize notification sound
    useEffect(() => {
        try {
            audioRef.current = new Audio('/notification.wav');
            audioRef.current.volume = 0.5;
            audioRef.current.preload = 'auto';
            console.log('🔊 Audio element created: /notification.wav');
        } catch (e) {
            console.error('❌ Failed to create audio element:', e);
        }
    }, []);

    // Unlock audio on first user interaction (bypass autoplay policy)
    useEffect(() => {
        const unlockAudio = () => {
            if (audioUnlockedRef.current || !audioRef.current) return;

            audioRef.current.play()
                .then(() => {
                    audioRef.current?.pause();
                    audioRef.current!.currentTime = 0;
                    audioUnlockedRef.current = true;
                    console.log('🔓 Audio unlocked via user interaction');
                    document.removeEventListener('click', unlockAudio);
                    document.removeEventListener('touchstart', unlockAudio);
                    document.removeEventListener('keydown', unlockAudio);
                })
                .catch(() => { });
        };

        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        document.addEventListener('keydown', unlockAudio);

        return () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        };
    }, []);

    const playNotificationSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((error) => {
                if (error.name === 'NotAllowedError') {
                    console.warn('🔇 Audio blocked by browser. User interaction required first.');
                } else {
                    console.error('❌ Audio playback failed:', error.name, error.message);
                }
            });
        }
    }, []);

    const checkForNewOrders = useCallback(async (vendorId: string) => {
        try {
            // Build query for new order items
            let query = supabase
                .from('order_items')
                .select('id, created_at, product_name, quantity, total_price')
                .eq('vendor_id', vendorId)
                .order('created_at', { ascending: false })
                .limit(5);

            // Only get items after last check
            if (lastCheckedAtRef.current) {
                query = query.gt('created_at', lastCheckedAtRef.current);
            }

            const { data: newItems, error } = await query;

            if (error) {
                console.error('❌ Error checking for new orders:', error);
                return;
            }

            // First run - just set the baseline
            if (!lastCheckedAtRef.current) {
                if (newItems && newItems.length > 0) {
                    lastCheckedAtRef.current = newItems[0].created_at;
                } else {
                    lastCheckedAtRef.current = new Date().toISOString();
                }
                console.log('📌 Baseline set:', lastCheckedAtRef.current);
                return;
            }

            // Process new orders
            if (newItems && newItems.length > 0) {
                console.log(`🎉 ${newItems.length} new order(s) found!`);

                // Show notification for each new order (max 3)
                const toShow = newItems.slice(0, 3);
                toShow.forEach((item, index) => {
                    setTimeout(() => {
                        toast.success(
                            `🎉 طلب جديد!`,
                            {
                                description: item.product_name
                                    ? `${item.product_name} (${item.quantity || 1}x)`
                                    : 'تم استلام طلب جديد - تفقد لوحة التحكم',
                                duration: 8000,
                                action: {
                                    label: 'عرض الطلبات',
                                    onClick: () => window.location.href = '/vendor/dashboard?tab=orders'
                                }
                            }
                        );
                    }, index * 500); // Stagger toasts
                });

                // Play sound once
                playNotificationSound();

                // Update last checked to newest item
                lastCheckedAtRef.current = newItems[0].created_at;
            }
        } catch (err) {
            console.error('❌ Polling error:', err);
        }
    }, [playNotificationSound]);

    // Start polling
    useEffect(() => {
        // Only poll for vendors
        if (!user?.id || user.role === 'USER') {
            return;
        }

        const vendorId = user.id;
        console.log('🔔 Starting order polling for vendor:', vendorId);

        // Initial check (sets baseline)
        checkForNewOrders(vendorId);

        // Poll every 30 seconds
        intervalRef.current = setInterval(() => {
            console.log('🔄 Polling for new orders...');
            checkForNewOrders(vendorId);
        }, 30000);

        // Cleanup
        return () => {
            console.log('🔕 Stopping order polling');
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [user?.id, user?.role, checkForNewOrders]);

    return null;
}

export default useVendorNotifications;
