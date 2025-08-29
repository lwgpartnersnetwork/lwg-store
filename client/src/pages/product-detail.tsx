import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShoppingCart, Package, Star } from 'lucide-react';
import { Link } from 'wouter';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import CartSidebar from '@/components/cart/cart-sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/lib/cart';
import { formatPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@shared/schema';

export default function ProductDetail() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { addItem } = useCartStore();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<{
    ok: boolean;
    product: Product;
  }>({
    queryKey: ['/api/products', idOrSlug],
    enabled: !!idOrSlug,
  });

  const handleAddToCart = () => {
    if (data?.product) {
      addItem({
        id: data.product.id,
        title: data.product.title,
        price: parseFloat(data.product.price),
        image: data.product.image,
      });
      
      toast({
        title: "Added to cart",
        description: `${data.product.title} has been added to your cart.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="w-full h-96 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>Back to Products</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const product = data.product;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartSidebar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="bg-card rounded-lg overflow-hidden">
            <img 
              src={product.image} 
              alt={product.title}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-product-title">
                  {product.title}
                </h1>
                {product.featured && (
                  <Badge className="bg-accent/10 text-accent" data-testid="badge-featured">
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" data-testid="text-product-category">
                  {product.category}
                </Badge>
                <div className="flex items-center text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">(4.8)</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-3xl font-bold text-primary mb-2" data-testid="text-product-price">
                {formatPrice(product.price)}
              </p>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-destructive'}`} data-testid="text-product-stock">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-product-description">
                {product.description}
              </p>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" data-testid={`badge-tag-${index}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                size="lg"
                className="w-full bg-primary text-primary-foreground py-3 hover:bg-primary/90"
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg" data-testid="button-wishlist">
                  Add to Wishlist
                </Button>
                <Button variant="outline" size="lg" data-testid="button-share">
                  Share Product
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Why Choose This Product?</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  Professional grade quality
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  Fast and reliable delivery
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  Expert customer support
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-accent rounded-full mr-3"></span>
                  Competitive pricing
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
