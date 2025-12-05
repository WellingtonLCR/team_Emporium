
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CartItem, Product } from '@/types/product';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = async (product: Product, quantity = 1) => {
    // Verificar estoque em tempo real no banco
    const { data: currentProduct, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', product.id)
      .single();

    if (error) {
      toast.error('Erro ao verificar estoque');
      console.error('Erro ao verificar estoque:', error);
      return;
    }

    if (!currentProduct || currentProduct.stock < quantity) {
      toast.error('Quantidade não disponível em estoque');
      return;
    }

    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > currentProduct.stock) {
          toast.error('Quantidade não disponível em estoque');
          return currentItems;
        }
        toast.success('Quantidade atualizada no carrinho');
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        toast.success('Produto adicionado ao carrinho');
        return [...currentItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId));
    toast.success('Produto removido do carrinho');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartItemsCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
