import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseContactSettings } from '@/hooks/useSupabaseContactSettings';
import { Loader2, Truck } from 'lucide-react';

const ShippingPolicy = () => {
    const { settings, loading } = useSupabaseContactSettings();

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader className="text-center border-b">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Truck className="w-8 h-8 text-primary" />
                            <CardTitle className="text-2xl md:text-3xl">سياسة الشحن</CardTitle>
                        </div>
                        <p className="text-muted-foreground">Shipping Policy</p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : settings?.shipping_policy ? (
                            <div className="prose prose-lg dark:prose-invert max-w-none text-right leading-relaxed whitespace-pre-wrap">
                                {settings.shipping_policy}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Truck className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg">لم يتم تحديد سياسة الشحن بعد.</p>
                                <p className="text-sm mt-2">يرجى التواصل مع الإدارة للمزيد من المعلومات.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ShippingPolicy;
