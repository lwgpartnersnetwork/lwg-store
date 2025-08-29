import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { LogOut, Plus, Eye, Download, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/lib/auth';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import ProductForm from '@/components/admin/product-form';
import type { Order } from '@shared/schema';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/admin');
    }
  }, [isAuthenticated, setLocation]);

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{
    ok: boolean;
    orders: Order[];
    total: number;
  }>({
    queryKey: ['/api/admin/orders'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    logout();
    localStorage.removeItem('adminToken');
    setLocation('/admin');
  };

  const handleDownloadReceipt = (ref: string) => {
    window.open(`/api/receipt/${ref}`, '_blank');
  };

  if (!isAuthenticated) {
    return null;
  }

  const orders = ordersData?.orders || [];
  const totalOrders = ordersData?.total || 0;
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.grandTotal), 0);
  const activeProducts = 42; // Mock data for now

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.username}</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="destructive"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Orders</p>
                  <p className="text-3xl font-bold" data-testid="text-total-orders">{totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Revenue</p>
                  <p className="text-3xl font-bold" data-testid="text-total-revenue">{formatPrice(totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Products</p>
                  <p className="text-3xl font-bold" data-testid="text-active-products">{activeProducts}</p>
                </div>
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button 
                onClick={() => setIsProductFormOpen(true)}
                data-testid="button-add-product"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                        <TableCell className="font-mono text-sm" data-testid={`text-order-ref-${order.id}`}>
                          {order.ref}
                        </TableCell>
                        <TableCell data-testid={`text-order-customer-${order.id}`}>
                          {order.customerName}
                        </TableCell>
                        <TableCell className="font-semibold" data-testid={`text-order-total-${order.id}`}>
                          {formatPrice(order.grandTotal)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm" data-testid={`text-order-date-${order.id}`}>
                          {formatDate(order.createdAt!)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              data-testid={`button-view-order-${order.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadReceipt(order.ref)}
                              data-testid={`button-download-receipt-${order.id}`}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <ProductForm 
          isOpen={isProductFormOpen} 
          onClose={() => setIsProductFormOpen(false)} 
        />
      </div>
    </div>
  );
}
