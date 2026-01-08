
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAds } from '@/hooks/useSupabaseAds';
import { Card } from './ui/card';

interface Ad {
  id: string;
  title?: string;
  image_url: string;
  redirect_url?: string;
  description?: string;
  position: number;
  is_active: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const AdCarousel: React.FC = () => {
  const { ads, loading } = useSupabaseAds();
  const navigate = useNavigate();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Filter only active hero ads (position 0-9)
  const activeAds = ads.filter(ad => ad.is_active && (ad.position === null || ad.position === undefined || ad.position < 10));

  // Auto-rotate ads every 5 seconds if multiple ads exist
  useEffect(() => {
    if (activeAds.length > 1) {
      console.log('🔄 Starting ad rotation with', activeAds.length, 'ads');
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => {
          const newIndex = (prev + 1) % activeAds.length;
          console.log('🎬 Rotating to ad index:', newIndex);
          return newIndex;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeAds.length]);

  // Handle ad click - INTERNAL NAVIGATION ONLY
  const handleAdClick = (ad: Ad) => {
    if (ad.redirect_url) {
      console.log('🔗 Navigating to:', ad.redirect_url);
      navigate(ad.redirect_url);
    }
  };

  // Reserve space during loading to prevent CLS
  if (loading) {
    console.log('⏳ Showing ad carousel placeholder while loading');
    return (
      <div className="w-full mb-6">
        <Card className="relative overflow-hidden rounded-lg shadow-lg bg-gradient-to-r from-green-50 to-green-100">
          <div className="relative h-48 md:h-64 lg:h-80 w-full" aria-hidden="true" />
        </Card>
      </div>
    );
  }

  // Don't render anything if no active ads after loading
  if (activeAds.length === 0) {
    console.log('🚫 Not showing ad carousel - no active ads');
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
          onClick={() => handleAdClick(currentAd)}
        >
          <img
            src={currentAd.image_url}
            alt={currentAd.title || 'Advertisement'}
            className="w-full h-full object-cover"
            loading={currentAdIndex === 0 ? 'eager' : 'lazy'}
            onError={(e) => {
              console.error('Failed to load ad image:', currentAd.image_url);
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

export default AdCarousel;
