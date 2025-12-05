import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha e-mail e senha");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Erro ao entrar");
      return;
    }
    toast.success("Login realizado");
    const fromState = (location.state as any)?.from;
    const targetPath = typeof fromState?.pathname === "string" ? fromState.pathname : "/";
    const targetSearch = typeof fromState?.search === "string" ? fromState.search : "";
    const targetHash = typeof fromState?.hash === "string" ? fromState.hash : "";
    navigate(`${targetPath}${targetSearch}${targetHash}`, { replace: true });
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header onSearch={() => {}} />
        <div className="py-10 flex items-center justify-center px-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Entrar</CardTitle>
              <CardDescription>Acesse sua conta para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <div className="text-right">
                    <Link to="/forgot-password" className="text-xs text-primary underline">Esqueci minha senha</Link>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Novo por aqui? <Link to="/register" className="text-primary underline">Criar conta</Link>
              </span>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    </CartProvider>
  );
};

export default Login;
