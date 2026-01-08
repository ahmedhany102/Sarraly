import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVendorAds } from '@/hooks/useVendorAds';
import { useVendorContext } from '@/hooks/useVendorContext';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface VendorAdCarouselProps {
    position?: 'top' | 'middle';
}

/**
 * VendorAdCarousel - Rotating ad carousel for vendor stores
 * Supports both horizontal and vertical orientations
 * Uses internal react-router navigation (no external URLs)
 */
const VendorAdCarousel: React.FC<VendorAdCarouselProps> = ({ position = 'top' }) => {
    const { vendorId, vendorSlug } = useVendorContext();
    const { ads, loading } = useVendorAds(vendorId);
    const navigate = useNavigate();
    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    // Filter ads by position (top = position < 10, middle = position >= 10)
    const activeAds = ads.filter(ad => {
        if (position === 'top') {
            return ad.is_active && (ad.position === null || ad.position === undefined || ad.position < 10);
        }
        return ad.is_active && ad.position >= 10;
    });

    // Auto-rotate ads every 5 seconds if multiple ads exist
    useEffect(() => {
        if (activeAds.length > 1) {
            const interval = setInterval(() => {
                setCurrentAdIndex((prev) => (prev + 1) % activeAds.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [activeAds.length]);

    // Handle ad click - INTERNAL NAVIGATION ONLY
    const handleAdClick = (redirectUrl: string | null) => {
        if (!redirectUrl) return;

        // Use react-router navigate for internal routes
        navigate(redirectUrl);
    };

    if (loading) {
        return (
            <div className="w-full mb-6">
                <Card className="relative overflow-hidden rounded-lg shadow-lg">
                    <Skeleton className="w-full h-48 md:h-64" />
                </Card>
            </div>
        );
    }

    if (activeAds.length === 0) {
        return null;
    }

    const currentAd = activeAds[currentAdIndex];
    const isVertical = currentAd.orientation === 'vertical';

    return (
        <div className={`w-full mb-6 ${isVertical ? 'flex justify-center' : ''}`}>
            <Card
                className={`relative overflow-hidden rounded-lg shadow-lg ${isVertical ? 'max-w-[400px]' : 'w-full'
                    }`}
            >
                <div
                    className={`relative w-full ${currentAd.redirect_url ? 'cursor-pointer' : ''} ${isVertical
                            ? 'aspect-[9/16]'
                            : 'h-48 md:h-64 lg:h-80'
                        }`}
                    onClick={() => handleAdClick(currentAd.redirect_url)}
                >
                    <img
                        src={currentAd.image_url}
                        alt={currentAd.title || 'Advertisement'}
                        className="w-full h-full object-cover"
                        loading={currentAdIndex === 0 ? 'eager' : 'lazy'}
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />

                    {/* Title/Description overlay */}
                    {(currentAd.title || currentAd.description) && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                            <div className="p-4 text-white">
                                {currentAd.title && (
                                    <h2 className="text-lg md:text-xl font-bold mb-1">{currentAd.title}</h2>
                                )}
                                {currentAd.description && (
                                    <p className="text-sm opacity-90 line-clamp-2">{currentAd.description}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pagination dots for multiple ads */}
                    {activeAds.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                            {activeAds.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentAdIndex(index);
                                    }}
                                    aria-label={`Go to advertisement ${index + 1}`}
                                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${index === currentAdIndex
                                            ? 'bg-white scale-125'
                                            : 'bg-white/50 hover:bg-white/75'
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default VendorAdCarousel;
