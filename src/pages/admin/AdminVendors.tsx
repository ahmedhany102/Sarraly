import { useState, useEffect } from 'react';
import { useAdminVendorProfiles, VendorStatus, getStatusLabel, getStatusColor } from '@/hooks/useVendorProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Loader2, MoreVertical, Store, CheckCircle, XCircle, Ban, Eye, Package, Edit2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const AdminVendors = () => {
  const { vendors, loading, error, fetchVendors, updateVendorStatus, updateVendorProductLimit } = useAdminVendorProfiles();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<typeof vendors[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Product limit editing state
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [editingLimitValue, setEditingLimitValue] = useState<number>(50);
  const [limitUpdateLoading, setLimitUpdateLoading] = useState(false);

  useEffect(() => {
    fetchVendors(activeTab === 'all' ? undefined : activeTab);
  }, [activeTab, fetchVendors]);

  const handleStatusChange = async (vendorId: string, newStatus: VendorStatus) => {
    setActionLoading(true);
    const success = await updateVendorStatus(vendorId, newStatus);
    if (success) {
      await fetchVendors(activeTab === 'all' ? undefined : activeTab);
      setDetailsOpen(false);
    }
    setActionLoading(false);
  };

  // Start editing product limit
  const startEditingLimit = (vendorId: string, currentLimit: number) => {
    setEditingLimitId(vendorId);
    setEditingLimitValue(currentLimit);
  };

  // Cancel editing product limit
  const cancelEditingLimit = () => {
    setEditingLimitId(null);
    setEditingLimitValue(50);
  };

  // Save product limit
  const saveProductLimit = async (vendorId: string) => {
    setLimitUpdateLoading(true);
    const success = await updateVendorProductLimit(vendorId, editingLimitValue);
    if (success) {
      await fetchVendors(activeTab === 'all' ? undefined : activeTab);
      setEditingLimitId(null);
    }
    setLimitUpdateLoading(false);
  };

  // Get usage percentage for progress bar
  const getUsagePercentage = (count: number, limit: number) => {
    if (limit === 0) return 100;
    return Math.min((count / limit) * 100, 100);
  };

  // Get usage color based on percentage
  const getUsageColor = (count: number, limit: number) => {
    const percentage = getUsagePercentage(count, limit);
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const openDetails = (vendor: typeof vendors[0]) => {
    setSelectedVendor(vendor);
    setDetailsOpen(true);
  };

  const getStatusCounts = () => {
    const counts = { all: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 };
    vendors.forEach(v => {
      counts.all++;
      counts[v.status as keyof typeof counts]++;
    });
    return counts;
  };

  if (loading && vendors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">حدث خطأ أثناء تحميل البائعين</p>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>إدارة البائعين</CardTitle>
              <CardDescription>مراجعة وإدارة طلبات البائعين</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="pending">قيد المراجعة</TabsTrigger>
              <TabsTrigger value="approved">معتمد</TabsTrigger>
              <TabsTrigger value="rejected">مرفوض</TabsTrigger>
              <TabsTrigger value="suspended">موقوف</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {vendors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  لا يوجد بائعين في هذه الفئة
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المتجر</TableHead>
                        <TableHead>المالك</TableHead>
                        <TableHead>الهاتف</TableHead>
                        <TableHead>المنتجات / الحد</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>تاريخ التقديم</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.store_name}</TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{vendor.user_name || 'غير محدد'}</p>
                              <p className="text-xs text-muted-foreground">{vendor.user_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{vendor.phone || '-'}</TableCell>
                          
                          {/* Product Usage / Limit Column */}
                          <TableCell>
                            {vendor.status === 'approved' ? (
                              <div className="min-w-[140px]">
                                {editingLimitId === vendor.id ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min={1}
                                      max={10000}
                                      value={editingLimitValue}
                                      onChange={(e) => setEditingLimitValue(parseInt(e.target.value) || 50)}
                                      className="w-20 h-8 text-sm"
                                    />
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => saveProductLimit(vendor.id)}
                                      disabled={limitUpdateLoading}
                                    >
                                      {limitUpdateLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Save className="h-4 w-4 text-green-600" />
                                      )}
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={cancelEditingLimit}
                                    >
                                      <X className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={`text-sm font-medium ${getUsageColor(vendor.product_count || 0, vendor.max_products || 50)}`}>
                                        {vendor.product_count || 0} / {vendor.max_products || 50}
                                      </span>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() => startEditingLimit(vendor.id, vendor.max_products || 50)}
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <Progress 
                                      value={getUsagePercentage(vendor.product_count || 0, vendor.max_products || 50)} 
                                      className="h-1.5"
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          
                          <TableCell>
                            <Badge className={getStatusColor(vendor.status)}>
                              {getStatusLabel(vendor.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(vendor.created_at), 'dd MMM yyyy', { locale: ar })}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openDetails(vendor)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  عرض التفاصيل
                                </DropdownMenuItem>
                                {vendor.status !== 'approved' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(vendor.id, 'approved')}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    قبول
                                  </DropdownMenuItem>
                                )}
                                {vendor.status !== 'rejected' && vendor.status !== 'approved' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(vendor.id, 'rejected')}>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    رفض
                                  </DropdownMenuItem>
                                )}
                                {vendor.status === 'approved' && (
                                  <DropdownMenuItem onClick={() => handleStatusChange(vendor.id, 'suspended')}>
                                    <Ban className="w-4 h-4 mr-2" />
                                    إيقاف
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Vendor Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل البائع</DialogTitle>
            <DialogDescription>معلومات المتجر والمالك</DialogDescription>
          </DialogHeader>

          {selectedVendor && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{selectedVendor.store_name}</h3>
                <Badge className={getStatusColor(selectedVendor.status)}>
                  {getStatusLabel(selectedVendor.status)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">المالك</p>
                  <p className="font-medium">{selectedVendor.user_name || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium">{selectedVendor.user_email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">الهاتف</p>
                  <p className="font-medium">{selectedVendor.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">العنوان</p>
                  <p className="font-medium">{selectedVendor.address || '-'}</p>
                </div>
              </div>

              {/* Product Limit Section - Only for approved vendors */}
              {selectedVendor.status === 'approved' && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold">حد المنتجات</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">الاستخدام الحالي</span>
                      <span className={`text-sm font-bold ${getUsageColor(selectedVendor.product_count || 0, selectedVendor.max_products || 50)}`}>
                        {selectedVendor.product_count || 0} / {selectedVendor.max_products || 50}
                      </span>
                    </div>
                    <Progress 
                      value={getUsagePercentage(selectedVendor.product_count || 0, selectedVendor.max_products || 50)} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {getUsagePercentage(selectedVendor.product_count || 0, selectedVendor.max_products || 50).toFixed(0)}% مستخدم
                    </p>
                  </div>
                </div>
              )}

              {selectedVendor.store_description && (
                <div>
                  <p className="text-muted-foreground text-sm">الوصف</p>
                  <p className="text-sm mt-1">{selectedVendor.store_description}</p>
                </div>
              )}

              {/* New Business Info Section */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">معلومات النشاط التجاري</p>

                {/* Sales Channel Link */}
                <div>
                  <p className="text-muted-foreground text-sm">رابط صفحة المبيعات</p>
                  {(selectedVendor as any).sales_channel_link ? (
                    <a
                      href={(selectedVendor as any).sales_channel_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm break-all"
                    >
                      {(selectedVendor as any).sales_channel_link}
                    </a>
                  ) : (
                    <p className="text-sm">-</p>
                  )}
                </div>

                {/* Physical Store Status */}
                <div>
                  <p className="text-muted-foreground text-sm">محل تجاري</p>
                  <Badge variant={(selectedVendor as any).has_physical_store ? "default" : "secondary"}>
                    {(selectedVendor as any).has_physical_store ? '✓ يمتلك محل' : '💻 أونلاين فقط'}
                  </Badge>
                </div>

                {/* Registration Notes */}
                {(selectedVendor as any).registration_notes && (
                  <div>
                    <p className="text-muted-foreground text-sm">ملاحظات من البائع</p>
                    <p className="text-sm mt-1 bg-muted p-2 rounded">{(selectedVendor as any).registration_notes}</p>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                تاريخ التقديم: {format(new Date(selectedVendor.created_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedVendor && selectedVendor.status !== 'approved' && (
              <Button
                onClick={() => handleStatusChange(selectedVendor.id, 'approved')}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                قبول الطلب
              </Button>
            )}
            {selectedVendor && selectedVendor.status === 'pending' && (
              <Button
                variant="destructive"
                onClick={() => handleStatusChange(selectedVendor.id, 'rejected')}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                رفض الطلب
              </Button>
            )}
            {selectedVendor && selectedVendor.status === 'approved' && (
              <Button
                variant="destructive"
                onClick={() => handleStatusChange(selectedVendor.id, 'suspended')}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />}
                إيقاف المتجر
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVendors;
