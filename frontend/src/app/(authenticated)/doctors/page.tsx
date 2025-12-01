"use client";

import { useState, useMemo } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useMutation } from "@apollo/client/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, User, Search, Filter } from "lucide-react";

const GET_PENDING_DOCTORS = gql`
  query GetPendingDoctors {
    pendingDoctors {
      id
      name
      specialty
      phone
      price
      isOnline
      isApproved
      rating
      email
    }
  }
`;

const GET_ALL_DOCTORS = gql`
  query GetAllDoctors {
    allDoctors {
      id
      name
      specialty
      phone
      price
      isOnline
      isApproved
      rating
      email
    }
  }
`;

const APPROVE_DOCTOR = gql`
  mutation ApproveDoctor($id: UUID!, $approved: Boolean!) {
    approveDoctor(id: $id, approved: $approved) {
      doctor {
        id
        isApproved
        name
        specialty
        email
        phone
      }
    }
  }
`;

export default function DoctorsPage() {
  const [showPending, setShowPending] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  
  const { data: pendingData, loading: pendingLoading, refetch: refetchPending } = useQuery(
    GET_PENDING_DOCTORS,
    { skip: !showPending }
  );
  const { data: allData, loading: allLoading, refetch: refetchAll } = useQuery(
    GET_ALL_DOCTORS,
    { skip: showPending }
  );
  const [approveDoctor] = useMutation(APPROVE_DOCTOR);

  const loading = showPending ? pendingLoading : allLoading;

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      await approveDoctor({ 
        variables: { id, approved } 
      });
      if (showPending) {
        refetchPending();
      } else {
        refetchAll();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  if (loading) return <div className="text-center">Chargement...</div>;

  const allDoctors = showPending 
    ? (pendingData as any)?.pendingDoctors || []
    : (allData as any)?.allDoctors || [];

  // Extraire toutes les spécialités uniques
  const specialties = useMemo(() => {
    const uniqueSpecialties = new Set<string>();
    allDoctors.forEach((doctor: any) => {
      if (doctor.specialty) {
        uniqueSpecialties.add(doctor.specialty);
      }
    });
    return Array.from(uniqueSpecialties).sort();
  }, [allDoctors]);

  // Filtrer les médecins
  const filteredDoctors = useMemo(() => {
    return allDoctors.filter((doctor: any) => {
      // Filtre par recherche
      const matchesSearch = searchQuery === "" || 
        doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.phone?.includes(searchQuery) ||
        doctor.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtre par spécialité
      const matchesSpecialty = specialtyFilter === "all" || doctor.specialty === specialtyFilter;
      
      return matchesSearch && matchesSpecialty;
    });
  }, [allDoctors, searchQuery, specialtyFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des médecins</h1>
          <p className="text-muted-foreground">Validez et gérez les médecins de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showPending ? "default" : "outline"}
            onClick={() => {
              setShowPending(true);
              setSearchQuery("");
              setSpecialtyFilter("all");
            }}
          >
            En attente
          </Button>
          <Button
            variant={!showPending ? "default" : "outline"}
            onClick={() => {
              setShowPending(false);
              setSearchQuery("");
              setSpecialtyFilter("all");
            }}
          >
            Tous les médecins
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtre */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom, email, téléphone ou spécialité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {!showPending && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Toutes les spécialités" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les spécialités</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Affichage en cards pour les médecins en attente */}
      {showPending ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor: any) => (
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
                  <span>{doctor.email || "N/A"}</span>
                </div>
                {doctor.phone && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Téléphone:</span>
                    <span>{doctor.phone}</span>
                  </div>
                )}
                {showPending && (
                  <div className="flex items-center gap-2 pt-2">
                    <Badge variant={doctor.isApproved ? "default" : "secondary"}>
                      {doctor.isApproved ? "Approuvé" : "En attente"}
                    </Badge>
                  </div>
                )}
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
                {showPending && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleApprove(doctor.id, true)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleApprove(doctor.id, false)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Refuser
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      ) : (
        /* Affichage en tableau pour tous les médecins */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>En ligne</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map((doctor: any) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={doctor.avatar} />
                          <AvatarFallback>
                            {doctor.name?.charAt(0)?.toUpperCase() || "D"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{doctor.name || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.specialty || "N/A"}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {doctor.email || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {doctor.phone || "N/A"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {doctor.price ? `${doctor.price.toLocaleString()} Ar` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {doctor.rating ? (
                        <div className="flex items-center gap-1">
                          <span>{doctor.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={doctor.isApproved ? "default" : "secondary"}>
                        {doctor.isApproved ? "Approuvé" : "En attente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={doctor.isOnline ? "default" : "secondary"}>
                        {doctor.isOnline ? "En ligne" : "Hors ligne"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {filteredDoctors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              {searchQuery || specialtyFilter !== "all"
                ? "Aucun médecin ne correspond à votre recherche"
                : showPending
                ? "Aucun médecin en attente"
                : "Aucun médecin"}
            </p>
            {(searchQuery || specialtyFilter !== "all") && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSpecialtyFilter("all");
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

