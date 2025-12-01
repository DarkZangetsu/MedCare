"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react";

const GET_CONSULTATIONS = gql`
  query GetConsultations {
    consultations {
      id
      patient {
        id
        name
        phone
        age
      }
      status
      createdAt
      updatedAt
    }
  }
`;

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> En attente</Badge>;
    case "active":
      return <Badge variant="default"><MessageSquare className="mr-1 h-3 w-3" /> Active</Badge>;
    case "completed":
      return <Badge variant="outline"><CheckCircle className="mr-1 h-3 w-3" /> Terminée</Badge>;
    case "cancelled":
      return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Annulée</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function ConsultationsPage() {
  const { data, loading, error } = useQuery(GET_CONSULTATIONS);

  if (loading) return <div className="text-center">Chargement...</div>;
  if (error) return <div className="text-center text-destructive">Erreur: {error.message}</div>;

  const consultations = (data as any)?.consultations || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Consultations</h1>
        <p className="text-muted-foreground">Gérez vos consultations avec les patients</p>
      </div>

      <div className="grid gap-4">
        {consultations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Aucune consultation pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          consultations.map((consultation: any) => (
            <Card key={consultation.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{consultation.patient.name || "Patient"}</CardTitle>
                    <CardDescription>
                      {consultation.patient.phone} {consultation.patient.age && `• ${consultation.patient.age} ans`}
                    </CardDescription>
                  </div>
                  {getStatusBadge(consultation.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Créée le {new Date(consultation.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                  <Link href={`/consultations/${consultation.id}`}>
                    <Button variant="default">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Ouvrir le chat
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

