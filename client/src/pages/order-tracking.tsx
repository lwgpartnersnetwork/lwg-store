import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Search, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice, formatDate, getStatusColor } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@shared/schema';

const trackingSchema = z.object({
  ref: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
}).refine((data) => data.ref || data.email || data.phone, {
  message: "Please provide either order reference, email, or phone number",
});

type TrackingForm = z.infer<typeof trackingSchema>;

export default function OrderTracking() {
  const [searchMethod, setSearchMethod] = useState<'ref' | 'contact'>('ref');
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const form = useForm<TrackingForm>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      ref: '',
      email: '',
      phone: '',
    },
  });

  const handleSearch = async (data: TrackingForm) => {
    setIsSearching(true);
    setOrderData(null);

    try {
      let url = '';
      if (data.ref) {
        url = `/api/orders/${data.ref}`;
      } else {
        const params = new URLSearchParams();
        if (data.email) params.append('email', data.email);
        if (data.phone) params.append('phone', data.phone);
        url = `/api/orders/lookup?${params.toString()}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.ok) {
        setOrderData(result.order);
      } else {
        toast({
          title: "Order not found",
          description: "No order found with the provided information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "An error occurred while searching for your order.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing':
        return <Package className="h-5 w-5 text-yellow-600" />;
      case 'Shipped':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { name: 'Processing', completed: true },
      { name: 'Shipped', completed: currentStatus === 'Shipped' || currentStatus === 'Completed' },
      { name: 'Completed', completed: currentStatus === 'Completed' },
    ];
    return steps;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order details below to track your package
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Order Lookup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Search Method Toggle */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={searchMethod === 'ref' ? 'default' : 'outline'}
                    onClick={() => setSearchMethod('ref')}
                    data-testid="button-search-by-ref"
                  >
                    Order Reference
                  </Button>
                  <Button
                    type="button"
                    variant={searchMethod === 'contact' ? 'default' : 'outline'}
                    onClick={() => setSearchMethod('contact')}
                    data-testid="button-search-by-contact"
                  >
                    Email/Phone
                  </Button>
                </div>

                <form onSubmit={form.handleSubmit(handleSearch)} className="space-y-4">
                  {searchMethod === 'ref' ? (
                    <div>
                      <Label htmlFor="ref">Order Reference</Label>
                      <Input
                        id="ref"
                        placeholder="LWG-20241201-0001"
                        {...form.register('ref')}
                        data-testid="input-order-ref"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          {...form.register('email')}
                          data-testid="input-tracking-email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+232 XX XXX XXX"
                          {...form.register('phone')}
                          data-testid="input-tracking-phone"
                        />
                      </div>
                    </div>
                  )}

                  {form.formState.errors.root && (
                    <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
                  )}

                  <Button 
                    type="submit"
                    disabled={isSearching}
                    className="w-full"
                    data-testid="button-track-order"
                  >
                    {isSearching ? 'Searching...' : 'Track Order'}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Order Results */}
          {orderData && (
            <Card data-testid="card-order-results">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(orderData.status)}
                    Order {orderData.ref}
                  </CardTitle>
                  <Badge className={getStatusColor(orderData.status)} data-testid="badge-order-status">
                    {orderData.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Status Timeline */}
                <div>
                  <h3 className="font-semibold mb-4">Order Progress</h3>
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-border"></div>
                    {getStatusSteps(orderData.status).map((step, index) => (
                      <div key={step.name} className="flex flex-col items-center relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-background ${
                          step.completed ? 'border-primary bg-primary' : 'border-border'
                        }`}>
                          {step.completed && <CheckCircle className="h-4 w-4 text-primary-foreground" />}
                        </div>
                        <span className={`mt-2 text-sm ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Date:</span>
                        <span data-testid="text-order-date">{formatDate(orderData.createdAt!)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold" data-testid="text-order-total">
                          {formatPrice(orderData.grandTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment:</span>
                        <span data-testid="text-payment-method">{orderData.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Delivery Information</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Deliver to:</span>
                        <p className="mt-1" data-testid="text-delivery-name">{orderData.customerName}</p>
                        <p className="text-muted-foreground" data-testid="text-delivery-address">
                          {orderData.customerAddress}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Zone:</span>
                        <span data-testid="text-delivery-zone">{orderData.deliveryZone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {Array.isArray(orderData.items) && orderData.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0" data-testid={`order-item-${index}`}>
                        <div>
                          <p className="font-medium" data-testid={`item-title-${index}`}>{item.title}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                        </div>
                        <span className="font-semibold" data-testid={`item-price-${index}`}>
                          {formatPrice(item.price * item.qty)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link href={`/receipt/${orderData.ref}`}>
                    <Button variant="outline" data-testid="button-view-receipt">
                      View Receipt
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    onClick={() => window.open(`/api/receipt/${orderData.ref}`, '_blank')}
                    data-testid="button-download-receipt"
                  >
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
