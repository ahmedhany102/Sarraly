import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Link2, Copy, Check, Loader2 } from 'lucide-react';
import { ShortLinkService } from '@/services/shortLinkService';
import { toast } from 'sonner';
import { useLanguageSafe } from '@/contexts/LanguageContext';

interface ShareButtonProps {
  url: string;
  title: string;
  resourceType?: 'product' | 'store' | 'category' | 'section';
  resourceId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  resourceType,
  resourceId,
  variant = 'outline',
  size = 'default',
  showLabel = true
}) => {
  const { language } = useLanguageSafe();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);

  const handleShare = async (method: 'short' | 'full' | 'native') => {
    setLoading(true);

    try {
      let urlToShare = window.location.origin + url;

      // If short link requested, generate it
      if (method === 'short') {
        if (shortUrl) {
          urlToShare = shortUrl;
        } else {
          const result = await ShortLinkService.createShortLink({
            original_url: url,
            resource_type: resourceType,
            resource_id: resourceId
          });

          if (result) {
            urlToShare = result.short_url;
            setShortUrl(result.short_url);
          } else {
            toast.error(language === 'ar' ? 'فشل إنشاء الرابط المختصر' : 'Failed to create short link');
            setLoading(false);
            return;
          }
        }
      }

      // Native share API
      if (method === 'native' && navigator.share) {
        await navigator.share({
          title: title,
          text: language === 'ar' ? `تحقق من: ${title}` : `Check out: ${title}`,
          url: urlToShare
        });
        toast.success(language === 'ar' ? 'تم المشاركة' : 'Shared successfully');
      } else {
        // Copy to clipboard
        const success = await ShortLinkService.copyToClipboard(urlToShare);
        
        if (success) {
          setCopied(true);
          toast.success(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied to clipboard');
          setTimeout(() => setCopied(false), 2000);
        } else {
          toast.error(language === 'ar' ? 'فشل نسخ الرابط' : 'Failed to copy link');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          {showLabel && size !== 'icon' && (
            <span className="ms-2">
              {language === 'ar' ? 'مشاركة' : 'Share'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleShare('short')}>
          <Link2 className="w-4 h-4 me-2" />
          {language === 'ar' ? 'نسخ رابط مختصر' : 'Copy Short Link'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('full')}>
          <Copy className="w-4 h-4 me-2" />
          {language === 'ar' ? 'نسخ الرابط الكامل' : 'Copy Full Link'}
        </DropdownMenuItem>
        {navigator.share && (
          <DropdownMenuItem onClick={() => handleShare('native')}>
            <Share2 className="w-4 h-4 me-2" />
            {language === 'ar' ? 'مشاركة عبر...' : 'Share via...'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
