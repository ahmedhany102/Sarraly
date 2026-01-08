import React, { useState, useEffect } from 'react';
import { useVendorFooter } from '@/hooks/useVendorFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    MessageCircle,
    Facebook,
    Instagram,
    Mail,
    Save,
    Loader2
} from 'lucide-react';

interface VendorFooterSettingsProps {
    vendorId: string;
}

/**
 * VendorFooterSettings - Dashboard form for customizing vendor footer
 */
const VendorFooterSettings: React.FC<VendorFooterSettingsProps> = ({ vendorId }) => {
    const { settings, loading, saving, saveSettings } = useVendorFooter(vendorId);

    // Form state
    const [whatsappLink, setWhatsappLink] = useState('');
    const [facebookLink, setFacebookLink] = useState('');
    const [instagramLink, setInstagramLink] = useState('');
    const [email, setEmail] = useState('');
    const [privacyPolicy, setPrivacyPolicy] = useState('');
    const [returnPolicy, setReturnPolicy] = useState('');
    const [showHomeLink, setShowHomeLink] = useState(true);
    const [showCartLink, setShowCartLink] = useState(true);
    const [showProfileLink, setShowProfileLink] = useState(true);
    const [showOrdersLink, setShowOrdersLink] = useState(true);

    // Initialize form with settings
    useEffect(() => {
        if (settings) {
            setWhatsappLink(settings.whatsapp_link || '');
            setFacebookLink(settings.facebook_link || '');
            setInstagramLink(settings.instagram_link || '');
            setEmail(settings.email || '');
            setPrivacyPolicy(settings.privacy_policy || '');
            setReturnPolicy(settings.return_policy || '');
            setShowHomeLink(settings.show_home_link ?? true);
            setShowCartLink(settings.show_cart_link ?? true);
            setShowProfileLink(settings.show_profile_link ?? true);
            setShowOrdersLink(settings.show_orders_link ?? true);
        }
    }, [settings]);

    const handleSave = async () => {
        await saveSettings({
            whatsapp_link: whatsappLink || null,
            facebook_link: facebookLink || null,
            instagram_link: instagramLink || null,
            email: email || null,
            privacy_policy: privacyPolicy || null,
            return_policy: returnPolicy || null,
            show_home_link: showHomeLink,
            show_cart_link: showCartLink,
            show_profile_link: showProfileLink,
            show_orders_link: showOrdersLink,
        });
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-32" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Social & Contact Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">روابط التواصل</CardTitle>
                    <CardDescription>أضف روابط التواصل الاجتماعي الخاصة بمتجرك (اختياري)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp" className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-green-500" />
                                WhatsApp
                            </Label>
                            <Input
                                id="whatsapp"
                                placeholder="https://wa.me/201234567890"
                                value={whatsappLink}
                                onChange={(e) => setWhatsappLink(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="facebook" className="flex items-center gap-2">
                                <Facebook className="w-4 h-4 text-blue-600" />
                                Facebook
                            </Label>
                            <Input
                                id="facebook"
                                placeholder="https://facebook.com/yourpage"
                                value={facebookLink}
                                onChange={(e) => setFacebookLink(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instagram" className="flex items-center gap-2">
                                <Instagram className="w-4 h-4 text-pink-500" />
                                Instagram
                            </Label>
                            <Input
                                id="instagram"
                                placeholder="https://instagram.com/yourprofile"
                                value={instagramLink}
                                onChange={(e) => setInstagramLink(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                البريد الإلكتروني
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="contact@yourstore.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Legal Text */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">النصوص القانونية</CardTitle>
                    <CardDescription>أضف سياسات متجرك (اختياري)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="privacy">سياسة الخصوصية</Label>
                        <Textarea
                            id="privacy"
                            placeholder="اكتب سياسة الخصوصية الخاصة بمتجرك..."
                            value={privacyPolicy}
                            onChange={(e) => setPrivacyPolicy(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="return">سياسة الاسترجاع</Label>
                        <Textarea
                            id="return"
                            placeholder="اكتب سياسة الاسترجاع والاستبدال الخاصة بمتجرك..."
                            value={returnPolicy}
                            onChange={(e) => setReturnPolicy(e.target.value)}
                            rows={4}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Quick Links Toggles */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">الروابط السريعة</CardTitle>
                    <CardDescription>تحكم في ظهور الروابط في الفوتر</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="show-home" className="cursor-pointer">
                                رابط الرئيسية
                            </Label>
                            <Switch
                                id="show-home"
                                checked={showHomeLink}
                                onCheckedChange={setShowHomeLink}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="show-cart" className="cursor-pointer">
                                رابط العربة
                            </Label>
                            <Switch
                                id="show-cart"
                                checked={showCartLink}
                                onCheckedChange={setShowCartLink}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="show-profile" className="cursor-pointer">
                                رابط حسابي
                            </Label>
                            <Switch
                                id="show-profile"
                                checked={showProfileLink}
                                onCheckedChange={setShowProfileLink}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="show-orders" className="cursor-pointer">
                                رابط طلباتي
                            </Label>
                            <Switch
                                id="show-orders"
                                checked={showOrdersLink}
                                onCheckedChange={setShowOrdersLink}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            حفظ الإعدادات
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default VendorFooterSettings;
