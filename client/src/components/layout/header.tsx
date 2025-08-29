import { useState } from 'react';
import { Link } from 'wouter';
import { Search, Truck, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/cart';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { toggleCart, getItemCount } = useCartStore();
  const itemCount = getItemCount();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">LWG</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">LWG Partners</h1>
              <p className="text-xs text-muted-foreground">Professional Network</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
                data-testid="input-search"
              />
            </form>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/track">
              <Button variant="ghost" size="sm" data-testid="button-track-order">
                <Truck className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Track Order</span>
              </Button>
            </Link>
            
            <Link href="/admin">
              <Button variant="ghost" size="sm" data-testid="button-admin">
                <ShieldCheck className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>

            <Button 
              onClick={toggleCart}
              className="relative bg-accent hover:bg-accent/90 text-accent-foreground"
              data-testid="button-cart"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center" data-testid="text-cart-count">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
