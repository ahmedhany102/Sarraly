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

  /**
   * Generate or retrieve cached short link
   */
  const getShortLink = async (): Promise<string | null> => {
    // Return cached short link if already generated
    if (shortUrl) {
      return shortUrl;
    }

    try {
      const result = await ShortLinkService.createShortLink({
        original_url: url,
        resource_type: resourceType,
        resource_id: resourceId
      });

      if (result) {
        setShortUrl(result.short_url);
        return result.short_url;
      }

      return null;
    } catch (error) {
      console.error('Error generating short link:', error);
      return null;
    }
  };

  /**
   * Handle "Copy Short Link" action
   */
  const handleCopyShortLink = async () => {
    setLoading(true);

    try {
      const link = await getShortLink();

      if (!link) {
        toast.error(language === 'ar' ? 'فشل إنشاء الرابط المختصر' : 'Failed to create short link');
        setLoading(false);
        return;
      }

      const success = await ShortLinkService.copyToClipboard(link);

      if (success) {
        setCopied(true);
        toast.success(language === 'ar' ? 'تم نسخ الرابط المختصر' : 'Short link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error(language === 'ar' ? 'فشل نسخ الرابط' : 'Failed to copy link');
      }
    } catch (error) {
      console.error('Copy short link error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle "Copy Full Link" action
   */
  const handleCopyFullLink = async () => {
    setLoading(true);

    try {
      const fullUrl = `${window.location.origin}${url}`;
      const success = await ShortLinkService.copyToClipboard(fullUrl);

      if (success) {
        setCopied(true);
        toast.success(language === 'ar' ? 'تم نسخ الرابط الكامل' : 'Full link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error(language === 'ar' ? 'فشل نسخ الرابط' : 'Failed to copy link');
      }
    } catch (error) {
      console.error('Copy full link error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle "Share via..." (Native Share) action
   * CRITICAL: This MUST share the SHORT LINK, not the full URL
   */
  const handleNativeShare = async () => {
    setLoading(true);

    try {
      // Step 1: Generate/Get the short link
      const link = await getShortLink();

      if (!link) {
        toast.error(language === 'ar' ? 'فشل إنشاء الرابط للمشاركة' : 'Failed to create shareable link');
        setLoading(false);
        return;
      }

      // Step 2: Share the SHORT LINK using native share API
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: language === 'ar' 
            ? `تحقق من: ${title}` 
            : `Check out: ${title}`,
          url: link // ✅ SHARES THE SHORT LINK (e.g., sarraly.app/s/xyz)
        });

        toast.success(language === 'ar' ? 'تم المشاركة بنجاح' : 'Shared successfully');
      } else {
        // Fallback: If native share not available, copy short link
        const success = await ShortLinkService.copyToClipboard(link);
        
        if (success) {
          toast.success(
            language === 'ar' 
              ? 'الرابط المختصر تم نسخه (المشاركة غير متاحة)' 
              : 'Short link copied (sharing not available)'
          );
        }
      }
    } catch (error: any) {
      // User cancelled the share dialog (not an error)
      if (error.name === 'AbortError') {
        console.log('User cancelled share');
        return;
      }

      console.error('Native share error:', error);
      toast.error(language === 'ar' ? 'فشلت المشاركة' : 'Share failed');
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

      <DropdownMenuContent align="end" className="w-56">
        {/* Copy Short Link */}
        <DropdownMenuItem onClick={handleCopyShortLink} disabled={loading}>
          <Link2 className="w-4 h-4 me-2" />
          {language === 'ar' ? 'نسخ رابط مختصر' : 'Copy Short Link'}
        </DropdownMenuItem>

        {/* Copy Full Link */}
        <DropdownMenuItem onClick={handleCopyFullLink} disabled={loading}>
          <Copy className="w-4 h-4 me-2" />
          {language === 'ar' ? 'نسخ الرابط الكامل' : 'Copy Full Link'}
        </DropdownMenuItem>

        {/* Native Share (with SHORT LINK) */}
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare} disabled={loading}>
            <Share2 className="w-4 h-4 me-2" />
            {language === 'ar' ? 'مشاركة عبر...' : 'Share via...'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
