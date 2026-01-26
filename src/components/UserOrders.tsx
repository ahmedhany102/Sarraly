
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUserOrders } from '@/hooks/useUserOrders';
import { format } from 'date-fns';
import { X, Package, Clock } from 'lucide-react';
import { useLanguageSafe } from '@/contexts/LanguageContext';

const UserOrders = () => {
  const { orders, loading, cancelling, cancelOrder } = useUserOrders();
  const { t, direction } = useLanguageSafe();

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t?.orders?.noOrders || 'You have no orders yet.'}</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Translate status using translation keys
  const getStatusLabel = (status: string) => {
    const statusKey = status?.toLowerCase();
    return t?.orders?.statusMap?.[statusKey] || status;
  };

  const canCancelOrder = (order: any) => {
    return ['PENDING', 'PROCESSING'].includes(order.status?.toUpperCase());
  };

  const handleCancelOrder = async (orderId: string) => {
    await cancelOrder(orderId);
  };

  // Filter orders by status
  const activeOrders = orders.filter(order =>
    ['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status?.toUpperCase())
  );

  const cancelledOrders = orders.filter(order =>
    order.status?.toUpperCase() === 'CANCELLED'
  );

  const renderOrderCard = (order: any) => {
    // Calculate total from items if total_amount is missing
    const calculateItemsTotal = () => {
      if (!Array.isArray(order.items)) return 0;
      return order.items.reduce((sum: number, item: any) => {
        const price = item.totalPrice || item.price || 0;
        const qty = item.quantity || 1;
        return sum + (item.totalPrice ? price : price * qty);
      }, 0);
    };

    const displayTotal = order.total_amount || calculateItemsTotal();
    const orderNumber = order.order_number || order.id?.slice(0, 8) || 'N/A';

    return (
      <Card key={order.id} className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{t?.orders?.orderNumber || 'Order'} #{orderNumber}</CardTitle>
              <p className="text-sm text-gray-600">
                {t?.orders?.orderedOn || 'Ordered on'} {format(new Date(order.created_at), 'PPP')}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getStatusColor(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
                {canCancelOrder(order) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={cancelling === order.id}
                        className="h-6 px-2 text-xs"
                      >
                        <X className={`h-3 w-3 ${direction === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                        {cancelling === order.id ? (t?.orders?.cancelling || 'Cancelling...') : (t?.orders?.cancel || 'Cancel')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t?.orders?.cancelOrder || 'Cancel Order'}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t?.orders?.cancelConfirm?.replace('{orderNumber}', orderNumber) || `Are you sure you want to cancel order #${orderNumber}? This action cannot be undone.`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t?.orders?.keepOrder || 'Keep Order'}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleCancelOrder(order.id)}>
                          {t?.orders?.yesCancelOrder || 'Yes, Cancel Order'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              <p className="text-lg font-semibold">
                {Number(displayTotal).toFixed(0)} {t?.common?.currency || 'EGP'}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Order Items */}
            <div>
              <h4 className="font-medium mb-2">{t?.cart?.products || 'Products'}:</h4>
              <div className="space-y-2">
                {Array.isArray(order.items) && order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        {item.color && item.color !== '-' && (
                          <p className="text-gray-500">{t?.productDetails?.color || 'Color'}: {item.color}</p>
                        )}
                        {item.size && item.size !== '-' && (
                          <p className="text-gray-500">{t?.productDetails?.size || 'Size'}: {item.size}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p>{t?.productDetails?.quantity || 'Qty'}: {item.quantity}</p>
                      <p className="font-medium">{Number(item.totalPrice ?? 0).toFixed(2)} {t?.common?.currency || 'EGP'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.customer_info?.address && (
              <div>
                <h4 className="font-medium mb-1">{t?.orders?.shippingAddress || 'Shipping Address'}:</h4>
                <p className="text-sm text-gray-600">
                  {order.customer_info.address.street}, {order.customer_info.address.city}, {order.customer_info.address.zipCode}
                </p>
              </div>
            )}

            {/* Order Notes */}
            {order.notes && (
              <div>
                <h4 className="font-medium mb-1">{t?.orders?.notes || 'Notes'}:</h4>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4" dir={direction}>
      <h2 className="text-2xl font-bold text-gray-900">{t?.orders?.myOrders || 'My Orders'}</h2>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t?.orders?.activeOrders || 'Active Orders'} ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <X className="h-4 w-4" />
            {t?.orders?.cancelledOrders || 'Cancelled Orders'} ({cancelledOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t?.orders?.noActiveOrders || 'No active orders.'}</p>
            </div>
          ) : (
            activeOrders.map(renderOrderCard)
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledOrders.length === 0 ? (
            <div className="text-center py-8">
              <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t?.orders?.noCancelledOrders || 'No cancelled orders.'}</p>
            </div>
          ) : (
            cancelledOrders.map(renderOrderCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserOrders;
