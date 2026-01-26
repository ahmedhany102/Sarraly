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
import { useLanguageSafe } from '@/contexts/LanguageContext';

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
  const { t, direction } = useLanguageSafe();
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

    const requiredField = direction === 'rtl' ? 'مطلوب' : 'Required';
    const pleaseSelect = direction === 'rtl' ? 'يرجى تحديد ما إذا كان لديك محل تجاري' : 'Please select if you have a physical store';
    const fillRequired = direction === 'rtl' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields';

    if (!storeName.trim()) {
      newErrors.storeName = `${t?.vendor?.form?.storeName || 'Store Name'} ${requiredField}`;
    }
    if (!storeDescription.trim()) {
      newErrors.storeDescription = `${t?.vendor?.form?.storeDesc || 'Store Description'} ${requiredField}`;
    }
    if (!phone.trim()) {
      newErrors.phone = `${t?.vendor?.form?.phone || 'Phone Number'} ${requiredField}`;
    }
    if (!address.trim()) {
      newErrors.address = `${t?.vendor?.form?.address || 'Address'} ${requiredField}`;
    }
    if (!salesChannelLink.trim()) {
      newErrors.salesChannelLink = `${t?.vendor?.form?.salesLink || 'Sales Link'} ${requiredField}`;
    }
    if (!hasPhysicalStore) {
      newErrors.hasPhysicalStore = pleaseSelect;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(fillRequired);
      return false;
    }
    return true;
  };

  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(direction === 'rtl' ? 'يرجى اختيار ملف صورة صالح' : 'Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(direction === 'rtl' ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' : 'Image size must be less than 5MB');
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
        toast.error(direction === 'rtl' ? 'فشل في رفع الشعار' : 'Failed to upload logo');
        return;
      }

      const { data } = supabase.storage
        .from('vendor-assets')
        .getPublicUrl(filePath);

      setLogoUrl(data.publicUrl);
      setLogoPreview(data.publicUrl);
      toast.success(direction === 'rtl' ? 'تم رفع الشعار بنجاح' : 'Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(direction === 'rtl' ? 'فشل في رفع الشعار' : 'Failed to upload logo');
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
    <Card dir={direction} className="max-w-lg mx-auto shadow-lg rounded-2xl">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Store className="w-7 h-7 text-primary" />
        </div>
        <CardTitle className="text-2xl">{t?.vendor?.form?.sectionHeader || 'Fill in the Details'}</CardTitle>
        <CardDescription className="text-base">
          {t?.vendor?.form?.sectionSubHeader || 'Complete all required fields to get your own store'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Name */}
          <div className="space-y-1">
            <Label htmlFor="storeName" className="text-start block">
              {t?.vendor?.form?.storeName || 'Store Name'} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="storeName"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder={direction === 'rtl' ? 'أدخل اسم متجرك' : 'Enter your store name'}
              disabled={submitting}
              className={`text-start ${errors.storeName ? 'border-destructive' : ''}`}
            />
            <ErrorMessage error={errors.storeName} />
          </div>

          {/* Store Logo Upload */}
          <div className="space-y-2">
            <Label className="text-start block">
              {t?.vendor?.form?.storeLogo || 'Store Logo (Optional)'}
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
                      <Loader2 className={`w-4 h-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'} animate-spin`} />
                      {direction === 'rtl' ? 'جاري الرفع...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className={`w-4 h-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                      {logoPreview ? (direction === 'rtl' ? 'تغيير الشعار' : 'Change Logo') : (t?.vendor?.form?.uploadLogo || 'Upload Store Logo')}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {t?.vendor?.form?.logoHint || 'Auto-compressed | Max 5MB'}
                </p>
              </div>
            </div>
          </div>

          {/* Store Description */}
          <div className="space-y-1">
            <Label htmlFor="storeDescription" className="text-start block">
              {t?.vendor?.form?.storeDesc || 'Store Description'} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="storeDescription"
              value={storeDescription}
              onChange={(e) => setStoreDescription(e.target.value)}
              placeholder={direction === 'rtl' ? 'اكتب وصفاً مختصراً عن متجرك ومنتجاتك' : 'Write a brief description of your store and products'}
              rows={3}
              disabled={submitting}
              className={`text-start resize-none ${errors.storeDescription ? 'border-destructive' : ''}`}
            />
            <ErrorMessage error={errors.storeDescription} />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="phone" className="text-start block">
              {t?.vendor?.form?.phone || 'Phone Number'} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={direction === 'rtl' ? 'رقم الهاتف للتواصل' : 'Contact phone number'}
              disabled={submitting}
              dir="ltr"
              className={`text-left ${errors.phone ? 'border-destructive' : ''}`}
            />
            <ErrorMessage error={errors.phone} />
          </div>

          {/* Address */}
          <div className="space-y-1">
            <Label htmlFor="address" className="text-start block">
              {t?.vendor?.form?.address || 'Address'} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={direction === 'rtl' ? 'عنوان المتجر أو المكتب' : 'Store or office address'}
              disabled={submitting}
              className={`text-start ${errors.address ? 'border-destructive' : ''}`}
            />
            <ErrorMessage error={errors.address} />
          </div>

          {/* Divider */}
          <div className="border-t border-border my-3 pt-3">
            <p className="text-sm text-muted-foreground text-center mb-3">
              {t?.vendor?.form?.extraInfo || 'Additional Information About Your Business'}
            </p>
          </div>

          {/* Sales Channel Link */}
          <div className="space-y-1">
            <Label htmlFor="salesChannelLink" className="text-start flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span>{t?.vendor?.form?.salesLink || 'Your Current Sales Page Link'} <span className="text-destructive">*</span></span>
            </Label>
            <Input
              id="salesChannelLink"
              type="url"
              value={salesChannelLink}
              onChange={(e) => setSalesChannelLink(e.target.value)}
              placeholder={direction === 'rtl' ? 'https://facebook.com/yourpage أو https://instagram.com/yourpage' : 'https://facebook.com/yourpage or https://instagram.com/yourpage'}
              disabled={submitting}
              dir="ltr"
              className={`text-left ${errors.salesChannelLink ? 'border-destructive' : ''}`}
            />
            <p className="text-xs text-muted-foreground text-start">
              {t?.vendor?.form?.salesLinkPlaceholder || 'Facebook, Instagram, or any other platform'}
            </p>
            <ErrorMessage error={errors.salesChannelLink} />
          </div>

          {/* Has Physical Store */}
          <div className="space-y-2">
            <Label className="text-start flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span>{t?.vendor?.form?.hasPhysicalStore || 'Do you have a physical retail store?'} <span className="text-destructive">*</span></span>
            </Label>
            <RadioGroup
              value={hasPhysicalStore}
              onValueChange={setHasPhysicalStore}
              className={`flex gap-6 ${direction === 'rtl' ? 'justify-end' : 'justify-start'}`}
              disabled={submitting}
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id="store-yes" />
                <Label htmlFor="store-yes" className="cursor-pointer">{t?.vendor?.form?.yes || 'Yes'}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id="store-no" />
                <Label htmlFor="store-no" className="cursor-pointer">{t?.vendor?.form?.no || 'No'}</Label>
              </div>
            </RadioGroup>
            <ErrorMessage error={errors.hasPhysicalStore} />
          </div>

          {/* Registration Notes - OPTIONAL */}
          <div className="space-y-1">
            <Label htmlFor="registrationNotes" className="text-start flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>{t?.vendor?.form?.notes || 'Additional Notes (Optional)'}</span>
            </Label>
            <Textarea
              id="registrationNotes"
              value={registrationNotes}
              onChange={(e) => setRegistrationNotes(e.target.value)}
              placeholder={direction === 'rtl' ? 'هل لديك أي استفسارات أو تفاصيل تود إضافتها؟' : 'Any questions or details you would like to add?'}
              rows={3}
              disabled={submitting}
              className="text-start resize-none"
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
                <Loader2 className={`w-5 h-5 ${direction === 'rtl' ? 'ml-2' : 'mr-2'} animate-spin`} />
                {direction === 'rtl' ? 'جاري تقديم الطلب...' : 'Submitting Application...'}
              </>
            ) : (
              t?.vendor?.form?.submit || 'Submit Application'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
