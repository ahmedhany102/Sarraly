import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Truck, MapPin, Save } from 'lucide-react';
import { EGYPTIAN_GOVERNORATES, getGovernorateLabel } from '@/constants/governorates';

interface ShippingRate {
    id: string;
    governorate: string;
    cost: number;
}

interface VendorShippingSettingsProps {
    vendorProfileId: string;
}

const VendorShippingSettings: React.FC<VendorShippingSettingsProps> = ({ vendorProfileId }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [defaultCost, setDefaultCost] = useState<number>(25);
    const [rates, setRates] = useState<ShippingRate[]>([]);
    const [newGovernorate, setNewGovernorate] = useState<string>('');
    const [newCost, setNewCost] = useState<string>('');

    // Fetch existing settings
    useEffect(() => {
        const fetchSettings = async () => {
            if (!vendorProfileId) return;

            try {
                setLoading(true);

                // Fetch default shipping cost from vendor_profiles
                const { data: profile } = await supabase
                    .from('vendor_profiles')
                    .select('default_shipping_cost')
                    .eq('id', vendorProfileId)
                    .single();

                if (profile?.default_shipping_cost) {
                    setDefaultCost(profile.default_shipping_cost);
                }

                // Fetch zone-specific rates
                const { data: ratesData, error } = await supabase
                    .from('vendor_shipping_rates')
                    .select('*')
                    .eq('vendor_id', vendorProfileId)
                    .order('governorate');

                if (error) throw error;
                setRates(ratesData || []);

            } catch (err) {
                console.error('Error fetching shipping settings:', err);
                toast.error('فشل في تحميل إعدادات الشحن');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [vendorProfileId]);

    // Save default shipping cost
    const handleSaveDefault = async () => {
        try {
            setSaving(true);

            const { error } = await supabase
                .from('vendor_profiles')
                .update({ default_shipping_cost: defaultCost })
                .eq('id', vendorProfileId);

            if (error) throw error;
            toast.success('تم حفظ تكلفة الشحن الافتراضية');

        } catch (err) {
            console.error('Error saving default cost:', err);
            toast.error('فشل في حفظ التكلفة الافتراضية');
        } finally {
            setSaving(false);
        }
    };

    // Add new zone rate
    const handleAddRate = async () => {
        if (!newGovernorate || !newCost) {
            toast.error('يرجى تحديد المحافظة والتكلفة');
            return;
        }

        // Check if governorate already exists
        if (rates.some(r => r.governorate === newGovernorate)) {
            toast.error('هذه المحافظة مضافة بالفعل');
            return;
        }

        try {
            setSaving(true);

            const { data, error } = await supabase
                .from('vendor_shipping_rates')
                .insert({
                    vendor_id: vendorProfileId,
                    governorate: newGovernorate,
                    cost: parseFloat(newCost)
                })
                .select()
                .single();

            if (error) throw error;

            setRates([...rates, data]);
            setNewGovernorate('');
            setNewCost('');
            toast.success('تم إضافة تكلفة الشحن للمحافظة');

        } catch (err) {
            console.error('Error adding rate:', err);
            toast.error('فشل في إضافة التكلفة');
        } finally {
            setSaving(false);
        }
    };

    // Delete rate
    const handleDeleteRate = async (rateId: string) => {
        try {
            const { error } = await supabase
                .from('vendor_shipping_rates')
                .delete()
                .eq('id', rateId);

            if (error) throw error;

            setRates(rates.filter(r => r.id !== rateId));
            toast.success('تم حذف التكلفة');

        } catch (err) {
            console.error('Error deleting rate:', err);
            toast.error('فشل في الحذف');
        }
    };

    // Get available governorates (not already added)
    const availableGovernorates = EGYPTIAN_GOVERNORATES.filter(
        gov => !rates.some(r => r.governorate === gov.value)
    );

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Default Shipping Cost */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />
                        <CardTitle>تكلفة الشحن الافتراضية</CardTitle>
                    </div>
                    <CardDescription>
                        هذه التكلفة تُطبق على المحافظات التي لم تُحدد لها تكلفة خاصة
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <div className="flex-1 max-w-xs">
                            <Label htmlFor="defaultCost">التكلفة (جنيه)</Label>
                            <Input
                                id="defaultCost"
                                type="number"
                                min="0"
                                value={defaultCost}
                                onChange={(e) => setDefaultCost(parseFloat(e.target.value) || 0)}
                                className="mt-1"
                            />
                        </div>
                        <Button onClick={handleSaveDefault} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                            حفظ
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Zone-Specific Rates */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <CardTitle>أسعار الشحن حسب المحافظة</CardTitle>
                    </div>
                    <CardDescription>
                        حدد تكلفة شحن مختلفة لكل محافظة
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Add New Rate Form */}
                    <div className="flex flex-wrap items-end gap-3 mb-6 p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-[200px]">
                            <Label>المحافظة</Label>
                            <Select value={newGovernorate} onValueChange={setNewGovernorate}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="اختر المحافظة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableGovernorates.map((gov) => (
                                        <SelectItem key={gov.value} value={gov.value}>
                                            {gov.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-32">
                            <Label>التكلفة (جنيه)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={newCost}
                                onChange={(e) => setNewCost(e.target.value)}
                                placeholder="0"
                                className="mt-1"
                            />
                        </div>
                        <Button onClick={handleAddRate} disabled={saving || !newGovernorate || !newCost}>
                            <Plus className="w-4 h-4 ml-2" />
                            إضافة
                        </Button>
                    </div>

                    {/* Rates Table */}
                    {rates.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>المحافظة</TableHead>
                                    <TableHead>التكلفة</TableHead>
                                    <TableHead className="w-20"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rates.map((rate) => (
                                    <TableRow key={rate.id}>
                                        <TableCell className="font-medium">
                                            {getGovernorateLabel(rate.governorate)}
                                        </TableCell>
                                        <TableCell>
                                            {rate.cost === 0 ? (
                                                <span className="text-green-600 font-semibold">مجاني</span>
                                            ) : (
                                                `${rate.cost} جنيه`
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteRate(rate.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>لم تُضف أسعار شحن مخصصة بعد</p>
                            <p className="text-sm">سيتم استخدام التكلفة الافتراضية ({defaultCost} جنيه) لجميع المحافظات</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VendorShippingSettings;
