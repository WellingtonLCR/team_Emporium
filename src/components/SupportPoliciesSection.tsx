import React from "react";
import { RefreshCw, MapPin, ShieldCheck, MessageCircle, Clock3, PackageCheck } from "lucide-react";

export const SupportPoliciesSection = () => {
  const policies = [
    {
      icon: RefreshCw,
      title: "Cancelamento facilitado",
      description:
        "Solicite o cancelamento em até 30 minutos após a compra diretamente pelo Meu Pedido ou pelo nosso atendimento 24/7.",
      details: "Valores estornados pelo mesmo método de pagamento em até 3 dias úteis após aprovação.",
    },
    {
      icon: MapPin,
      title: "Alteração de endereço",
      description:
        "Comunique ajustes de entrega antes da expedição. Validamos o novo endereço e atualizamos o envio em tempo real.",
      details: "Pedidos já despachados podem ser redirecionados com custo adicional informado previamente.",
    },
    {
      icon: MessageCircle,
      title: "Suporte omnichannel",
      description:
        "Atendimento por WhatsApp, e-mail e chat ao vivo. Resposta média inferior a 5 minutos durante o horário comercial.",
      details: "Casos complexos recebem acompanhamento dedicado até a resolução completa.",
    },
    {
      icon: ShieldCheck,
      title: "Garantia TeaShop",
      description:
        "Todos os pedidos contam com proteção contra extravio, avarias de transporte e divergências de itens.",
      details: "Se algo não estiver perfeito, reenvio imediato ou reembolso integral sem burocracia.",
    },
    {
      icon: Clock3,
      title: "Prazo flexível",
      description:
        "Reagende a entrega quando precisar. Oferecemos janelas de entrega e retirada em pontos parceiros.",
      details: "Disponível para capitais e principais regiões metropolitanas.",
    },
    {
      icon: PackageCheck,
      title: "Troca & devolução simples",
      description:
        "Até 7 dias após o recebimento para devolução sem custo. Produtos com defeito são coletados na sua casa.",
      details: "Basta acionar a central pelo Meu Pedido e imprimir a autorização de postagem.",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-green-50 py-16" id="politicas">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-green-900 sm:text-4xl">
            Política de Atendimento Premium
          </h2>
          <p className="mt-3 text-base text-green-700/80 sm:text-lg">
            Inspirados em líderes do e-commerce, garantimos processos ágeis e transparentes para cuidar da sua compra
            do início ao fim.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map(({ icon: Icon, title, description, details }) => (
            <div
              key={title}
              className="group h-full rounded-3xl border border-green-100 bg-white/90 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-green-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-green-700/90">{description}</p>
              <p className="mt-3 text-xs text-green-600/80">{details}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
