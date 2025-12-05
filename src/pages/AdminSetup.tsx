import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";

const AdminSetup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("admin");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateOrElevate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Pequena proteção para não ficar público
    if (secret.trim() !== import.meta.env.VITE_ADMIN_BOOTSTRAP_SECRET) {
      toast.error("Código secreto inválido");
      return;
    }

    setLoading(true);
    try {
      // 1) Tenta login
      let { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

      // 2) Se falhar, tenta criar e depois logar explicitamente
      if (signInErr) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: "admin", name: "Administrador" },
          },
        });
        if (signUpErr) throw signUpErr;
        // Tenta login logo após criar (funciona se confirmação de e-mail estiver desativada)
        const retry = await supabase.auth.signInWithPassword({ email, password });
        signInData = retry.data;
      }

      // 3) Garante que temos sessão antes de continuar
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user ?? null;
      if (!user) {
        throw new Error(
          "Não foi possível obter o usuário atual. Se a confirmação de e-mail estiver ativada no Supabase, confirme o e-mail primeiro ou desative a confirmação em Authentication > Providers."
        );
      }

      // 4) Se já é admin, apenas seguir
      const currentRole = (user.user_metadata?.role as string | undefined)?.toLowerCase();
      if (currentRole !== "admin") {
        const { error: updErr } = await supabase.auth.updateUser({ data: { role: "admin" } });
        if (updErr) throw updErr;
      }

      toast.success("Usuário admin pronto. Acesse o Dashboard.");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao configurar admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header onSearch={() => {}} />
        <div className="py-10 flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Configurar Admin</CardTitle>
              <CardDescription>
                Cria ou eleva o usuário a administrador com e-mail e senha. Use um código secreto definido no .env.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrElevate} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="secret">Código Secreto</Label>
                  <Input id="secret" placeholder="Defina VITE_ADMIN_BOOTSTRAP_SECRET no .env" value={secret} onChange={(e) => setSecret(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processando..." : "Criar/Elevá-lo a Admin"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </CartProvider>
  );
};

export default AdminSetup;
