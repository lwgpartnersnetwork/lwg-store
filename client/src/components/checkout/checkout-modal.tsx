import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useCartStore } from '@/lib/cart';
import { formatPrice, getDeliveryFee } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const checkoutSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(1, 'Phone number is required'),
  customerAddress: z.string().min(1, 'Address is required'),
  deliveryZone: z.enum(['freetown', 'western-area', 'provinces']),
  paymentMethod: z.enum(['cash', 'mobile', 'bank']),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export default function CheckoutModal({ isOpen, onClose, subtotal }: CheckoutModalProps) {
  const [, setLocation] = useLocation();
  const { items, clearCart } = useCartStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      deliveryZone: 'freetown',
      paymentMethod: 'cash',
      notes: '',
    },
  });

  const deliveryZone = form.watch('deliveryZone');
  const currentDeliveryFee = getDeliveryFee(deliveryZone);
  const currentTotal = subtotal + currentDeliveryFee;

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          title: item.title,
          price: item.price,
          qty: item.quantity,
        })),
        subtotal,
        deliveryFee: currentDeliveryFee,
        grandTotal: currentTotal,
        ...data,
      };

      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: (data) => {
      clearCart();
      localStorage.setItem('recentOrder', JSON.stringify(data.order));
      toast({
        title: "Order placed successfully!",
        description: `Your order ${data.order.ref} has been created.`,
      });
      onClose();
      setLocation(`/receipt/${data.order.ref}`);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
    },
    onError: () => {
      toast({
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    createOrderMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-checkout">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name</Label>
                <Input
                  id="customerName"
                  {...form.register('customerName')}
                  data-testid="input-customer-name"
                />
                {form.formState.errors.customerName && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.customerName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="customerEmail">Email Address</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...form.register('customerEmail')}
                  data-testid="input-customer-email"
                />
                {form.formState.errors.customerEmail && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.customerEmail.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="customerPhone">Phone Number</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  {...form.register('customerPhone')}
                  data-testid="input-customer-phone"
                />
                {form.formState.errors.customerPhone && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.customerPhone.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="customerAddress">Delivery Address</Label>
                <Textarea
                  id="customerAddress"
                  {...form.register('customerAddress')}
                  rows={3}
                  data-testid="textarea-customer-address"
                />
                {form.formState.errors.customerAddress && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.customerAddress.message}</p>
                )}
              </div>
              
              <div>
                <Label>Delivery Zone</Label>
                <Select 
                  value={deliveryZone} 
                  onValueChange={(value) => form.setValue('deliveryZone', value as any)}
                >
                  <SelectTrigger data-testid="select-delivery-zone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freetown">Freetown (NLe 25)</SelectItem>
                    <SelectItem value="western-area">Western Area (NLe 50)</SelectItem>
                    <SelectItem value="provinces">Provinces (NLe 100)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Payment Method</Label>
                <RadioGroup 
                  value={form.watch('paymentMethod')} 
                  onValueChange={(value) => form.setValue('paymentMethod', value as any)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Cash on Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile" id="mobile" />
                    <Label htmlFor="mobile">Mobile Money</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank">Bank Transfer</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  {...form.register('notes')}
                  rows={2}
                  placeholder="Any special instructions..."
                  data-testid="textarea-notes"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="bg-secondary rounded-lg p-4 space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span data-testid="text-checkout-subtotal">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span data-testid="text-checkout-delivery">{formatPrice(currentDeliveryFee)}</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span data-testid="text-checkout-total">{formatPrice(currentTotal)}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full bg-primary text-primary-foreground py-3 hover:bg-primary/90"
                data-testid="button-place-order"
              >
                <Check className="h-4 w-4 mr-2" />
                {createOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                By placing this order, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
