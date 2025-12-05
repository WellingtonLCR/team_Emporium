import React from "react";
import whatsappLogo from "../../logo-whatsapp-verde.png";

const WHATSAPP_NUMBER = "5514991646300";
const DEFAULT_MESSAGE = encodeURIComponent("Olá! Gostaria de saber mais sobre os chás premium da TeaShop.");

export const WhatsAppFloatingButton = () => {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-[#25D366]/40 transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:right-6 sm:bottom-8"
      aria-label="Conversar no WhatsApp"
    >
      <span className="sr-only">Conversar no WhatsApp</span>
      <img
        src={whatsappLogo}
        alt="WhatsApp"
        className="h-8 w-8 object-contain"
        loading="lazy"
      />
    </a>
  );
};
