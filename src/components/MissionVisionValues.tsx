import React from "react";
import { Target, Eye, Star } from "lucide-react";

export const MissionVisionValues = () => {
  return (
    <section id="mvv" className="bg-green-50 py-16 border-t border-green-100 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white border border-green-100 rounded-2xl p-8 shadow-sm transform-gpu transition-transform duration-300 ease-out will-change-transform hover:scale-125 hover:z-10 relative">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-semibold text-green-900">Nossa Missão</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Levar experiências memoráveis com chás de alta qualidade, selecionados
                com responsabilidade e transparência. Queremos tornar o ritual do chá
                simples e acessível, orientando desde a escolha do blend até o preparo
                perfeito, para que cada xícara gere bem-estar, pausa consciente e conexão
                entre pessoas.
              </p>
            </div>
            <div className="bg-white border border-green-100 rounded-2xl p-8 shadow-sm transform-gpu transition-transform duration-300 ease-out will-change-transform hover:scale-125 hover:z-10 relative">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-semibold text-green-900">Nossa Visão</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Ser referência em chás artesanais e sustentáveis na América Latina,
                unindo curadoria especializada, tecnologia e atendimento humano para
                encantar clientes em todos os canais. Visualizamos uma comunidade que
                valoriza origem responsável, sabores autênticos e escolhas mais
                saudáveis no dia a dia.
              </p>
            </div>
            <div className="bg-white border border-green-100 rounded-2xl p-8 shadow-sm transform-gpu transition-transform duration-300 ease-out will-change-transform hover:scale-125 hover:z-10 relative">
              <div className="flex items-center gap-3 mb-4">
                <Star className="h-6 w-6 text-green-600" />
                <h3 className="text-xl font-semibold text-green-900">Nossos Valores</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• Qualidade e autenticidade — curadoria rigorosa, sabor verdadeiro.</li>
                <li>• Sustentabilidade — respeito à natureza e às pessoas na cadeia produtiva.</li>
                <li>• Transparência — informações claras sobre origem, preparo e benefícios.</li>
                <li>• Cuidado — atendimento próximo, educação do paladar e pós-compra atento.</li>
                <li>• Comunidade — apoiamos produtores e promovemos cultura do chá.</li>
                <li>• Inovação simples — tecnologia que facilita, sem complicar a experiência.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
