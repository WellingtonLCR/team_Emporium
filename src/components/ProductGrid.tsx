import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCard } from './ProductCard';
import { useProducts, useProductCategories } from '@/hooks/useProducts';
import { Product } from '@/types/product';

interface ProductGridProps {
  searchQuery: string;
}

type SortOption = 'name' | 'price-asc' | 'price-desc' | 'rating' | 'stock';

export const ProductGrid = ({ searchQuery }: ProductGridProps) => {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = ['Todos'] } = useProductCategories();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'stock':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, selectedCategory, sortBy, searchQuery]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filtros */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-green-900">
            Nossos Chás {searchQuery && `- "${searchQuery}"`}
          </h2>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden border-green-200 text-green-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${showFilters ? 'block' : 'hidden md:grid'}`}>
          {/* Categorias */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Categoria
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="border-green-200 focus:border-green-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ordenação */}
          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">
              Ordenar por
            </label>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="border-green-200 focus:border-green-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="price-asc">Menor Preço</SelectItem>
                <SelectItem value="price-desc">Maior Preço</SelectItem>
                <SelectItem value="rating">Melhor Avaliado</SelectItem>
                <SelectItem value="stock">Mais Estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resultados */}
          <div className="flex items-end">
            <span className="text-sm text-gray-600">
              {filteredAndSortedProducts.length} produto(s) encontrado(s)
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Produtos */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Nenhum produto encontrado
          </h3>
          <p className="text-gray-500">
            Tente ajustar os filtros ou termos de busca
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
