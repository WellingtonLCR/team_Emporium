
import React from 'react';
import { Leaf, ShoppingCart, Truck, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Hero = () => {
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute transform rotate-45 -top-10 -right-10 w-96 h-96 bg-green-400 rounded-full"></div>
        <div className="absolute transform -rotate-45 -bottom-10 -left-10 w-96 h-96 bg-green-300 rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px] py-12">
          {/* Conteúdo */}
          <div className="relative z-20 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-green-900 leading-tight">
                Os Melhores
                <span className="block text-green-600">Chás Premium</span>
                do Brasil
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Descubra nossa seleção exclusiva de chás importados e nacionais. 
                Qualidade superior, sabores únicos e entrega rápida em todo o país.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-start gap-3 sm:gap-4">
              <Button 
                onClick={() => scrollToSection('products')}
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white px-7 md:px-8 py-4 text-base md:text-lg shrink-0"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ver Produtos
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => scrollToSection('about')}
                className="border-green-600 text-green-700 hover:bg-green-50 px-7 md:px-8 py-4 text-base md:text-lg shrink-0 min-w-fit"
              >
                <Leaf className="h-5 w-5 mr-2" />
                Sobre Nossos Chás
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => scrollToSection('mvv')}
                className="border-green-600 text-green-700 hover:bg-green-50 px-7 md:px-8 py-4 text-base md:text-lg min-w-fit whitespace-normal md:whitespace-nowrap leading-snug"
              >
                <Award className="h-5 w-5 mr-2" />
                <span className="md:hidden">Missão & Valores</span>
                <span className="hidden md:inline">Missão, Visão e Valores</span>
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Frete Grátis</h3>
                  <p className="text-sm text-gray-600">Acima de R$ 100</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Qualidade</h3>
                  <p className="text-sm text-gray-600">Premium Garantida</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">100% Natural</h3>
                  <p className="text-sm text-gray-600">Sem Conservantes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Imagem */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop"
                alt="Chás Premium"
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
              />
              
              {/* Badge flutuante */}
              <div className="absolute -top-4 -left-4 bg-green-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                🏆 Melhor Avaliado
              </div>
              
              {/* Badge de desconto */}
              <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                -15% OFF
              </div>
            </div>

            {/* Elementos decorativos */}
            <div className="absolute top-10 -right-10 w-20 h-20 bg-green-200 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-green-100 rounded-full opacity-60 animate-pulse [animation-delay:1s]"></div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="bg-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-green-200 text-sm md:text-base">Produtos Vendidos</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">50+</div>
              <div className="text-green-200 text-sm md:text-base">Variedades de Chá</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
              <div className="text-green-200 text-sm md:text-base">Clientes Satisfeitos</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">24h</div>
              <div className="text-green-200 text-sm md:text-base">Entrega Rápida</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
