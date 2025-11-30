"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    tokenAuth(username: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data: any) => {
      if (data?.tokenAuth?.token) {
        setToken(data.tokenAuth.token);
        setUser({
          id: data.tokenAuth.user.id,
          email: data.tokenAuth.user.email || email,
          role: "doctor", // TODO: Récupérer depuis l'API
        });
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      setError(err.message || "Erreur de connexion");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    await login({ variables: { email, password } });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-sm border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenue sur MedCare
              </h1>
              <p className="text-gray-600 text-base">
                Connectez-vous à votre compte
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="medecin@medcare.mg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <p className="text-sm text-gray-500 text-center mt-6">
              En continuant, vous acceptez nos conditions d'utilisation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

