"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";

const UPDATE_DOCTOR_PROFILE = gql`
  mutation UpdateDoctorProfile($price: Float!, $specialty: String!, $isOnline: Boolean!) {
    updateDoctorProfile(price: $price, specialty: $specialty, isOnline: $isOnline) {
      id
      price
      specialty
      isOnline
    }
  }
`;

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [price, setPrice] = useState("50000");
  const [specialty, setSpecialty] = useState("Médecine générale");
  const [isOnline, setIsOnline] = useState(true);
  const [saved, setSaved] = useState(false);

  const [updateProfile, { loading }] = useMutation(UPDATE_DOCTOR_PROFILE, {
    onCompleted: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      variables: {
        price: parseFloat(price),
        specialty,
        isOnline,
      },
    });
  };

  if (user?.role === "admin") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Configuration système</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Paramètres administrateur</CardTitle>
            <CardDescription>Configuration globale du système</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Paramètres à venir...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Gérez vos paramètres de profil</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil médecin</CardTitle>
          <CardDescription>Modifiez vos informations professionnelles</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix de consultation (Ar)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Spécialité</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Médecine générale">Médecine générale</SelectItem>
                  <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                  <SelectItem value="Dermatologie">Dermatologie</SelectItem>
                  <SelectItem value="Pédiatrie">Pédiatrie</SelectItem>
                  <SelectItem value="Gynécologie">Gynécologie</SelectItem>
                  <SelectItem value="Neurologie">Neurologie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={isOnline ? "default" : "outline"}
                  onClick={() => setIsOnline(true)}
                >
                  Disponible
                </Button>
                <Button
                  type="button"
                  variant={!isOnline ? "default" : "outline"}
                  onClick={() => setIsOnline(false)}
                >
                  Indisponible
                </Button>
                <Badge variant={isOnline ? "default" : "secondary"}>
                  {isOnline ? "En ligne" : "Hors ligne"}
                </Badge>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
            {saved && <p className="text-sm text-green-600">Paramètres enregistrés !</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

