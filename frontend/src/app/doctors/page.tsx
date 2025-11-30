"use client";

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";

const GET_DOCTORS = gql`
  query GetDoctors {
    doctors {
      id
      name
      specialty
      price
      isOnline
      rating
      user {
        id
        email
      }
    }
  }
`;

const APPROVE_DOCTOR = gql`
  mutation ApproveDoctor($id: UUID!) {
    approveDoctor(id: $id) {
      id
      isApproved
    }
  }
`;

const REJECT_DOCTOR = gql`
  mutation RejectDoctor($id: UUID!) {
    rejectDoctor(id: $id) {
      id
      isApproved
    }
  }
`;

export default function DoctorsPage() {
  const { data, loading, refetch } = useQuery(GET_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [approveDoctor] = useMutation(APPROVE_DOCTOR);
  const [rejectDoctor] = useMutation(REJECT_DOCTOR);

  const handleApprove = async (id: string) => {
    try {
      await approveDoctor({ variables: { id } });
      refetch();
      setSelectedDoctor(null);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectDoctor({ variables: { id } });
      refetch();
      setSelectedDoctor(null);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  if (loading) return <div className="text-center">Chargement...</div>;

  const doctors = data?.doctors || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des médecins</h1>
        <p className="text-muted-foreground">Validez et gérez les médecins de la plateforme</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor: any) => (
          <Card key={doctor.id}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={doctor.avatar} />
                  <AvatarFallback>
                    {doctor.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{doctor.name}</CardTitle>
                  <CardDescription>{doctor.specialty}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{doctor.user.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Prix:</span>
                  <span className="font-semibold">{doctor.price.toLocaleString()} Ar</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Note:</span>
                  <span>{doctor.rating || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant={doctor.isOnline ? "default" : "secondary"}>
                    {doctor.isOnline ? "En ligne" : "Hors ligne"}
                  </Badge>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApprove(doctor.id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Valider
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleReject(doctor.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Refuser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {doctors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Aucun médecin en attente</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

