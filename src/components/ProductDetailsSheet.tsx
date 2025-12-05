import React from "react";
import { Product } from "@/types/product";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Package, Star } from "lucide-react";

interface ProductDetailsSheetProps {
  product: Product;
  children: React.ReactNode;
}

export const ProductDetailsSheet = ({ product, children }: ProductDetailsSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl text-green-900">{product.name}</SheetTitle>
          <SheetDescription className="text-gray-600">
            Categoria: <span className="font-medium text-green-700">{product.category}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-green-700">Descrição</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-900">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium uppercase text-green-700">Avaliação média</p>
                <p className="text-sm font-semibold">{product.rating.toFixed(1)} / 5</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" aria-hidden="true" />
              <div>
                <p className="text-xs font-medium uppercase text-green-700">Peso</p>
                <p className="text-sm font-semibold">{product.weight} g</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-green-700">Como aproveitar</h3>
            <p className="mt-2 text-sm text-gray-600">
              {product.name} é preparado com folhas selecionadas e pode ser servido quente ou gelado. Ajuste o tempo de
              infusão conforme seu paladar para extrair o melhor sabor e aroma.
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-green-700">Avaliações</h3>
            <p className="mt-2 text-sm text-gray-600">
              {product.reviews > 0
                ? `${product.reviews} cliente(s) avaliaram este chá. Confira as notas e feedbacks direto na área de pedidos.`
                : "Ainda não temos avaliações registradas para este produto."}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
