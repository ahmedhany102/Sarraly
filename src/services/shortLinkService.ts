import { supabase } from '@/integrations/supabase/client';
import { ShortLink, CreateShortLinkRequest, ShortLinkResponse } from '@/types/shortLink';

const BASE_URL = import.meta.env.VITE_APP_URL || 'https://sarraly.app';

export class ShortLinkService {
  /**
   * Generate a short link for a given URL
   * If the URL already has a short link, returns the existing one
   */
  static async createShortLink(request: CreateShortLinkRequest): Promise<ShortLinkResponse | null> {
    try {
      console.log('🔗 Creating short link for:', request.original_url);

      // Call the RPC function to get or create short link
      const { data, error } = await supabase.rpc('get_or_create_short_link', {
        p_original_url: request.original_url,
        p_resource_type: request.resource_type || null,
        p_resource_id: request.resource_id || null
      });

      if (error) {
        console.error('❌ Error creating short link:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.error('❌ No data returned from RPC');
        return null;
      }

      const result = data[0];
      console.log('✅ Short link created:', result);

      return {
        code: result.code,
        short_url: result.short_url,
        original_url: request.original_url
      };
    } catch (error) {
      console.error('💥 Exception creating short link:', error);
      return null;
    }
  }

  /**
   * Resolve a short code to its original URL
   */
  static async resolveShortLink(code: string): Promise<string | null> {
    try {
      console.log('🔍 Resolving short link:', code);

      const { data, error } = await supabase.rpc('resolve_short_link', {
        p_code: code
      });

      if (error) {
        console.error('❌ Error resolving short link:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.error('❌ Short link not found');
        return null;
      }

      console.log('✅ Short link resolved to:', data[0].original_url);
      return data[0].original_url;
    } catch (error) {
      console.error('💥 Exception resolving short link:', error);
      return null;
    }
  }

  /**
   * Get analytics for a short link
   */
  static async getShortLinkStats(code: string): Promise<ShortLink | null> {
    try {
      const { data, error } = await supabase
        .from('short_links')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        console.error('Error fetching short link stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception fetching short link stats:', error);
      return null;
    }
  }

  /**
   * Generate short link for product
   */
  static async createProductShortLink(productId: string, storeSlug?: string): Promise<ShortLinkResponse | null> {
    const url = storeSlug 
      ? `/store/${storeSlug}/product/${productId}`
      : `/product/${productId}`;

    return this.createShortLink({
      original_url: url,
      resource_type: 'product',
      resource_id: productId
    });
  }

  /**
   * Generate short link for store
   */
  static async createStoreShortLink(storeSlug: string, vendorId: string): Promise<ShortLinkResponse | null> {
    return this.createShortLink({
      original_url: `/store/${storeSlug}`,
      resource_type: 'store',
      resource_id: vendorId
    });
  }

  /**
   * Copy short link to clipboard
   */
  static async copyToClipboard(shortUrl: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(shortUrl);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      // Fallback method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shortUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        return false;
      }
    }
  }
}
