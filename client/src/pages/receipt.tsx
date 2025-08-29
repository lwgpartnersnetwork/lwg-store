import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, FileText, Check } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@shared/schema';

export default function Receipt() {
  const { ref } = useParams<{ ref?: string }>();
  const [localOrder, setLocalOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  // Try to get order from localStorage first (for recent orders)
  useEffect(() => {
    const recentOrder = localStorage.getItem('recentOrder');
    if (recentOrder && !ref) {
      try {
        const order = JSON.parse(recentOrder);
        setLocalOrder(order);
      } catch (error) {
        console.error('Failed to parse recent order:', error);
      }
    }
  }, [ref]);

  // Fetch order from API if we have a ref
  const { data, isLoading, error } = useQuery<{
    ok: boolean;
    order: Order;
  }>({
    queryKey: ['/api/orders', ref],
    enabled: !!ref,
    queryFn: async () => {
      const response = await fetch(`/api/orders/${ref}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      return response.json();
    },
  });

  const order = data?.order || localOrder;

  const handleDownloadPDF = () => {
    if (order?.ref) {
      window.open(`/api/receipt/${order.ref}`, '_blank');
      toast({
        title: "Download started",
        description: "Your receipt is being downloaded.",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Skeleton className="h-8 w-48 mb-8" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Receipt Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The receipt you're looking for doesn't exist or may have been removed.
            </p>
            <div className="space-x-4">
              <Link href="/">
                <Button>Back to Shop</Button>
              </Link>
              <Link href="/track">
                <Button variant="outline">Track Order</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header with navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Button variant="ghost" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} data-testid="button-print-receipt">
                Print Receipt
              </Button>
              <Button onClick={handleDownloadPDF} data-testid="button-download-pdf">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Success message for new orders */}
          {!ref && localOrder && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Order Confirmed!</h3>
                    <p className="text-sm text-green-700">
                      Your order has been placed successfully. A confirmation email has been sent.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Receipt Card */}
          <Card className="print:shadow-none print:border-0" data-testid="card-receipt">
            <CardHeader className="text-center border-b">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">LWG</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">LWG Partners Network</h1>
                  <p className="text-sm text-muted-foreground">Professional Solutions Marketplace</p>
                </div>
              </div>
              <CardTitle className="text-2xl">Order Receipt</CardTitle>
              <div className="flex items-center justify-center gap-4 mt-4">
                <Badge variant="outline" className="text-lg px-4 py-1" data-testid="text-order-ref">
                  {order.ref}
                </Badge>
                <Badge className={getStatusColor(order.status)} data-testid="badge-receipt-status">
                  {order.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Date:</span>
                      <span data-testid="text-receipt-date">{formatDate(order.createdAt!)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span data-testid="text-receipt-payment">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Zone:</span>
                      <span data-testid="text-receipt-zone">{order.deliveryZone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="text-sm">
                    <p className="font-medium" data-testid="text-receipt-customer-name">{order.customerName}</p>
                    <p className="text-muted-foreground" data-testid="text-receipt-customer-email">{order.customerEmail}</p>
                    <p className="text-muted-foreground" data-testid="text-receipt-customer-phone">{order.customerPhone}</p>
                    <p className="text-muted-foreground mt-2" data-testid="text-receipt-customer-address">
                      {order.customerAddress}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-4">Items Ordered</h3>
                <div className="space-y-3">
                  {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-start py-3 border-b border-border last:border-0" data-testid={`receipt-item-${index}`}>
                      <div className="flex-1">
                        <h4 className="font-medium" data-testid={`receipt-item-title-${index}`}>{item.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Price: {formatPrice(item.price)}</span>
                          <span>Qty: {item.qty}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold" data-testid={`receipt-item-total-${index}`}>
                          {formatPrice(item.price * item.qty)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span data-testid="text-receipt-subtotal">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee:</span>
                  <span data-testid="text-receipt-delivery">{formatPrice(order.deliveryFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span data-testid="text-receipt-grand-total">{formatPrice(order.grandTotal)}</span>
                </div>
              </div>

              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Order Notes</h3>
                    <p className="text-sm text-muted-foreground" data-testid="text-receipt-notes">
                      {order.notes}
                    </p>
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="text-center text-sm text-muted-foreground pt-6 border-t">
                <p>Thank you for your business!</p>
                <p className="mt-2">
                  For support, contact us at info@lwgpartners.com or +232 XX XXX XXX
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons for non-print view */}
          <div className="flex justify-center gap-4 mt-8 print:hidden">
            <Link href="/track">
              <Button variant="outline" data-testid="button-track-another">
                Track Another Order
              </Button>
            </Link>
            <Link href="/">
              <Button data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
