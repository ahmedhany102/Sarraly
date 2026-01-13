
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseContactSettings } from '@/hooks/useSupabaseContactSettings';
import { Plus, Trash2, HelpCircle, FileText, Phone } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const AdminContactSettings = () => {
  const { settings, loading, updateSettings } = useSupabaseContactSettings();
  const [formData, setFormData] = useState({
    store_name: '',
    address: '',
    email: '',
    phone: '',
    working_hours: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    map_url: '',
    terms_and_conditions: '',
    shipping_policy: '',
    return_policy: '',
    developer_name: 'Ahmed Hany',
    developer_url: 'https://ahmed-hany-dev-portfolio.vercel.app/'
  });
  const [faqList, setFaqList] = useState<FAQItem[]>([]);
  const [activeTab, setActiveTab] = useState('contact');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      console.log('Loading settings into form:', settings);
      setFormData({
        store_name: settings.store_name || '',
        address: settings.address || '',
        email: settings.email || '',
        phone: settings.phone || '',
        working_hours: settings.working_hours || '',
        website: settings.website || '',
        facebook: settings.facebook || '',
        instagram: settings.instagram || '',
        twitter: settings.twitter || '',
        youtube: settings.youtube || '',
        map_url: settings.map_url || '',
        terms_and_conditions: settings.terms_and_conditions || '',
        shipping_policy: settings.shipping_policy || '',
        return_policy: settings.return_policy || '',
        developer_name: 'Ahmed Hany',
        developer_url: 'https://ahmed-hany-dev-portfolio.vercel.app/'
      });

      // Parse FAQ list from JSONB
      if (settings.faq_list) {
        try {
          const parsed = typeof settings.faq_list === 'string'
            ? JSON.parse(settings.faq_list)
            : settings.faq_list;
          setFaqList(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error('Error parsing FAQ list:', e);
          setFaqList([]);
        }
      }
    }
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // FAQ Management Functions
  const addFaqItem = () => {
    setFaqList(prev => [...prev, { question: '', answer: '' }]);
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    setFaqList(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeFaqItem = (index: number) => {
    setFaqList(prev => prev.filter((_, i) => i !== index));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      console.log('Saving contact settings with data:', formData);

      // Filter out empty FAQ items
      const validFaqs = faqList.filter(faq => faq.question.trim() && faq.answer.trim());

      // Validate and clean the data
      const cleanData = {
        store_name: formData.store_name?.trim() || 'Sarraly',
        address: formData.address?.trim() || '',
        email: formData.email?.trim() || '',
        phone: formData.phone?.trim() || '',
        working_hours: formData.working_hours?.trim() || '',
        website: formData.website?.trim() || '',
        facebook: formData.facebook?.trim() || '',
        instagram: formData.instagram?.trim() || '',
        twitter: formData.twitter?.trim() || '',
        youtube: formData.youtube?.trim() || '',
        map_url: formData.map_url?.trim() || '',
        terms_and_conditions: formData.terms_and_conditions?.trim() || '',
        shipping_policy: formData.shipping_policy?.trim() || '',
        return_policy: formData.return_policy?.trim() || '',
        faq_list: validFaqs,
        developer_name: 'Ahmed Hany',
        developer_url: 'https://ahmed-hany-dev-portfolio.vercel.app/'
      };

      console.log('Cleaned data to save:', cleanData);

      const success = await updateSettings(cleanData);

      if (success) {
        console.log('Settings saved successfully');
        toast.success('تم حفظ الإعدادات بنجاح!');
      } else {
        console.error('Failed to save settings - no success returned');
        toast.error('فشل في حفظ الإعدادات');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('خطأ في حفظ الإعدادات: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="contact" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            معلومات التواصل
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            السياسات
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            الأسئلة الشائعة
          </TabsTrigger>
          <TabsTrigger value="developer">المطور</TabsTrigger>
        </TabsList>

        {/* Tab 1: Contact Information */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>معلومات التواصل الأساسية</CardTitle>
              <CardDescription>أدخل معلومات التواصل التي ستظهر للزوار</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="store_name" className="text-sm font-medium">اسم المتجر</label>
                  <Input
                    id="store_name"
                    name="store_name"
                    value={formData.store_name}
                    onChange={handleChange}
                    placeholder="اسم المتجر"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="text-sm font-medium">العنوان</label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="العنوان الكامل"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="البريد الإلكتروني للتواصل"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="text-sm font-medium">رقم الهاتف</label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="رقم الهاتف"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="working_hours" className="text-sm font-medium">ساعات العمل</label>
                  <Input
                    id="working_hours"
                    name="working_hours"
                    value={formData.working_hours}
                    onChange={handleChange}
                    placeholder="مثال: السبت-الخميس 9ص-6م"
                  />
                </div>

                <div>
                  <label htmlFor="map_url" className="text-sm font-medium">رابط الخريطة</label>
                  <Input
                    id="map_url"
                    name="map_url"
                    value={formData.map_url}
                    onChange={handleChange}
                    placeholder="رابط Google Maps"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>روابط التواصل الاجتماعي</CardTitle>
              <CardDescription>أضف روابط حسابات التواصل الاجتماعي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className="text-sm font-medium">الموقع الإلكتروني</label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="رابط الموقع"
                  />
                </div>

                <div>
                  <label htmlFor="facebook" className="text-sm font-medium">فيسبوك</label>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    placeholder="رابط صفحة الفيسبوك"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="instagram" className="text-sm font-medium">انستغرام</label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="رابط حساب انستغرام"
                  />
                </div>

                <div>
                  <label htmlFor="twitter" className="text-sm font-medium">تويتر</label>
                  <Input
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="رابط حساب تويتر"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="youtube" className="text-sm font-medium">يوتيوب</label>
                <Input
                  id="youtube"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleChange}
                  placeholder="رابط قناة اليوتيوب"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Policies */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الشروط والأحكام</CardTitle>
              <CardDescription>أدخل شروط وأحكام استخدام المنصة</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="terms_and_conditions"
                name="terms_and_conditions"
                value={formData.terms_and_conditions}
                onChange={handleChange}
                placeholder="أدخل الشروط والأحكام هنا..."
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>سياسة الشحن</CardTitle>
              <CardDescription>أدخل سياسة الشحن والتوصيل</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="shipping_policy"
                name="shipping_policy"
                value={formData.shipping_policy}
                onChange={handleChange}
                placeholder="أدخل سياسة الشحن هنا... مثال: كل بائع مسؤول عن ترتيب الشحن مع عملائه."
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>سياسة الاسترجاع والاستبدال</CardTitle>
              <CardDescription>أدخل سياسة الاسترجاع والاستبدال</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="return_policy"
                name="return_policy"
                value={formData.return_policy}
                onChange={handleChange}
                placeholder="أدخل سياسة الاسترجاع هنا..."
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: FAQ Manager */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>إدارة الأسئلة الشائعة</span>
                <Button onClick={addFaqItem} size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة سؤال
                </Button>
              </CardTitle>
              <CardDescription>أضف وعدّل الأسئلة الشائعة التي ستظهر في صفحة FAQ</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد أسئلة شائعة بعد</p>
                  <p className="text-sm">اضغط على "إضافة سؤال" للبدء</p>
                </div>
              ) : (
                faqList.map((faq, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">السؤال</label>
                            <Input
                              value={faq.question}
                              onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                              placeholder="أدخل السؤال..."
                              className="bg-background"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">الإجابة</label>
                            <Textarea
                              value={faq.answer}
                              onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                              placeholder="أدخل الإجابة..."
                              className="min-h-[100px] bg-background"
                            />
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeFaqItem(index)}
                          className="shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Developer Credit */}
        <TabsContent value="developer">
          <Card>
            <CardHeader>
              <CardTitle>معلومات المطور</CardTitle>
              <CardDescription>معلومات المطور التي تظهر في الفوتر (للقراءة فقط)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="developer_name" className="text-sm font-medium">اسم المطور</label>
                  <Input
                    id="developer_name"
                    name="developer_name"
                    value={formData.developer_name}
                    onChange={handleChange}
                    placeholder="اسم المطور"
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-xs text-gray-500 mt-1">هذا الحقل لا يمكن تغييره</p>
                </div>

                <div>
                  <label htmlFor="developer_url" className="text-sm font-medium">رابط المطور</label>
                  <Input
                    id="developer_url"
                    name="developer_url"
                    value={formData.developer_url}
                    onChange={handleChange}
                    placeholder="رابط موقع المطور"
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-xs text-gray-500 mt-1">هذا الحقل لا يمكن تغييره</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-end border-t pt-6">
        <Button
          onClick={saveSettings}
          className="bg-primary hover:bg-primary/90 text-white px-8"
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              جاري الحفظ...
            </div>
          ) : (
            'حفظ التغييرات'
          )}
        </Button>
      </CardFooter>
    </div>
  );
};

export default AdminContactSettings;
