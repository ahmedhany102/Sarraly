import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, Mail, CreditCard, User, Calendar, Hash, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAdminOrderDetails } from '@/hooks/useVendorOrders';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType; color: string }> = {
  pending: { label: 'قيد الانتظار', variant: 'secondary', icon: Clock, color: 'text-yellow-600' },
  PENDING: { label: 'قيد الانتظار', variant: 'secondary', icon: Clock, color: 'text-yellow-600' },
  processing: { label: 'قيد المعالجة', variant: 'default', icon: Package, color: 'text-blue-600' },
  PROCESSING: { label: 'قيد المعالجة', variant: 'default', icon: Package, color: 'text-blue-600' },
  shipped: { label: 'تم الشحن', variant: 'default', icon: Truck, color: 'text-purple-600' },
  SHIPPED: { label: 'تم الشحن', variant: 'default', icon: Truck, color: 'text-purple-600' },
  delivered: { label: 'تم التوصيل', variant: 'default', icon: CheckCircle, color: 'text-green-600' },
  DELIVERED: { label: 'تم التوصيل', variant: 'default', icon: CheckCircle, color: 'text-green-600' },
  cancelled: { label: 'ملغي', variant: 'destructive', icon: XCircle, color: 'text-red-600' },
  CANCELLED: { label: 'ملغي', variant: 'destructive', icon: XCircle, color: 'text-red-600' },
};

const paymentStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'معلق', variant: 'secondary' },
  PENDING: { label: 'معلق', variant: 'secondary' },
  paid: { label: 'تم الدفع', variant: 'default' },
  PAID: { label: 'تم الدفع', variant: 'default' },
  failed: { label: 'فشل', variant: 'destructive' },
  FAILED: { label: 'فشل', variant: 'destructive' },
  refunded: { label: 'مرتجع', variant: 'outline' },
  REFUNDED: { label: 'مرتجع', variant: 'outline' },
};

interface VendorInfo {
  id: string;
  email: string;
  name: string;
  store_name?: string;
}

const AdminOrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { items, orderInfo, loading, refetch } = useAdminOrderDetails(orderId || '');
  const [vendors, setVendors] = useState<Record<string, VendorInfo>>({});
  const [updating, setUpdating] = useState(false);

  // Fetch vendor info
  useEffect(() => {
    const fetchVendors = async () => {
      const vendorIds = [...new Set(items.map((item) => item.vendor_id))];
      if (vendorIds.length === 0) return;

      // Fetch from vendors table
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('id, owner_id, name, slug')
        .in('id', vendorIds);

      if (!vendorsError && vendorsData) {
        const vendorMap: Record<string, VendorInfo> = {};
        vendorsData.forEach((v) => {
          vendorMap[v.id] = {
            id: v.id,
            email: '',
            name: v.name,
            store_name: v.name
          };
        });
        setVendors(vendorMap);
      }
    };
    if (items.length > 0) {
      fetchVendors();
    }
  }, [items]);

  // Group items by vendor
  const itemsByVendor = items.reduce((acc, item) => {
    if (!acc[item.vendor_id]) {
      acc[item.vendor_id] = [];
    }
    acc[item.vendor_id].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const handleStatusChange = async (newStatus: string) => {
    if (!orderId) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('تم تحديث حالة الطلب');
      refetch();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('فشل في تحديث الحالة');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus: string) => {
    if (!orderId) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('تم تحديث حالة الدفع');
      refetch();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('فشل في تحديث حالة الدفع');
    } finally {
      setUpdating(false);
    }
  };

  const handleItemStatusChange = async (itemId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('order_items')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', itemId);

      if (error) throw error;
      toast.success('تم تحديث حالة المنتج');
      refetch();
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('فشل في تحديث حالة المنتج');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orderInfo) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/vendor-orders')}>
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة للطلبات
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">الطلب غير موجود أو لا تملك صلاحية عرضه</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customerInfo = orderInfo?.customer_info || {};
  const currentStatus = statusConfig[orderInfo?.status] || statusConfig.pending;
  const CurrentStatusIcon = currentStatus.icon;
  const paymentStatus = paymentStatusConfig[orderInfo?.payment_status] || paymentStatusConfig.pending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/vendor-orders')}>
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-2xl font-bold">طلب #{orderInfo?.order_number}</h1>
            <p className="text-sm text-muted-foreground">
              {orderInfo?.created_at && format(new Date(orderInfo.created_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
            </p>
          </div>
        </div>
        <Badge variant={currentStatus.variant} className="text-base px-4 py-2">
          <CurrentStatusIcon className="h-4 w-4 ml-2" />
          {currentStatus.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items by Vendor */}
          {Object.entries(itemsByVendor).map(([vendorId, vendorItems]) => {
            const vendor = vendors[vendorId];
            const vendorTotal = vendorItems.reduce((sum, item) => sum + item.total_price, 0);

            return (
              <Card key={vendorId}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">
                        {vendor?.store_name || vendor?.name || 'بائع غير معروف'}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-base">
                      {vendorTotal.toLocaleString()} ج.م
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vendorItems.map((item) => {
                      const itemStatus = statusConfig[item.item_status] || statusConfig.pending;
                      const ItemStatusIcon = itemStatus.icon;

                      return (
                        <div key={item.item_id} className="flex gap-4 p-4 bg-muted/50 rounded-lg border">
                          <img
                            src={item.product_image || '/placeholder.svg'}
                            alt={item.product_name}
                            className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base mb-1">{item.product_name}</h4>
                            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                              <span>الكمية: {item.quantity}</span>
                              <span>السعر: {item.unit_price.toLocaleString()} ج.م</span>
                              {item.size && <span>المقاس: {item.size}</span>}
                              {item.color && <span>اللون: {item.color}</span>}
                            </div>
                            <p className="font-bold text-lg mt-2">{item.total_price.toLocaleString()} ج.م</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Select
                              value={item.item_status?.toLowerCase() || 'pending'}
                              onValueChange={(val) => handleItemStatusChange(item.item_id, val.toUpperCase())}
                              disabled={updating}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">قيد الانتظار</SelectItem>
                                <SelectItem value="processing">قيد المعالجة</SelectItem>
                                <SelectItem value="shipped">تم الشحن</SelectItem>
                                <SelectItem value="delivered">تم التوصيل</SelectItem>
                                <SelectItem value="cancelled">ملغي</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Order Notes */}
          {orderInfo?.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">📝 ملاحظات الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                  {orderInfo.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Order Status Control */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">حالة الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">حالة الشحن</label>
                <Select
                  value={orderInfo?.status?.toLowerCase() || 'pending'}
                  onValueChange={(val) => handleStatusChange(val.toUpperCase())}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        قيد الانتظار
                      </span>
                    </SelectItem>
                    <SelectItem value="processing">
                      <span className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        قيد المعالجة
                      </span>
                    </SelectItem>
                    <SelectItem value="shipped">
                      <span className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-purple-600" />
                        تم الشحن
                      </span>
                    </SelectItem>
                    <SelectItem value="delivered">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        تم التوصيل
                      </span>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <span className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        ملغي
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">حالة الدفع</label>
                <Select
                  value={orderInfo?.payment_status?.toLowerCase() || 'pending'}
                  onValueChange={handlePaymentStatusChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">معلق</SelectItem>
                    <SelectItem value="paid">تم الدفع</SelectItem>
                    <SelectItem value="failed">فشل</SelectItem>
                    <SelectItem value="refunded">مرتجع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                بيانات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">الاسم</p>
                  <p className="font-medium">{customerInfo.name || 'غير معروف'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">البريد الإلكتروني</p>
                  <p className="font-medium" dir="ltr">{customerInfo.email || 'غير معروف'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">الهاتف</p>
                  <p className="font-medium" dir="ltr">{customerInfo.phone || 'غير معروف'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">العنوان</p>
                  <p className="font-medium">
                    {customerInfo.address?.street && `${customerInfo.address.street}, `}
                    {customerInfo.address?.city && `${customerInfo.address.city} `}
                    {customerInfo.address?.governorate && `- ${customerInfo.address.governorate}`}
                    {!customerInfo.address?.street && !customerInfo.address?.city && (
                      typeof customerInfo.address === 'string' ? customerInfo.address : 'غير معروف'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم الطلب</span>
                <span className="font-medium">#{orderInfo?.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد المنتجات</span>
                <span className="font-medium">{items.length} منتج</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">عدد البائعين</span>
                <span className="font-medium">{Object.keys(itemsByVendor).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">طريقة الدفع</span>
                <span className="font-medium">
                  {orderInfo?.payment_method === 'CASH' ? 'الدفع عند الاستلام' : orderInfo?.payment_method || '-'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الشحن</span>
                <span className="font-medium">{(orderInfo?.shipping_cost || 0).toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>الإجمالي</span>
                <span className="text-primary">{(orderInfo?.total_amount || 0).toLocaleString()} ج.م</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailsPage;
