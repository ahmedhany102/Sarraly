/**
 * Maps dynamic section titles from API to translated keys
 * This handles scenarios where backend stores titles in one language
 * but the frontend needs to display them in the user's selected language
 */

type TranslationSections = {
  bestSellers?: string;
  bestSeller?: string;
  hotDeals?: string;
  newArrivals?: string;
  featured?: string;
  allProducts?: string;
  browseCategories?: string;
  recentlyViewed?: string;
  lastViewed?: string;
  similarProducts?: string;
  moreFromStore?: string;
  moreFromVendor?: string;
  recommended?: string;
  trending?: string;
  monthlyOffers?: string;
  weeklyOffers?: string;
  specialOffers?: string;
  todayDeals?: string;
  flashSale?: string;
  [key: string]: string | undefined;
};

type Translations = {
  sections?: TranslationSections;
};

// Known title patterns to match against
const titlePatterns: { patterns: string[]; key: keyof TranslationSections }[] = [
  {
    patterns: ['الأكثر مبيعاً', 'الاكثر مبيعا', 'الأفضل مبيعاً', 'best seller', 'best sellers', 'bestseller', 'bestsellers', 'top selling'],
    key: 'bestSellers'
  },
  {
    patterns: ['عروض ساخنة', 'عروض ساخنه', 'hot deals', 'hot deal', 'صفقات ساخنة'],
    key: 'hotDeals'
  },
  {
    patterns: ['وصل حديثاً', 'وصل حديثا', 'جديد', 'new arrivals', 'new arrival', 'newly arrived', 'just arrived'],
    key: 'newArrivals'
  },
  {
    patterns: ['مميز', 'منتجات مميزة', 'featured', 'featured products'],
    key: 'featured'
  },
  {
    patterns: ['كل المنتجات', 'جميع المنتجات', 'all products', 'all items'],
    key: 'allProducts'
  },
  {
    patterns: ['تصفح الفئات', 'تصفح حسب الفئة', 'browse categories', 'browse by category', 'shop by category'],
    key: 'browseCategories'
  },
  {
    patterns: ['شوهد مؤخراً', 'شوهد مؤخرا', 'آخر المشاهدات', 'recently viewed', 'last viewed'],
    key: 'recentlyViewed'
  },
  {
    patterns: ['منتجات مشابهة', 'مشابه', 'similar products', 'similar items', 'you may also like'],
    key: 'similarProducts'
  },
  {
    patterns: ['المزيد من المتجر', 'المزيد من هذا المتجر', 'more from store', 'more from this store', 'more from vendor'],
    key: 'moreFromStore'
  },
  {
    patterns: ['موصى به', 'مقترح لك', 'recommended', 'recommended for you'],
    key: 'recommended'
  },
  {
    patterns: ['الأكثر رواجاً', 'رائج', 'trending', 'trending now'],
    key: 'trending'
  },
  {
    patterns: ['عروض شهرية', 'عروض شهريه', 'monthly offers', 'monthly deals'],
    key: 'monthlyOffers'
  },
  {
    patterns: ['عروض أسبوعية', 'عروض اسبوعية', 'weekly offers', 'weekly deals'],
    key: 'weeklyOffers'
  },
  {
    patterns: ['عروض خاصة', 'عروض مميزة', 'special offers', 'special deals'],
    key: 'specialOffers'
  },
  {
    patterns: ['عروض اليوم', 'صفقات اليوم', 'today deals', "today's deals", 'deal of the day'],
    key: 'todayDeals'
  },
  {
    patterns: ['تخفيضات سريعة', 'فلاش سيل', 'flash sale', 'flash deals'],
    key: 'flashSale'
  }
];

/**
 * Get translated title based on pattern matching
 * @param originalTitle - The title from API/backend
 * @param t - Translation object from context
 * @returns Translated title or original if no match found
 */
export const getTranslatedTitle = (originalTitle: string, t?: Translations): string => {
  if (!originalTitle) return '';
  
  // Normalize the title for comparison
  const normalizedTitle = originalTitle.toLowerCase().trim();
  
  // Try to find a matching pattern
  for (const { patterns, key } of titlePatterns) {
    for (const pattern of patterns) {
      if (normalizedTitle.includes(pattern.toLowerCase())) {
        // Return translated version if available
        const translatedValue = t?.sections?.[key];
        if (translatedValue) {
          return translatedValue;
        }
        break;
      }
    }
  }
  
  // No match found, return original title
  return originalTitle;
};

/**
 * Check if a title matches a specific section type
 * Useful for applying variant-specific styling
 */
export const getSectionVariant = (title: string): 'hot_deals' | 'best_seller' | 'new_arrival' | 'default' => {
  const normalizedTitle = title.toLowerCase().trim();
  
  // Check for hot deals
  if (['عروض ساخنة', 'عروض ساخنه', 'hot deals', 'hot deal', 'صفقات ساخنة', 'flash sale', 'تخفيضات سريعة']
    .some(p => normalizedTitle.includes(p.toLowerCase()))) {
    return 'hot_deals';
  }
  
  // Check for best sellers
  if (['الأكثر مبيعاً', 'الاكثر مبيعا', 'الأفضل مبيعاً', 'best seller', 'bestseller', 'top selling']
    .some(p => normalizedTitle.includes(p.toLowerCase()))) {
    return 'best_seller';
  }
  
  // Check for new arrivals
  if (['وصل حديثاً', 'وصل حديثا', 'جديد', 'new arrivals', 'new arrival']
    .some(p => normalizedTitle.includes(p.toLowerCase()))) {
    return 'new_arrival';
  }
  
  return 'default';
};
