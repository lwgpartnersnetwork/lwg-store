import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { insertProductSchema } from '@shared/schema';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductForm({ isOpen, onClose }: ProductFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      price: '0',
      image: '',
      stock: 0,
      category: 'technology',
      tags: [],
      featured: false,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product created successfully",
        description: "The product has been added to your catalog.",
      });
      form.reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
    },
    onError: () => {
      toast({
        title: "Failed to create product",
        description: "There was an error creating the product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const tags = data.tags ? data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];
    
    createProductMutation.mutate({
      ...data,
      slug,
      tags,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-product-form">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                {...form.register('title')}
                data-testid="input-product-title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="price">Price (NLe)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...form.register('price')}
                data-testid="input-product-price"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              rows={3}
              data-testid="textarea-product-description"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              type="url"
              {...form.register('image')}
              placeholder="https://example.com/image.jpg"
              data-testid="input-product-image"
            />
            {form.formState.errors.image && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.image.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                {...form.register('stock', { valueAsNumber: true })}
                data-testid="input-product-stock"
              />
              {form.formState.errors.stock && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.stock.message}</p>
              )}
            </div>

            <div>
              <Label>Category</Label>
              <Select 
                value={form.watch('category')} 
                onValueChange={(value) => form.setValue('category', value)}
              >
                <SelectTrigger data-testid="select-product-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="office">Office Equipment</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...form.register('tags')}
              placeholder="laptop, professional, business"
              data-testid="input-product-tags"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="featured"
              checked={form.watch('featured')}
              onCheckedChange={(checked) => form.setValue('featured', !!checked)}
              data-testid="checkbox-product-featured"
            />
            <Label htmlFor="featured">Featured Product</Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createProductMutation.isPending}
              data-testid="button-create-product"
            >
              {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
