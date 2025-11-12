"use client";

import type React from "react";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";
import { RegisterCredentials } from "@/lib/interfaces/auth.interface";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      const firstName = formData.get("firstName") as string;
      const lastName = formData.get("lastName") as string;

      if (!firstName.trim() || !lastName.trim()) {
        setError("Nome e sobrenome são obrigatórios.");
        setIsLoading(false);
        return;
      }

      const userCredentials: RegisterCredentials = {
        firstName,
        lastName,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      };

      // Criar o usuário no Firebase Auth
      await signUp(userCredentials);
      await signIn({
        email: userCredentials.email,
        password: userCredentials.password,
      });

      // Redirecionar para a página de perfil para completar o cadastro
      router.push("/perfil");
    } catch (error: any) {
      console.error("Erro no registro:", error);

      // Mensagens de erro mais amigáveis baseadas no código de erro do Firebase
      if (error.code === "auth/email-already-in-use") {
        setError("Este email já está sendo usado por outra conta.");
      } else if (error.code === "auth/invalid-email") {
        setError("O formato do email é inválido.");
      } else if (error.code === "auth/weak-password") {
        setError("A senha é muito fraca. Use pelo menos 6 caracteres.");
      } else {
        setError("Falha no registro. Por favor, tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              Registre-se para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input id="firstName" placeholder="Seu nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input id="lastName" placeholder="Seu sobrenome" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Crie uma senha segura"
                  minLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A senha deve ter pelo menos 6 caracteres
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Criar Conta"}
              </Button>
              <p className="text-sm text-center">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Faça login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
