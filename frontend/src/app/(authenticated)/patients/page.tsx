"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Phone, Calendar } from "lucide-react";

const GET_ALL_PATIENTS = gql`
  query GetAllPatients {
    allPatients {
      id
      name
      phone
      age
      pathologies
      createdAt
    }
  }
`;

export default function PatientsPage() {
  const { data, loading, error } = useQuery(GET_ALL_PATIENTS);

  if (loading) return <div className="text-center">Chargement...</div>;
  if (error) return <div className="text-center text-destructive">Erreur: {error.message}</div>;

  const patients = (data as any)?.allPatients || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des patients</h1>
        <p className="text-muted-foreground">Liste de tous les patients de la plateforme</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient: any) => (
          <Card key={patient.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {patient.name?.charAt(0)?.toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{patient.name || "Patient"}</CardTitle>
                  <CardDescription>{patient.phone}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patient.age && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Âge:</span>
                    <span>{patient.age} ans</span>
                  </div>
                )}
                {patient.pathologies && patient.pathologies.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Pathologies:</span>
                    <div className="flex flex-wrap gap-1">
                      {patient.pathologies.map((pathology: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {pathology}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Inscrit le {new Date(patient.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {patients.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Aucun patient</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

