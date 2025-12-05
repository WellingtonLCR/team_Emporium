import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu e-mail");
      return;
    }
    setLoading(true);
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    if (error) {
      toast.error(error.message || "Erro ao enviar e-mail de recuperação");
      return;
    }
    toast.success("Enviamos um link de recuperação para seu e-mail");
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header onSearch={(/* query */) => {}} />
        <div className="py-10 flex items-center justify-center px-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Recuperar senha</CardTitle>
              <CardDescription>Informe seu e-mail para receber o link</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar link"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Lembrou a senha? <Link to="/login" className="text-primary underline">Entrar</Link>
              </span>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    </CartProvider>
  );
}

export default ForgotPassword;
