import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Send } from "lucide-react";

const CONTACT_EMAIL = "contato@teashop.com";
const CONTACT_PHONE = "+55 (11) 99999-0000";

export const ContactSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("Contato pelo site TeaShop");
    const body = encodeURIComponent(`Nome: ${name || "(não informado)"}\nE-mail: ${email}\n\n${message}`);
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }, [email, message, name]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !message.trim()) {
      setError("Informe pelo menos e-mail e mensagem para continuar.");
      return;
    }
    setError(null);
    setSent(true);
    window.location.href = mailtoHref;
  };

  return (
    <section id="contact" className="bg-gradient-to-b from-green-50 via-white to-white py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl">
          <span className="text-sm font-semibold uppercase tracking-wide text-green-700">Contato</span>
          <h2 className="mt-3 text-3xl font-bold text-green-900">Fale com a TeaShop</h2>
          <p className="mt-4 text-base text-gray-600">
            Tem alguma dúvida sobre nossos chás, pedidos ou parcerias? Envie uma mensagem rápida pelo formulário ou
            utilize um dos nossos canais diretos.
          </p>

          <div className="mt-6 space-y-4 text-sm text-gray-700">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="group flex items-center gap-3 rounded-lg border border-green-100 bg-white px-4 py-3 transition hover:border-green-300 hover:bg-green-50"
            >
              <Mail className="h-5 w-5 text-green-600 group-hover:text-green-700" aria-hidden="true" />
              <div>
                <p className="font-medium text-green-900">E-mail</p>
                <span className="text-sm text-gray-600">{CONTACT_EMAIL}</span>
              </div>
            </a>

            <a
              href={`tel:${CONTACT_PHONE.replace(/[^+\d]/g, "")}`}
              className="group flex items-center gap-3 rounded-lg border border-green-100 bg-white px-4 py-3 transition hover:border-green-300 hover:bg-green-50"
            >
              <Phone className="h-5 w-5 text-green-600 group-hover:text-green-700" aria-hidden="true" />
              <div>
                <p className="font-medium text-green-900">Telefone / WhatsApp</p>
                <span className="text-sm text-gray-600">{CONTACT_PHONE}</span>
              </div>
            </a>
          </div>
        </div>

        <div className="w-full max-w-lg rounded-2xl border border-green-100 bg-white p-6 shadow-lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-green-900" htmlFor="contact-name">
                Nome
              </label>
              <Input
                id="contact-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Como gostaria de ser chamado?"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-green-900" htmlFor="contact-email">
                E-mail*
              </label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@email.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-green-900" htmlFor="contact-message">
                Mensagem*
              </label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                placeholder="Conte para nós como podemos ajudar."
                required
              />
            </div>

            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            {sent ? (
              <p className="text-sm text-green-700" role="status">
                Abrimos seu aplicativo de e-mail padrão. Caso não funcione, envie diretamente para {CONTACT_EMAIL}.
              </p>
            ) : null}

            <Button type="submit" className="flex items-center gap-2">
              <Send className="h-4 w-4" aria-hidden="true" />
              Enviar mensagem
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
