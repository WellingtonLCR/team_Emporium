import React from "react";
import { Leaf, Shield, Heart } from "lucide-react";

export const AboutSection = () => {
  return (
    <section
      id="about"
      className="bg-white py-16 border-t border-green-100 scroll-mt-24"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr] items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-green-900">
              Sobre Nossos Chás
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Selecionamos cuidadosamente cada lote para garantir que você receba
              apenas chás de origem confiável, com cultivo sustentável e
              rastreabilidade completa. Nosso time de especialistas avalia aroma,
              sabor e qualidade nutritiva antes de qualquer produto chegar ao
              catálogo.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Leaf className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900">Blend Premium</h3>
                  <p className="text-sm text-gray-600">
                    Misturas exclusivas com ingredientes naturais e sem aditivos
                    artificiais, pensadas para diferentes momentos e paladares.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900">Controle de Qualidade</h3>
                  <p className="text-sm text-gray-600">
                    Parcerias com produtores certificados, análises laboratoriais
                    e logística refrigerada para preservar frescor e segurança.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900">Cuidado com Você</h3>
                  <p className="text-sm text-gray-600">
                    Embalagens sustentáveis, sugestões de preparo e
                    acompanhamento pós-compra para garantir a melhor experiência.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8 space-y-4">
            <h4 className="text-xl font-semibold text-green-900">
              Benefícios para quem é cliente TeaShop
            </h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>✔️ Programa fidelidade com degustações mensais</li>
              <li>✔️ Atendimento sommelier para montar o blend ideal</li>
              <li>✔️ Envio rápido com rastreamento em tempo real</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
