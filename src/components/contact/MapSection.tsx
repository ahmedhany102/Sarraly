import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MapSectionProps {
  settings: any;
}

const MapSection: React.FC<MapSectionProps> = ({ settings }) => {
  const mapUrl = settings?.map_url;
  const locationTitle = settings?.address || 'موقعنا';

  // Only render if map_url exists and is not empty
  if (!mapUrl || mapUrl.trim() === '') {
    return null;
  }

  // Check if it's an embeddable Google Maps URL
  const isEmbeddable = mapUrl.includes('google.com/maps/embed') ||
    mapUrl.includes('maps.google.com') ||
    mapUrl.includes('/embed');

  return (
    <Card className="mt-8 p-6 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="text-sm">فتح في خرائط جوجل</span>
        </a>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          {locationTitle}
        </h2>
      </div>

      {/* Map Container */}
      {isEmbeddable ? (
        <div className="h-80 md:h-96 bg-gray-100 rounded-xl overflow-hidden">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Store Location"
            className="w-full h-full"
          />
        </div>
      ) : (
        // Fallback for non-embeddable URLs - show a clickable card
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center hover:from-primary/10 hover:to-primary/5 transition-colors"
        >
          <div className="text-center">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-gray-600 font-medium">اضغط لفتح الموقع في خرائط جوجل</p>
          </div>
        </a>
      )}
    </Card>
  );
};

export default MapSection;
