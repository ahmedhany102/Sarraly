import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useVendors } from '@/hooks/useVendors';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, ArrowLeft, ArrowRight } from 'lucide-react';

const Vendors = () => {
  const { vendors, loading, error } = useVendors();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للموقع الرئيسي</span>
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">تصفح المتاجر</h1>
          <p className="text-muted-foreground">
            اكتشف أفضل البائعين والمتاجر في منصتنا
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-20 h-20 rounded-full mb-4" />
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-4" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">حدث خطأ أثناء تحميل المتاجر</p>
            <Button onClick={() => window.location.reload()}>
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && vendors.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">لا توجد متاجر حالياً</h2>
            <p className="text-muted-foreground">
              سيتم إضافة متاجر جديدة قريباً
            </p>
          </div>
        )}

        {/* Vendors Grid - Modern Redesign */}
        {!loading && !error && vendors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {vendors.map((vendor) => (
              <Card
                key={vendor.id}
                className="overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-[1.02] bg-card"
                onClick={() => navigate(`/store/${vendor.slug}`)}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    {/* Large Vendor Logo - Main Visual Focus */}
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center mb-6 overflow-hidden border-2 border-primary/20 group-hover:border-primary group-hover:shadow-lg transition-all duration-300">
                      {vendor.logo_url ? (
                        <img
                          src={vendor.logo_url}
                          alt={vendor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-12 h-12 text-primary" />
                      )}
                    </div>

                    {/* Store Name - Bold & Large */}
                    <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">
                      {vendor.name}
                    </h3>

                    {/* Store Description (if available) */}
                    {vendor.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {vendor.description}
                      </p>
                    )}

                    {/* Product Count Badge */}
                    {typeof vendor.product_count === 'number' && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm mb-5">
                        <span className="font-semibold">{vendor.product_count}</span>
                        <span>منتج</span>
                      </div>
                    )}

                    {/* Visit Store Button - Full Width, Primary Color */}
                    <Button
                      className="w-full gap-2 group-hover:gap-3 transition-all text-base py-5"
                      size="lg"
                    >
                      <span>زيارة المتجر</span>
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Vendors;
