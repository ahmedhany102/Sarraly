import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, Loader2, Link2, Building2, FileText, AlertCircle, Upload, ImageIcon, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from '@/utils/imageCompression';

interface VendorApplyFormProps {
  onSubmit: (
    storeName: string,
    storeDescription?: string,
    phone?: string,
    address?: string,
    salesChannelLink?: string,
    hasPhysicalStore?: boolean,
    registrationNotes?: string,
    logoUrl?: string
  ) => Promise<boolean>;
}

export const VendorApplyForm = ({ onSubmit }: VendorApplyFormProps) => {
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [salesChannelLink, setSalesChannelLink] = useState('');
  const [hasPhysicalStore, setHasPhysicalStore] = useState<string>('');
  const [registrationNotes, setRegistrationNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Logo upload state
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!storeName.trim()) {
      newErrors.storeName = 'اسم المتجر مطلوب';
    }
    if (!storeDescription.trim()) {
      newErrors.storeDescription = 'وصف المتجر مطلوب';
    }
    if (!phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    }
    if (!address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    }
    if (!salesChannelLink.trim()) {
      newErrors.salesChannelLink = 'رابط صفحة المبيعات مطلوب';
    }
    if (!hasPhysicalStore) {
      newErrors.hasPhysicalStore = 'يرجى تحديد ما إذا كان لديك محل تجاري';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return false;
    }
    return true;
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setUploadingLogo(true);
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      console.log(`📦 Logo compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`);

      const fileExt = compressedFile.name.split('.').pop();
      const fileName = `pending_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `vendor-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vendor-assets')
        .upload(filePath, compressedFile, { upsert: true });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        toast.error('فشل في رفع الشعار');
        return;
      }

      const { data } = supabase.storage
        .from('vendor-assets')
        .getPublicUrl(filePath);

      setLogoUrl(data.publicUrl);
      setLogoPreview(data.publicUrl);
      toast.success('تم رفع الشعار بنجاح');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('فشل في رفع الشعار');
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    setLogoUrl('');
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(
        storeName.trim(),
        storeDescription.trim(),
        phone.trim(),
        address.trim(),
        salesChannelLink.trim(),
        hasPhysicalStore === 'yes',
        registrationNotes.trim() || undefined,
        logoUrl || undefined
      );
    } finally {
      setSubmitting(false);
    }
  };

  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <p className="text-destructive text-sm flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    );
  };

  return (
    <Card className="max-w-lg mx-auto shadow-lg rounded-2xl">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Store className="w-7 h-7 text-primary" />
        </div>
        <CardTitle className="text-2xl">املأ البيانات التالية</CardTitle>
        <CardDescription className="text-base">
          أكمل جميع الحقول المطلوبة للحصول على متجرك الخاص
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Name */}
          <div className="space-y-1">
            <Label htmlFor="storeName" className="text-right block">
              اسم المتجر <span className="text-destructive">*</span>
            </Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="أدخل اسم متجرك"
              disabled={submitting}
              className={`text-right ${errors.storeName ? 'border-destructive' : ''}`}
            />
            <ErrorMessage error={errors.storeName} />
          </div>

          {/* Store Logo Upload */}
          <div className="space-y-2">
            <Label className="text-right block">
              شعار المتجر <span className="text-muted-foreground text-xs">(اختياري)</span>
            </Label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Store Logo Preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md hover:bg-destructive/90"
                    disabled={submitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                  disabled={submitting || uploadingLogo}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting || uploadingLogo}
                  className="w-full"
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {logoPreview ? 'تغيير الشعار' : 'رفع شعار المتجر'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  يُضغط تلقائياً | الحد الأقصى 5 ميجابايت
                </p>
              </div>
            </div>
          </div>

          {/* Store Description */}
          <div className="space-y-1">
            <Label htmlFor="storeDescription" className="text-right block">
              وصف المتجر <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="storeDescription"
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              placeholder="اكتب وصفاً مختصراً عن متجرك ومنتجاتك"
              rows={3}
              disabled={submitting}
              className={`text-right resize-none ${errors.storeDescription ? 'border-destructive' : ''}`}
            />
            <ErrorMessage error={errors.storeDescription} />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="phone" className="text-right block">
              رقم الهاتف <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="رقم الهاتف للتواصل"
              disabled={submitting}
              dir="ltr"
              className={`text-left ${errors.phone ? 'border-destructive' : ''}`}
            />
            <ErrorMessage error={errors.phone} />
          </div>

          {/* Address */}
          <div className="space-y-1">
            <Label htmlFor="address" className="text-right block">
              العنوان <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="عنوان المتجر أو المكتب"
              disabled={submitting}
              className={`text-right ${errors.address ? 'border-destructive' : ''}`}
            />
            <ErrorMessage error={errors.address} />
          </div>

          {/* Divider */}
          <div className="border-t border-border my-3 pt-3">
            <p className="text-sm text-muted-foreground text-center mb-3">معلومات إضافية عن نشاطك التجاري</p>
          </div>

          {/* Sales Channel Link */}
          <div className="space-y-1">
            <Label htmlFor="salesChannelLink" className="text-right flex items-center gap-2 justify-end">
              <span>رابط صفحة مبيعاتك الحالية <span className="text-destructive">*</span></span>
              <Link2 className="w-4 h-4 text-primary" />
            </Label>
            <Input
              id="salesChannelLink"
              type="url"
              value={salesChannelLink}
              onChange={(e) => setSalesChannelLink(e.target.value)}
              placeholder="https://facebook.com/yourpage أو https://instagram.com/yourpage"
              disabled={submitting}
              dir="ltr"
              className={`text-left ${errors.salesChannelLink ? 'border-destructive' : ''}`}
            />
            <p className="text-xs text-muted-foreground text-right">فيسبوك، انستجرام، أو أي منصة أخرى</p>
            <ErrorMessage error={errors.salesChannelLink} />
          </div>

          {/* Has Physical Store */}
          <div className="space-y-2">
            <Label className="text-right flex items-center gap-2 justify-end">
              <span>هل تمتلك محلاً تجارياً على أرض الواقع؟ <span className="text-destructive">*</span></span>
              <Building2 className="w-4 h-4 text-primary" />
            </Label>
            <RadioGroup
              value={hasPhysicalStore}
              onValueChange={setHasPhysicalStore}
              className="flex gap-6 justify-end"
              disabled={submitting}
            >
              <div className="flex items-center gap-2">
                <Label htmlFor="store-no" className="cursor-pointer">لا</Label>
                <RadioGroupItem value="no" id="store-no" />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="store-yes" className="cursor-pointer">نعم</Label>
                <RadioGroupItem value="yes" id="store-yes" />
              </div>
            </RadioGroup>
            <ErrorMessage error={errors.hasPhysicalStore} />
          </div>

          {/* Registration Notes - OPTIONAL */}
          <div className="space-y-1">
            <Label htmlFor="registrationNotes" className="text-right flex items-center gap-2 justify-end">
              <span>ملاحظات إضافية <span className="text-muted-foreground text-xs">(اختياري)</span></span>
              <FileText className="w-4 h-4 text-primary" />
            </Label>
            <Textarea
              id="registrationNotes"
              value={registrationNotes}
              onChange={(e) => setRegistrationNotes(e.target.value)}
              placeholder="هل لديك أي استفسارات أو تفاصيل تود إضافتها؟"
              rows={3}
              disabled={submitting}
              className="text-right resize-none"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 text-lg rounded-xl"
            size="lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                جاري تقديم الطلب...
              </>
            ) : (
              'تقديم الطلب'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
