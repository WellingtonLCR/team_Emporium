
import React, { useMemo, useState } from "react";
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  CreditCard,
  Package,
  ShieldCheck,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/contexts/CartContext";
import { CheckoutModal } from "./CheckoutModal";
import { useAuth } from "@/contexts/AuthContext";
import { getFallbackImageForProduct } from "@/lib/product-image";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const SHIPPING_GOAL = 100;

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { items, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [cep, setCep] = useState("");
  const [shippingOption, setShippingOption] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const calculateShipping = () => {
    if (!cep || cep.length !== 8) return 0;
    // Simulação de cálculo de frete
    const baseShipping = 12.90;
    const total = getCartTotal();
    return total > SHIPPING_GOAL ? 0 : baseShipping; // Frete grátis acima de R$ 100
  };

  const shippingCost = calculateShipping();
  const totalWithShipping = getCartTotal() + shippingCost;
  const freteProgress = Math.min((getCartTotal() / SHIPPING_GOAL) * 100, 100);

  const canCheckout = useMemo(() => {
    if (authLoading) return false;
    if (!user) return false;
    return cep.length === 8 && Boolean(shippingOption);
  }, [authLoading, user, cep.length, shippingOption]);

  const handleCheckout = () => {
    if (authLoading) {
      toast.info('Verificando autenticação...');
      return;
    }
    if (!user) {
      toast.error('Faça login para finalizar a compra.');
      return;
    }
    setShowCheckout(true);
  };

  if (items.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:w-96">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Carrinho de Compras
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col items-center justify-center h-96">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Carrinho vazio
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Adicione alguns chás deliciosos ao seu carrinho!
            </p>
            <Button onClick={onClose} variant="outline">
              Continuar Comprando
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="flex w-full flex-col sm:w-[420px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Carrinho ({items.length} {items.length === 1 ? 'item' : 'itens'})
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="space-y-4 py-4 pr-3">
              <div className="rounded-2xl border border-green-100 bg-green-50/40 p-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-green-600" />
                  <div className="flex-1 text-sm text-green-900">
                    <p className="font-semibold">Faltam {formatPrice(Math.max(SHIPPING_GOAL - getCartTotal(), 0))} para frete grátis</p>
                    <p className="text-xs text-green-700/80">Você economiza em pedidos acima de {formatPrice(SHIPPING_GOAL)}</p>
                  </div>
                </div>
                <Progress value={freteProgress} className="mt-3 h-2 bg-white/70" />
              </div>

              <div className="space-y-3">
                {items.map((item) => {
                  const fallbackImage = getFallbackImageForProduct(item.name);
                  const imageSource = (item.image && item.image.trim().length > 0) ? item.image : fallbackImage;

                  return (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-2xl border border-green-100 bg-white/80 shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-green-400 to-green-600" />
                    <div className="flex gap-3 p-3 pl-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-green-100 bg-green-50">
                        {imageSource ? (
                          <img
                            src={imageSource}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              if (event.currentTarget.src !== fallbackImage) {
                                event.currentTarget.src = fallbackImage;
                              } else {
                                event.currentTarget.onerror = null;
                              }
                            }}
                          />
                        ) : (
                          <Skeleton className="h-full w-full" />
                        )}
                        <Badge className="absolute bottom-2 left-2 bg-white/90 text-xs text-green-700" variant="secondary">
                          {item.weight}g
                        </Badge>
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold leading-tight text-green-900">
                              {item.name}
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                              className="h-7 w-7 rounded-full text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">{item.category}</p>
                        </div>

                        <div className="mt-3 flex items-end justify-between">
                          <div>
                            <p className="text-sm font-semibold text-green-900">{formatPrice(item.price)}</p>
                            <p className="text-xs text-gray-500">Estoque: {item.stock}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 rounded-full border-green-200 text-green-700 hover:bg-green-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="min-w-[2ch] text-center text-sm font-semibold text-green-900">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 rounded-full border-green-200 text-green-700 hover:bg-green-50"
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-green-100 bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-900">
                  <Truck className="h-4 w-4" /> Calcular Frete
                </div>
                <p className="mt-1 text-xs text-gray-500">Informe seu CEP para ver opções disponíveis.</p>

                <div className="mt-3 space-y-3">
                  <Input
                    type="text"
                    placeholder="CEP (somente números)"
                    value={cep}
                    onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    className="border-green-200"
                  />

                  {cep.length === 8 && (
                    <div className="space-y-2 text-sm">
                      <Select value={shippingOption} onValueChange={setShippingOption}>
                        <SelectTrigger className="border-green-200">
                          <SelectValue placeholder="Escolha o frete" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pac">PAC · 7-10 dias úteis</SelectItem>
                          <SelectItem value="sedex">SEDEX · 2-4 dias úteis</SelectItem>
                          <SelectItem value="express">Expresso · 1-2 dias úteis</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center justify-between rounded-lg border border-dashed border-green-200 px-3 py-2">
                        <span>Frete</span>
                        <span className={shippingCost === 0 ? "font-semibold text-green-600" : "font-medium"}>
                          {shippingCost === 0 ? "GRÁTIS" : formatPrice(shippingCost)}
                        </span>
                      </div>
                      {shippingCost === 0 ? (
                        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Parabéns! Você desbloqueou frete grátis.</span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Aproximadamente {formatPrice(Math.max(SHIPPING_GOAL - getCartTotal(), 0))} para frete grátis.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-green-100 bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-900">
                  <Tag className="h-4 w-4" /> Voucher
                </div>
                <p className="mt-1 text-xs text-gray-500">Possui cupom de desconto? Insira na finalização.</p>
              </div>
            </div>
          </ScrollArea>

          <Separator className="mt-2" />

          <div className="space-y-4 border-t border-green-100 bg-white/70 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              {cep.length === 8 && (
                <div className="flex justify-between text-gray-600">
                  <span>Frete</span>
                  <span>{shippingCost === 0 ? "GRÁTIS" : formatPrice(shippingCost)}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-green-100 pt-3 text-base font-semibold text-green-900">
                <span>Total</span>
                <span>{formatPrice(totalWithShipping)}</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={!canCheckout}
              className="h-12 w-full rounded-full bg-green-600 text-base font-semibold transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {user ? "Finalizar compra" : "Entre para comprar"}
            </Button>

            {!user && !authLoading && (
              <p className="text-center text-xs text-gray-500">
                Faça login para usar seus cupons e favoritos.
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CheckoutModal
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        total={totalWithShipping}
        items={items}
        shippingCost={shippingCost}
      />
    </>
  );
};
