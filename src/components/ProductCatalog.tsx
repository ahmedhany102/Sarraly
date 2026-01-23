import React, { useState, useMemo } from 'react';
import SearchBar from './SearchBar';
import CategoryNavigation from './CategoryNavigation';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { useCategories } from '@/hooks/useCategories';
import ProductCatalogHeader from './ProductCatalogHeader';
import ProductGrid from './ProductGrid';
import ShoppingCartDialog from './ShoppingCartDialog';
import { useCartIntegration } from '@/hooks/useCartIntegration';
import { useBulkProductVariants } from '@/hooks/useBulkProductVariants';
import { Button } from '@/components/ui/button';

const ProductCatalog: React.FC = () => {
  // Filter state - managed locally, passed to hook for SERVER-SIDE filtering
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine which category to filter by (subcategory takes precedence)
  const effectiveCategoryId = selectedSubcategoryId || selectedCategoryId;

  // Fetch products with SERVER-SIDE filtering
  const { products, loading, hasMore, loadMore, loadingMore } = useSupabaseProducts(
    effectiveCategoryId,
    searchQuery || null
  );

  const { categories, subcategories: getSubcategories } = useCategories();
  const { cartItems, addToCart: addToCartDB, removeFromCart, updateQuantity, clearCart } = useCartIntegration();

  // Get child categories for the selected parent
  const childCategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    return getSubcategories(selectedCategoryId);
  }, [selectedCategoryId, getSubcategories]);

  // Check if selected category is a parent (has children)
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const isParentCategory = selectedCategory && !selectedCategory.parent_id && childCategories.length > 0;

  // Fetch all variants in bulk for all products
  const productIds = useMemo(() => products.map(p => p.id), [products]);
  const { variantsByProduct } = useBulkProductVariants(productIds);
  const [showCartDialog, setShowCartDialog] = useState(false);

  // Handle category selection
  const handleCategorySelect = (categoryId: string | null) => {
    console.log('📂 Category selected:', categoryId);
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null); // Reset subcategory when parent changes
  };

  // Handle subcategory selection
  const handleSubcategoryFilter = (subcategoryId: string | null) => {
    console.log('📁 Subcategory selected:', subcategoryId);
    setSelectedSubcategoryId(subcategoryId);
  };

  // Handle search
  const handleSearch = (query: string) => {
    console.log('🔍 Search query:', query);
    setSearchQuery(query);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSearchQuery('');
  };

  // Convert cart items to the format expected by ShoppingCartDialog
  const cartForDialog = cartItems.map(item => ({
    product: {
      id: item.productId,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl
    },
    quantity: item.quantity
  }));

  const handleAddToCart = async (product: any, size: string, quantity?: number) => {
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : '';
    await addToCartDB(product, size, defaultColor, quantity || 1);
  };

  const handleUpdateCartItem = async (productId: string, newQuantity: number) => {
    const item = cartItems.find(item => item.productId === productId);
    if (item) {
      if (newQuantity <= 0) {
        await removeFromCart(item.id);
      } else {
        await updateQuantity(item.id, newQuantity);
      }
    }
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleProceedToCheckout = () => {
    setShowCartDialog(false);
    window.location.href = '/cart';
  };

  return (
    <div className="container mx-auto px-4 py-4 min-h-[1000px]">
      <ProductCatalogHeader
        cart={cartForDialog}
        onCartClick={() => setShowCartDialog(true)}
      />

      <CategoryNavigation
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategoryId}
      />

      {/* Subcategory Tabs - shown when parent category is selected */}
      {isParentCategory && childCategories.length > 0 && (
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={!selectedSubcategoryId ? "default" : "outline"}
              size="sm"
              onClick={() => handleSubcategoryFilter(null)}
              className="whitespace-nowrap"
            >
              الكل
            </Button>
            {childCategories.map(sub => (
              <Button
                key={sub.id}
                variant={selectedSubcategoryId === sub.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleSubcategoryFilter(sub.id)}
                className="whitespace-nowrap"
              >
                {sub.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <SearchBar onSearch={handleSearch} placeholder="ابحث عن المنتجات..." />

      <ProductGrid
        products={products}
        loading={loading}
        searchQuery={searchQuery}
        onAddToCart={handleAddToCart}
        onClearSearch={clearFilters}
        variantsByProduct={variantsByProduct}
      />

      <ShoppingCartDialog
        isOpen={showCartDialog}
        onClose={setShowCartDialog}
        cart={cartForDialog}
        onUpdateCartItem={handleUpdateCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />
    </div>
  );
};
export default ProductCatalog;
