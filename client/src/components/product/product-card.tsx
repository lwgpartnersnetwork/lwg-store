import { Link } from 'wouter';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@shared/schema';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      title: product.title,
      price: parseFloat(product.price),
      image: product.image,
    });
    
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technology: 'bg-blue-100 text-blue-800',
      office: 'bg-green-100 text-green-800',
      consulting: 'bg-purple-100 text-purple-800',
      services: 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1" data-testid={`card-product-${product.id}`}>
      <Link href={`/product/${product.slug}`}>
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-semibold text-lg hover:text-primary transition-colors" data-testid={`text-product-title-${product.id}`}>
              {product.title}
            </h3>
          </Link>
          {product.featured && (
            <Badge className="bg-accent/10 text-accent" data-testid={`badge-featured-${product.id}`}>
              Featured
            </Badge>
          )}
          {!product.featured && (
            <Badge className={getCategoryColor(product.category)} data-testid={`badge-category-${product.id}`}>
              {product.category}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-product-description-${product.id}`}>
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-muted-foreground" data-testid={`text-product-stock-${product.id}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
        <Button 
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
}
