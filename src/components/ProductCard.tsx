
import React from 'react';
import { Star, ShoppingCart, Package, Info, CreditCard, QrCode, FileText, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { getFallbackImageForProduct } from '@/lib/product-image';
import { ProductDetailsSheet } from './ProductDetailsSheet';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [imageSrc, setImageSrc] = React.useState(product.image);

  React.useEffect(() => {
    setImageSrc(product.image);
  }, [product.image]);

  const handleImageError = React.useCallback(() => {
    const fallback = getFallbackImageForProduct(product.name);
    setImageSrc((current) => (current === fallback ? current : fallback));
  }, [product.name]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-green-100 hover:border-green-200">
      <div className="relative overflow-hidden">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 bg-green-100 text-green-800"
        >
          {product.category}
        </Badge>
        {product.stock < 10 && (
          <Badge 
            variant="destructive" 
            className="absolute top-2 right-2"
          >
            Últimas unidades
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-green-900 mb-2 group-hover:text-green-700 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {product.rating} ({product.reviews} avaliações)
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-green-800">
            {formatPrice(product.price)}
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Package className="h-4 w-4" />
            <span>{product.weight}g</span>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5 text-[11px] text-green-800">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 border border-green-200">
            <CreditCard className="h-3 w-3" /> Cartões
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 border border-green-200">
            <QrCode className="h-3 w-3" /> PIX
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 border border-green-200">
            <FileText className="h-3 w-3" /> Boleto
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 border border-green-200">
            <Landmark className="h-3 w-3" /> Transferência
          </span>
        </div>

        <div className="flex items-center gap-1 text-sm">
          <span className="text-gray-600">Estoque:</span>
          <span className={`font-medium ${
            product.stock > 10 ? 'text-green-600' : 
            product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {product.stock > 0 ? `${product.stock} unidades` : 'Esgotado'}
          </span>
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 p-4 pt-0">
        <ProductDetailsSheet product={product}>
          <Button
            variant="outline"
            className="w-full border-green-200 text-green-800 hover:text-green-900 flex items-center justify-center gap-2 px-3 whitespace-normal text-center"
          >
            <Info className="h-4 w-4" aria-hidden="true" />
            Detalhes
          </Button>
        </ProductDetailsSheet>

        <Button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 px-3 whitespace-normal text-center"
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock > 0 ? 'Comprar' : 'Esgotado'}
        </Button>
      </CardFooter>
    </Card>
  );
};
