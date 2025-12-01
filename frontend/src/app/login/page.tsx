"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  User, 
  Shield, 
  Mail, 
  Phone, 
  Lock, 
  Loader2,
  Stethoscope,
  Building2
} from "lucide-react";

const LOGIN_DOCTOR_MUTATION = gql`
  mutation LoginDoctor($email: String, $phone: String, $password: String!) {
    loginDoctor(email: $email, phone: $phone, password: $password) {
      token
      doctor {
        id
        name
        specialty
        email
        phone
      }
    }
  }
`;

const LOGIN_ADMIN_MUTATION = gql`
  mutation LoginAdmin($email: String!, $password: String!) {
    loginAdmin(email: $email, password: $password) {
      token
      admin {
        id
        name
        email
      }
    }
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [userType, setUserType] = useState<"doctor" | "admin">("doctor");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [loginDoctor, { loading: loadingDoctor }] = useMutation(LOGIN_DOCTOR_MUTATION, {
    onCompleted: (data: any) => {
      if (data?.loginDoctor?.token && data?.loginDoctor?.doctor) {
        setToken(data.loginDoctor.token);
        setUser({
          id: data.loginDoctor.doctor.id,
          email: data.loginDoctor.doctor.email || email,
          role: "doctor",
          name: data.loginDoctor.doctor.name,
        });
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      setError(err.message || "Erreur de connexion");
    },
  });

  const [loginAdmin, { loading: loadingAdmin }] = useMutation(LOGIN_ADMIN_MUTATION, {
    onCompleted: (data: any) => {
      if (data?.loginAdmin?.token && data?.loginAdmin?.admin) {
        setToken(data.loginAdmin.token);
        setUser({
          id: data.loginAdmin.admin.id,
          email: data.loginAdmin.admin.email || email,
          role: "admin",
          name: data.loginAdmin.admin.name,
        });
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      setError(err.message || "Erreur de connexion");
    },
  });

  const loading = loadingDoctor || loadingAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (userType === "admin") {
      if (!email.trim()) {
        setError("Veuillez entrer un email");
        return;
      }
      await loginAdmin({ 
        variables: { 
          email: email.trim(), 
          password 
        } 
      });
    } else {
      const variables: any = { password };
      if (loginMethod === "email") {
        if (!email.trim()) {
          setError("Veuillez entrer un email");
          return;
        }
        variables.email = email.trim();
      } else {
        if (!phone.trim()) {
          setError("Veuillez entrer un numéro de téléphone");
          return;
        }
        variables.phone = phone.trim();
      }
      await loginDoctor({ variables });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            MedCare
          </h1>
          <p className="text-gray-600 text-lg">
            Plateforme de téléconsultation
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <h2 className="text-2xl font-semibold text-gray-900 text-center">
              Connexion
            </h2>
            <p className="text-sm text-gray-500 text-center mt-1">
              Accédez à votre espace professionnel
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Sélecteur de type d'utilisateur */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={userType === "doctor" ? "default" : "outline"}
                  className={`flex-1 h-12 transition-all ${
                    userType === "doctor" 
                      ? "bg-blue-600 hover:bg-blue-700 shadow-md" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setUserType("doctor");
                    setError("");
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Médecin
                </Button>
                <Button
                  type="button"
                  variant={userType === "admin" ? "default" : "outline"}
                  className={`flex-1 h-12 transition-all ${
                    userType === "admin" 
                      ? "bg-blue-600 hover:bg-blue-700 shadow-md" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setUserType("admin");
                    setPhone("");
                    setLoginMethod("email");
                    setError("");
                  }}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </div>

              {/* Sélecteur de méthode de connexion (uniquement pour les médecins) */}
              {userType === "doctor" && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={loginMethod === "email" ? "default" : "outline"}
                    className={`h-11 transition-all ${
                      loginMethod === "email" 
                        ? "bg-blue-600 hover:bg-blue-700 shadow-md" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setLoginMethod("email");
                      setPhone("");
                      setError("");
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={loginMethod === "phone" ? "default" : "outline"}
                    className={`h-11 transition-all ${
                      loginMethod === "phone" 
                        ? "bg-blue-600 hover:bg-blue-700 shadow-md" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setLoginMethod("phone");
                      setEmail("");
                      setError("");
                    }}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Téléphone
                  </Button>
                </div>
              )}

              {/* Champ identifiant */}
              <div className="space-y-2">
                <Label htmlFor={userType === "admin" || loginMethod === "email" ? "email" : "phone"} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  {userType === "admin" || loginMethod === "email" ? (
                    <>
                      <Mail className="h-4 w-4" />
                      Email
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      Numéro de téléphone
                    </>
                  )}
                </Label>
                <div className="relative">
                  {(userType === "admin" || loginMethod === "email") ? (
                    <Input
                      id="email"
                      type="email"
                      placeholder={userType === "admin" ? "admin@medcare.mg" : "medecin@medcare.mg"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  ) : (
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+261 34 12 345 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  )}
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {userType === "admin" || loginMethod === "email" ? (
                      <Mail className="h-5 w-5" />
                    ) : (
                      <Phone className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Champ mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="Entrez votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <div className="text-red-600 mt-0.5">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-red-800 flex-1">{error}</p>
                </div>
              )}

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full h-12 mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                En vous connectant, vous acceptez nos{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  conditions d'utilisation
                </a>{" "}
                et notre{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  politique de confidentialité
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer de la page */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Besoin d'aide ?{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Contactez le support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

