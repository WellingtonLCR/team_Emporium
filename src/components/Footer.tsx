
import React from "react";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, CreditCard, Landmark, FileText, QrCode } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-green-900 via-green-950 to-green-950 text-green-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3.5">
            <h3 className="text-2xl font-semibold tracking-tight">🍃 TeaShop</h3>
            <p className="text-sm leading-relaxed text-green-200">
              Selecionamos chás premium com origem certificada, práticas sustentáveis e curadoria sommelier para transformar cada xícara em um ritual.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-green-700/60 bg-white/5 text-green-200 transition-colors duration-200 hover:border-green-400 hover:text-white"
              >
                <span className="sr-only">Facebook</span>
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-green-700/60 bg-white/5 text-green-200 transition-colors duration-200 hover:border-green-400 hover:text-white"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-green-700/60 bg-white/5 text-green-200 transition-colors duration-200 hover:border-green-400 hover:text-white"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-green-300">Navegação</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-green-200">
              <a href="/" className="hover:text-white transition-colors duration-150">Início</a>
              <a href="#products" className="hover:text-white transition-colors duration-150">Produtos</a>
              <a href="#about" className="hover:text-white transition-colors duration-150">Sobre nós</a>
              <a href="#mvv" className="hover:text-white transition-colors duration-150">Missão, Visão e Valores</a>
              <a href="#contact" className="hover:text-white transition-colors duration-150">Contato</a>
              <a href="/login" className="hover:text-white transition-colors duration-150">Área do cliente</a>
              <a href="/register" className="hover:text-white transition-colors duration-150">Criar conta</a>
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-green-300">Contato</h4>
            <ul className="space-y-3 text-sm text-green-200">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                <span className="leading-relaxed">
                  Rua das Flores, 123
                  <br /> Centro, São Paulo - SP
                  <br /> CEP 01234-567
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-green-400" />
                <a href="tel:+551199998888" className="hover:text-white transition-colors duration-150">(11) 9999-8888</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-green-400" />
                <a href="mailto:contato@teashop.com.br" className="hover:text-white transition-colors duration-150">contato@teashop.com.br</a>
              </li>
            </ul>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-green-300">Localização</h4>
            <div className="overflow-hidden rounded-xl border border-green-800/60">
              <iframe
                title="Mapa - Rua das Flores, 123, São Paulo"
                src="https://www.google.com/maps?q=Rua%20das%20Flores%2C%20123%20-%20Centro%2C%20S%C3%A3o%20Paulo%20-%20SP&output=embed"
                width="100%"
                height="220"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="grid gap-4 text-sm text-green-100 md:grid-cols-2 md:items-start">
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-widest text-green-300">Horário de atendimento</h5>
              <p className="mt-1.5 text-xs sm:text-sm">
                Segunda a Sexta <span className="text-green-300">8h às 18h</span><br />
                Sábado <span className="text-green-300">8h às 14h</span><br />
                Domingo <span className="text-green-300">Fechado</span>
              </p>
            </div>
            <div className="md:text-right">
              <h5 className="text-xs font-semibold uppercase tracking-widest text-green-300">Formas de pagamento</h5>
              <p className="mt-1.5 text-xs sm:text-sm">Cartões de crédito e débito · PIX · Boleto bancário · Transferência bancária</p>
              <div className="mt-2 flex flex-wrap gap-2 md:justify-end text-green-200">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs border border-green-800/60"><CreditCard className="h-3.5 w-3.5"/> Cartões</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs border border-green-800/60"><QrCode className="h-3.5 w-3.5"/> PIX</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs border border-green-800/60"><FileText className="h-3.5 w-3.5"/> Boleto</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs border border-green-800/60"><Landmark className="h-3.5 w-3.5"/> Transferência</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-green-800/60 pt-4 text-center text-xs text-green-500 sm:text-sm sm:flex sm:items-center sm:justify-between">
          <p>© 2024 TeaShop. Todos os direitos reservados.</p>
          <div className="mt-4 flex justify-center gap-4 sm:mt-0">
            <a href="#" className="hover:text-green-300 transition-colors duration-150">Política de Privacidade</a>
            <a href="#" className="hover:text-green-300 transition-colors duration-150">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
