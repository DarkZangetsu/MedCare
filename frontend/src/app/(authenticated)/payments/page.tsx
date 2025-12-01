"use client";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";

const GET_PAYMENTS = gql`
  query GetPayments {
    payments {
      id
      consultation {
        id
        patient {
          name
        }
        doctor {
          name
        }
      }
      amount
      operator
      status
      transactionId
      createdAt
    }
  }
`;

const getStatusBadge = (status: string) => {
  switch (status) {
    case "success":
      return (
        <Badge variant="default">
          <CheckCircle className="mr-1 h-3 w-3" /> Réussi
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary">
          <Clock className="mr-1 h-3 w-3" /> En attente
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" /> Échoué
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
};

const getOperatorLabel = (operator: string) => {
  switch (operator) {
    case "mvola":
      return "MVola";
    case "orange":
      return "Orange Money";
    case "airtel":
      return "Airtel Money";
    default:
      return operator;
  }
};

export default function PaymentsPage() {
  const { data, loading, error } = useQuery(GET_PAYMENTS);

  if (loading) return <div className="text-center">Chargement...</div>;
  if (error) return <div className="text-center text-destructive">Erreur: {error.message}</div>;

  const payments = (data as any)?.payments || [];
  const totalRevenue = payments
    .filter((p: any) => p.status === "success")
    .reduce((sum: number, p: any) => sum + p.amount, 0);
  const commission = totalRevenue * 0.15; // 15% de commission

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des paiements</h1>
        <p className="text-muted-foreground">Suivez tous les paiements de la plateforme</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} Ar</div>
            <p className="text-xs text-muted-foreground">Paiements réussis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commission.toLocaleString()} Ar</div>
            <p className="text-xs text-muted-foreground">15% de commission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
          <CardDescription>Liste de tous les paiements effectués</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Aucun paiement pour le moment
              </div>
            ) : (
              payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {payment.consultation.patient.name} → Dr. {payment.consultation.doctor.name}
                      </p>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {getOperatorLabel(payment.operator)} • {payment.amount.toLocaleString()} Ar
                      {payment.transactionId && ` • ${payment.transactionId}`}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleString("fr-FR")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

