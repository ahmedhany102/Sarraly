import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useVendorProfile } from '@/hooks/useVendorProfile';
import { VendorApplyForm } from '@/components/vendor/VendorApplyForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Store, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { getStatusLabel, getStatusColor } from '@/hooks/useVendorProfile';
import { supabase } from '@/integrations/supabase/client';

const BecomeVendor = () => {
  const { user, loading: authLoading, isVendor } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading, applyAsVendor } = useVendorProfile();

  // If already a vendor with approved status, redirect to vendor dashboard
  if (!authLoading && isVendor && profile?.status === 'approved') {
    return <Navigate to="/vendor" replace />;
  }

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Guest user - show info page with signup CTA
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <Store className="w-20 h-20 mx-auto mb-6 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              امتلك متجرك الخاص بمواصفات عالمية.. في لحظات
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              لا تضيع وقتك في البرمجة. احصل فوراً على لوحة تحكم شاملة لإدارة منتجاتك ومبيعاتك،
              واعرض بضاعتك تلقائياً أمام آلاف الزوار في <span className="text-primary font-bold"> مول سرعلي الإلكتروني </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" onClick={() => navigate('/signup?redirect=/become-vendor')}>
                امتلك متجرك الآن
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/login?redirect=/become-vendor')}>
                تسجيل الدخول
              </Button>
            </div>
          </div>

          {/* Benefits section for guests */}
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center text-2xl">لماذا سرعلي؟</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Feature 1 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <CheckCircle className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">تحكم واسع وشامل</h3>
                    <p className="text-muted-foreground text-sm">
                      أدر مخزونك، حدد أسعارك، وتابع أرباحك بدقة من مكان واحد.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <Clock className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">انطلاقة في <span className="text-primary">30 ثانية</span></h3>
                    <p className="text-muted-foreground text-sm">
                      سجل حسابك وابدأ البيع فوراً، لا توجد تعقيدات تقنية.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <Store className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">توسع بلا حدود</h3>
                    <p className="text-muted-foreground text-sm">
                      منتجاتك تظهر فوراً في مول سرعلي العام، مما يضمن لك وصولاً أسرع للعملاء.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <AlertCircle className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">أدوات تسويقية ذكية</h3>
                    <p className="text-muted-foreground text-sm">
                      اصنع العروض والخصومات واجذب المشترين لمتجرك بسهولة.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Loading vendor profile for logged-in users
  if (profileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const handleApply = async (
    storeName: string,
    storeDescription?: string,
    phone?: string,
    address?: string,
    salesChannelLink?: string,
    hasPhysicalStore?: boolean,
    registrationNotes?: string
  ) => {
    const success = await applyAsVendor(
      storeName,
      storeDescription,
      phone,
      address,
      salesChannelLink,
      hasPhysicalStore,
      registrationNotes
    );
    return success;
  };

  // Already has a profile - show status
  if (profile) {
    const statusConfig = {
      pending: {
        icon: Clock,
        iconColor: 'text-yellow-500',
        title: 'طلبك قيد المراجعة',
        description: 'تم استلام طلبك وهو الآن قيد المراجعة من قبل فريق الإدارة. سيتم إخطارك عند الموافقة.'
      },
      approved: {
        icon: CheckCircle,
        iconColor: 'text-green-500',
        title: 'تمت الموافقة!',
        description: 'تهانينا! تمت الموافقة على طلبك. يمكنك الآن الوصول إلى لوحة تحكم البائع.'
      },
      rejected: {
        icon: XCircle,
        iconColor: 'text-red-500',
        title: 'تم رفض الطلب',
        description: 'للأسف تم رفض طلبك. يرجى التواصل مع الإدارة لمعرفة السبب وإمكانية إعادة التقديم.'
      },
      suspended: {
        icon: AlertCircle,
        iconColor: 'text-orange-500',
        title: 'حساب موقوف',
        description: 'تم إيقاف حساب البائع الخاص بك مؤقتاً. يرجى التواصل مع الإدارة.'
      }
    };

    const config = statusConfig[profile.status];
    const Icon = config.icon;

    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${profile.status === 'approved' ? 'bg-green-100' :
                profile.status === 'pending' ? 'bg-yellow-100' :
                  profile.status === 'rejected' ? 'bg-red-100' : 'bg-orange-100'
                }`}>
                <Icon className={`w-8 h-8 ${config.iconColor}`} />
              </div>
              <CardTitle>{config.title}</CardTitle>
              <CardDescription className="mt-2">{config.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{profile.store_name}</p>
                  <p className="text-sm text-muted-foreground">اسم المتجر</p>
                </div>
                <Badge className={getStatusColor(profile.status)}>
                  {getStatusLabel(profile.status)}
                </Badge>
              </div>

              {profile.status === 'approved' && (
                <Button
                  className="w-full"
                  onClick={async () => {
                    // Force refresh auth session to get new 'vendor_admin' role
                    console.log('🔄 Refreshing session before dashboard access...');
                    try {
                      // Trigger a profile refetch by refreshing the session
                      const { data, error } = await supabase.auth.refreshSession();
                      if (error) {
                        console.error('Session refresh error:', error);
                      } else {
                        console.log('✅ Session refreshed, navigating to dashboard...');
                      }
                    } catch (e) {
                      console.error('Session refresh failed:', e);
                    }
                    // Navigate even if refresh fails - let the dashboard handle auth
                    window.location.href = '/vendor';
                  }}
                >
                  <Store className="w-4 h-4 mr-2" />
                  الذهاب إلى لوحة التحكم
                </Button>
              )}

              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                العودة للرئيسية
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // No profile - show apply form
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">سجل للحصول علي متجرك الالكتروني الخاص بك</h1>
          <p className="text-muted-foreground">
            ابدأ رحلتك معنا وقم ببيع منتجاتك لآلاف العملاء. تقدم بطلبك الآن وسيتم مراجعته من قبل فريقنا.
          </p>
        </div>

        <VendorApplyForm onSubmit={handleApply} />
      </div>
    </Layout>
  );
};

export default BecomeVendor;
