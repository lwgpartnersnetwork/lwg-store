import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ProductFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: string;
  onPriceRangeChange: (range: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function ProductFilters({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortBy,
  onSortChange,
}: ProductFiltersProps) {
  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'technology', label: 'Technology' },
    { value: 'office', label: 'Office Equipment' },
    { value: 'services', label: 'Services' },
    { value: 'consulting', label: 'Consulting' },
  ];

  return (
    <section className="py-8 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(category.value)}
                data-testid={`button-category-${category.value}`}
              >
                {category.label}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={priceRange} onValueChange={onPriceRangeChange}>
              <SelectTrigger className="w-[180px]" data-testid="select-price-range">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-100">NLe 0 - 100</SelectItem>
                <SelectItem value="100-500">NLe 100 - 500</SelectItem>
                <SelectItem value="500-1000">NLe 500 - 1,000</SelectItem>
                <SelectItem value="1000+">NLe 1,000+</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[180px]" data-testid="select-sort-by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}
