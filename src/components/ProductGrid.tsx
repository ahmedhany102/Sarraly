
import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import ProductCard from './ProductCard';
import { Button } from './ui/button';
import { ProductVariant } from '@/hooks/useProductVariants';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
  products: any[];
  loading: boolean;
  searchQuery: string;
  onAddToCart: (product: any, size: string, quantity?: number) => Promise<void>;
  onClearSearch: () => void;
  variantsByProduct?: Record<string, ProductVariant[]>;
}

const PAGE_SIZE = 12;

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  searchQuery,
  onAddToCart,
  onClearSearch,
  variantsByProduct = {}
}) => {
  // Client-side pagination state
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset visible count when products change (e.g., search/filter)
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [products.length, searchQuery]);

  // Infinite scroll trigger
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Load more when trigger is visible
  useEffect(() => {
    if (inView && visibleCount < products.length) {
      // Small delay to prevent rapid loading
      const timer = setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + PAGE_SIZE, products.length));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [inView, visibleCount, products.length]);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-muted animate-pulse" style={{ minHeight: '380px' }}>
            <div className="aspect-square bg-muted-foreground/10 rounded-t-lg mb-3" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
              <div className="h-6 bg-muted-foreground/20 rounded w-1/2" />
              <div className="h-10 bg-muted-foreground/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-xl text-gray-500 mb-4">No products found</p>
        <Button
          onClick={onClearSearch}
          className="bg-primary hover:bg-primary/90 interactive-button"
        >
          Clear Search
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {visibleProducts.filter(product => product).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            variants={variantsByProduct[product.id] || []}
          />
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>جاري تحميل المزيد...</span>
          </div>
        </div>
      )}

      {/* Products count indicator */}
      <div className="text-center text-sm text-muted-foreground py-4">
        عرض {visibleProducts.length} من {products.length} منتج
      </div>
    </>
  );
};

export default ProductGrid;
