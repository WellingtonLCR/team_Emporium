import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionReady(!!data.session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Preencha e confirme a nova senha");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Erro ao atualizar senha");
      return;
    }
    toast.success("Senha atualizada com sucesso");
    navigate("/login");
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header onSearch={() => {}} />
        <div className="py-10 flex items-center justify-center px-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Atualizar senha</CardTitle>
              <CardDescription>Defina uma nova senha para sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              {!sessionReady ? (
                <div className="text-sm text-muted-foreground">
                  Abra o link de recuperação enviado ao seu e-mail para continuar.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">Nova senha</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm">Confirmar senha</Label>
                    <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar nova senha"}
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Voltar para <Link to="/login" className="text-primary underline">Login</Link>
              </span>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    </CartProvider>
  );
}

export default ResetPassword;
