import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { resolveProductImage } from '@/lib/product-image';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    staleTime: 1000 * 60,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Converter para o tipo Product esperado e priorizar imagem do banco
      return data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        image: resolveProductImage(product.name, product.image),
        category: product.category,
        stock: product.stock,
        weight: product.weight,
        rating: Number(product.rating),
        reviews: product.reviews
      })) as Product[];
    }
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['product-categories'],
    staleTime: 1000 * 60,
    retry: 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category');
      
      if (error) throw error;
      
      const categories = ['Todos', ...new Set(
        data
          .map(p => p.category)
          .filter((category): category is string => typeof category === 'string' && category.trim().length > 0)
      )];
      return categories;
    }
  });
};
