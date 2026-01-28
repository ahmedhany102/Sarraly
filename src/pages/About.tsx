import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Store, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Globe, 
  Package, 
  Truck,
  CreditCard,
  BarChart3,
  CheckCircle,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { useLanguageSafe } from '@/contexts/LanguageContext';
import SEO from '@/components/SEO';

const About = () => {
  const { language, direction } = useLanguageSafe();

  const features = [
    {
      icon: Zap,
      titleAr: 'إطلاق فوري في 30 ثانية',
      titleEn: 'Launch in 30 Seconds',
      descAr: 'لا حاجة لخبرة تقنية. سجل حسابك وابدأ البيع فوراً بدون تعقيدات أو تكاليف إنشاء موقع',
      descEn: 'No technical expertise needed. Sign up and start selling instantly without complications',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Store,
      titleAr: 'متجر إلكتروني متكامل',
      titleEn: 'Complete Online Store',
      descAr: 'احصل على متجر احترافي برابط خاص، لوحة تحكم شاملة، وإدارة منتجات وطلبات متقدمة',
      descEn: 'Get a professional store with custom URL, dashboard, and advanced management',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Globe,
      titleAr: 'مول إلكتروني متعدد التجار',
      titleEn: 'Multi-Vendor Marketplace',
      descAr: 'منتجاتك تظهر تلقائياً في مول سرعلي أمام آلاف العملاء المحتملين يومياً',
      descEn: 'Your products appear automatically to thousands of potential customers daily',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      titleAr: 'نمو غير محدود',
      titleEn: 'Unlimited Growth',
      descAr: 'أدوات تسويق ذكية، تحليلات مبيعات، وكوبونات خصم لزيادة مبيعاتك بشكل مستمر',
      descEn: 'Smart marketing tools, sales analytics, and discount coupons for continuous growth',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      titleAr: 'أمان وموثوقية',
      titleEn: 'Security & Reliability',
      descAr: 'بنية تحتية آمنة، حماية بيانات العملاء، ونظام مدفوعات موثوق',
      descEn: 'Secure infrastructure, customer data protection, and reliable payment system',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      icon: BarChart3,
      titleAr: 'إحصائيات في الوقت الفعلي',
      titleEn: 'Real-Time Analytics',
      descAr: 'تتبع مبيعاتك، طلباتك، وأرباحك لحظة بلحظة من لوحة التحكم',
      descEn: 'Track sales, orders, and profits in real-time from your dashboard',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  const stats = [
    { 
      number: '30', 
      unit: language === 'ar' ? 'ثانية' : 'seconds',
      label: language === 'ar' ? 'وقت الإطلاق' : 'Launch Time'
    },
    { 
      number: '100+', 
      unit: '',
      label: language === 'ar' ? 'تاجر نشط' : 'Active Vendors'
    },
    { 
      number: '', 
      unit: '',
      label: language === 'ar' ? 'بدون اشتراك شهري' : 'No Monthly Subscription',
      icon: CheckCircle
    },
    { 
      number: '24/7', 
      unit: '',
      label: language === 'ar' ? 'دعم فني' : 'Support'
    }
  ];

  const benefits = [
    { 
      textAr: 'بدون رسوم اشتراك شهرية',
      textEn: 'No monthly subscription fees',
      icon: CheckCircle 
    },
    { 
      textAr: 'لا حاجة لخبرة برمجية',
      textEn: 'No coding experience required',
      icon: CheckCircle 
    },
    { 
      textAr: 'دعم كامل باللغة العربية',
      textEn: 'Full Arabic language support',
      icon: CheckCircle 
    },
    { 
      textAr: 'إدارة شحن مرنة لكل محافظة',
      textEn: 'Flexible shipping management',
      icon: CheckCircle 
    },
    { 
      textAr: 'نظام تقييمات موثوق',
      textEn: 'Reliable review system',
      icon: CheckCircle 
    },
    { 
      textAr: 'متوافق مع الجوال بالكامل',
      textEn: 'Fully mobile responsive',
      icon: CheckCircle 
    }
  ];

  return (
    <Layout>
      <SEO
        title={language === 'ar' ? 'من نحن - Sarraly' : 'About Us - Sarraly'}
        description={language === 'ar' 
          ? 'سرعلي - منصة التجارة الإلكترونية الأسرع في مصر. انطلق بمتجرك في 30 ثانية وابدأ البيع اليوم'
          : 'Sarraly - The fastest e-commerce platform in Egypt. Launch your store in 30 seconds'
        }
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden pt-6 md:pt-8">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 pb-8 md:pb-12 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {language === 'ar' ? 'منصة التجارة الإلكترونية الأسرع' : 'The Fastest E-Commerce Platform'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-primary drop-shadow-sm">
              {language === 'ar' ? 'نغير مفهوم التجارة الإلكترونية' : 'Transforming E-Commerce'}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-6 leading-relaxed">
              {language === 'ar' 
                ? 'سرعلي هي منصة مصرية رائدة تهدف لتمكين كل تاجر من امتلاك متجره الإلكتروني الاحترافي في ثوانٍ معدودة. بدون تعقيدات تقنية، بدون رسوم مبالغ فيها - فقط ابدأ وانطلق!'
                : 'Sarraly is a leading Egyptian platform designed to empower every merchant to own a professional online store in seconds. No technical complications, no excessive fees - just start and launch!'
              }
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/50 backdrop-blur border-primary/20">
                  <CardContent className="p-4 md:p-6 text-center">
                    {stat.icon ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <stat.icon className="w-8 h-8 md:w-10 md:h-10 text-green-600 mb-2" />
                        <p className="text-xs md:text-sm text-muted-foreground font-medium">
                          {stat.label}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl md:text-4xl font-bold text-primary mb-1">
                          {stat.number}
                          {stat.unit && <span className="text-sm md:text-lg text-muted-foreground ml-1">{stat.unit}</span>}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ar' ? 'رؤيتنا ورسالتنا' : 'Our Vision & Mission'}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-primary/40 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {language === 'ar' ? 'الرؤية' : 'Vision'}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {language === 'ar'
                    ? 'أن نصبح المنصة الأولى للتجارة الإلكترونية في مصر والوطن العربي، ونمكن كل تاجر صغير أو كبير من المنافسة العادلة والوصول لملايين العملاء.'
                    : 'To become the leading e-commerce platform in Egypt and the Arab world, empowering every merchant to compete fairly and reach millions of customers.'
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {language === 'ar' ? 'الرسالة' : 'Mission'}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {language === 'ar'
                    ? 'توفير أسرع وأبسط منصة لإطلاق المتاجر الإلكترونية، مع دعم فني شامل وأدوات تسويقية احترافية تساعد التجار على النمو المستمر وزيادة أرباحهم.'
                    : 'Provide the fastest and simplest platform for launching online stores, with comprehensive technical support and professional marketing tools to help merchants grow continuously.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ar' ? 'لماذا سرعلي؟' : 'Why Sarraly?'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar'
                ? 'نوفر لك كل ما تحتاجه لبدء وإدارة متجرك الإلكتروني بنجاح'
                : 'We provide everything you need to start and manage your online store successfully'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">
                    {language === 'ar' ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {language === 'ar' ? feature.descAr : feature.descEn}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ar' ? 'مميزات إضافية' : 'Additional Benefits'}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
              >
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm font-medium">
                  {language === 'ar' ? benefit.textAr : benefit.textEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Store className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              {language === 'ar' ? 'هل أنت تاجر أو عندك براند او بتبيع من رسايل فيسبوك او انستجرام وتعبت من ضغط الرسايل وعدم التنظيم .. انت جيت للمكان الصح': 'Are You a Merchant?'}
            </h2>
            
            <p className="text-lg md:text-xl mb-8 opacity-90">
              {language === 'ar'
                ? 'ابدأ رحلتك معنا اليوم واحصل على متجرك الخاص في 30 ثانية فقط'
                : 'Start your journey with us today and get your own store in just 30 seconds'
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/become-vendor">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-6 text-lg shadow-lg"
                >
                  <Store className="w-5 h-5 me-2" />
                  {language === 'ar' ? 'احصل على متجرك الآن' : 'Get Your Store Now'}
                </Button>
              </Link>

              <Link to="/contact">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-6 text-lg shadow-lg"
                >
                  {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm opacity-75">
              {language === 'ar' 
                ? ' تسجيل مجاني • بدون رسوم شهرية • دعم فني على مدار الساعة'
                : ' Free Registration • No Monthly Fees • 24/7 Technical Support'
              }
            </p>
          </div>
        </div>
      </section>

      {/* Platform Performance Section */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ar' ? 'منصة سريعة ومتجاوبة' : 'Fast & Responsive Platform'}
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {language === 'ar'
                ? 'أداء فائق السرعة وتصميم متجاوب مع جميع الأجهزة لضمان أفضل تجربة لعملائك'
                : 'Lightning-fast performance and responsive design across all devices to ensure the best experience for your customers'
              }
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { 
                  icon: Zap, 
                  labelAr: 'سرعة فائقة', 
                  labelEn: 'Ultra Fast',
                  color: 'from-yellow-500 to-orange-500' 
                },
                { 
                  icon: Smartphone, 
                  labelAr: 'متجاوب', 
                  labelEn: 'Responsive',
                  color: 'from-blue-500 to-cyan-500' 
                },
                { 
                  icon: Shield, 
                  labelAr: 'آمن', 
                  labelEn: 'Secure',
                  color: 'from-green-500 to-emerald-500' 
                },
                { 
                  icon: Globe, 
                  labelAr: 'متعدد اللغات', 
                  labelEn: 'Multilingual',
                  color: 'from-purple-500 to-pink-500' 
                }
              ].map((item, index) => (
                <Card key={index} className="border-2 hover:border-primary transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold">
                      {language === 'ar' ? item.labelAr : item.labelEn}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
