"use client";

import { useQuery, gql } from "@apollo/client";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, DollarSign, TrendingUp } from "lucide-react";

const GET_DOCTOR_STATS = gql`
  query GetDoctorStats {
    me {
      id
    }
    consultations(status: "active") {
      id
      status
    }
  }
`;

const GET_ADMIN_STATS = gql`
  query GetAdminStats {
    doctors {
      id
    }
    consultations {
      id
      status
    }
  }
`;

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const { data: doctorData, loading: doctorLoading } = useQuery(GET_DOCTOR_STATS, {
    skip: isAdmin,
  });

  const { data: adminData, loading: adminLoading } = useQuery(GET_ADMIN_STATS, {
    skip: !isAdmin,
  });

  const loading = isAdmin ? adminLoading : doctorLoading;
  const data = isAdmin ? adminData : doctorData;

  if (loading) {
    return <div className="text-center">Chargement...</div>;
  }

  const stats = isAdmin
    ? [
        {
          title: "Médecins",
          value: adminData?.doctors?.length || 0,
          icon: Users,
          description: "Médecins enregistrés",
        },
        {
          title: "Consultations",
          value: adminData?.consultations?.length || 0,
          icon: MessageSquare,
          description: "Total consultations",
        },
        {
          title: "Revenus",
          value: "2,450,000 Ar",
          icon: DollarSign,
          description: "Chiffre d'affaires",
        },
        {
          title: "Croissance",
          value: "+12.5%",
          icon: TrendingUp,
          description: "Ce mois",
        },
      ]
    : [
        {
          title: "Consultations actives",
          value: doctorData?.consultations?.length || 0,
          icon: MessageSquare,
          description: "En cours",
        },
        {
          title: "Revenu du jour",
          value: "125,000 Ar",
          icon: DollarSign,
          description: "Aujourd'hui",
        },
        {
          title: "Consultations du mois",
          value: "42",
          icon: TrendingUp,
          description: "Ce mois",
        },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {isAdmin ? "Vue d'ensemble du système" : "Vue d'ensemble de vos consultations"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consultations récentes</CardTitle>
          <CardDescription>Dernières consultations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium">Patient {i}</p>
                  <p className="text-sm text-muted-foreground">Il y a {i} heure(s)</p>
                </div>
                <Badge variant={i === 1 ? "default" : "secondary"}>
                  {i === 1 ? "Active" : "Terminée"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

