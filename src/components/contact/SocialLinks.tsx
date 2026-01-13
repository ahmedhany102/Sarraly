
import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SocialLinksProps {
  settings: any;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ settings }) => {
  const facebook = settings?.facebook;
  const instagram = settings?.instagram;
  const twitter = settings?.twitter;
  const youtube = settings?.youtube;

  const hasSocialLinks = facebook || instagram || twitter || youtube;

  if (!hasSocialLinks) return null;

  return (
    <Card className="mt-4 p-4 rounded-xl bg-muted/50">
      <h3 className="text-lg font-bold mb-4 text-right">تابعنا</h3>
      <div className="flex gap-3 justify-end flex-wrap">
        {facebook && (
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-11 h-11 bg-primary hover:bg-primary/80 text-white rounded-full transition-all shadow-md hover:shadow-lg"
            title="Facebook"
          >
            <Facebook size={20} />
          </a>
        )}
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-11 h-11 bg-primary hover:bg-primary/80 text-white rounded-full transition-all shadow-md hover:shadow-lg"
            title="Instagram"
          >
            <Instagram size={20} />
          </a>
        )}
        {twitter && (
          <a
            href={twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-11 h-11 bg-primary hover:bg-primary/80 text-white rounded-full transition-all shadow-md hover:shadow-lg"
            title="Twitter"
          >
            <Twitter size={20} />
          </a>
        )}
        {youtube && (
          <a
            href={youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-11 h-11 bg-primary hover:bg-primary/80 text-white rounded-full transition-all shadow-md hover:shadow-lg"
            title="YouTube"
          >
            <Youtube size={20} />
          </a>
        )}
      </div>
    </Card>
  );
};

export default SocialLinks;
