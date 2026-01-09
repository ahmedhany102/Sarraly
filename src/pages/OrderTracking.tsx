import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import UserOrders from '@/components/UserOrders';
import VendorStoreHeader from '@/components/vendor/VendorStoreHeader';
import { useOptionalVendorContext } from '@/contexts/VendorContext';
import { useVendorCategories } from '@/hooks/useVendors';

const OrderTracking = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Use optional vendor context - returns null when outside /store/:vendorSlug/*
  const vendorCtx = useOptionalVendorContext();
  const isVendorContext = !!vendorCtx;
  const vendorId = vendorCtx?.vendorId;
  const vendorSlug = vendorCtx?.vendorSlug;

  // Get vendor categories for header (uses vendorId from context, guaranteed available)
  const { mainCategories, subcategories } = useVendorCategories(vendorId);

  // Redirect to login if not authenticated, saving current URL
  React.useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
      // Redirect to vendor login when in vendor context
      if (isVendorContext && vendorSlug) {
        navigate(`/store/${vendorSlug}/login`);
      } else {
        navigate('/login');
      }
    }
  }, [user, loading, location.pathname, location.search, navigate, isVendorContext, vendorSlug]);

  if (loading) {
    return (
      <Layout hideGlobalHeader={isVendorContext} hideFooter={isVendorContext}>
        {isVendorContext && vendorId && (
          <VendorStoreHeader
            vendorId={vendorId}
            mainCategories={mainCategories}
            subcategories={subcategories}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSubcategorySelect={setSelectedSubcategory}
          />
        )}
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Wait for redirect
  }

  return (
    <Layout hideGlobalHeader={isVendorContext} hideFooter={isVendorContext}>
      {/* Vendor Header when in vendor context */}
      {isVendorContext && vendorId && (
        <VendorStoreHeader
          vendorId={vendorId}
          mainCategories={mainCategories}
          subcategories={subcategories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSubcategorySelect={setSelectedSubcategory}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        <UserOrders />
      </div>
    </Layout>
  );
};

export default OrderTracking;
