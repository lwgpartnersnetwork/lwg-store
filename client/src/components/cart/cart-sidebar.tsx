import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { formatPrice, getDeliveryFee } from '@/lib/utils';
import { useState } from 'react';
import CheckoutModal from '@/components/checkout/checkout-modal';

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryZone] = useState('freetown'); // Default delivery zone
  
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee(deliveryZone);
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    closeCart();
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <div className={`fixed inset-y-0 right-0 z-50 w-96 bg-card border-l border-border shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <Button variant="ghost" size="sm" onClick={closeCart} data-testid="button-close-cart">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Your cart is empty</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 pb-4 border-b border-border mb-4" data-testid={`cart-item-${item.id}`}>
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium" data-testid={`text-item-title-${item.id}`}>{item.title}</h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-item-price-${item.id}`}>{formatPrice(item.price)}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full p-0"
                        data-testid={`button-decrease-${item.id}`}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm" data-testid={`text-quantity-${item.id}`}>{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full p-0"
                        data-testid={`button-increase-${item.id}`}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive/80"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
          
          {items.length > 0 && (
            <div className="border-t border-border p-6">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span data-testid="text-subtotal">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span data-testid="text-delivery-fee">{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="text-total">{formatPrice(total)}</span>
                </div>
              </div>
              <Button 
                onClick={handleCheckout}
                className="w-full bg-primary text-primary-foreground py-3 hover:bg-primary/90"
                data-testid="button-checkout"
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={closeCart}
          data-testid="cart-backdrop"
        />
      )}

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        total={total}
      />
    </>
  );
}
