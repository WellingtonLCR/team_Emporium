import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [document, setDocument] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword || !phone || !document || !birthDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          document,
          birth_date: birthDate,
        },
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Erro ao criar conta");
      return;
    }

    toast.success("Cadastro realizado. Verifique seu e-mail (se necessário)");
    navigate("/login");
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header onSearch={() => {}} />
        <div className="py-10 flex items-center justify-center px-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Criar conta</CardTitle>
              <CardDescription>Preencha seus dados para cadastrar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="document">CPF</Label>
                  <Input
                    id="document"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    placeholder="Somente números"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birthDate">Data de nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Já tem conta? <Link to="/login" className="text-primary underline">Entrar</Link>
              </span>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    </CartProvider>
  );
};

export default Register;
