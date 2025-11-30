"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, CheckCircle, Info } from "lucide-react";

// Mock data - À remplacer par une vraie query GraphQL
const mockLogs = [
  {
    id: "1",
    action: "Consultation créée",
    user: "Dr. Rakoto",
    type: "info",
    timestamp: new Date().toISOString(),
  },
  {
    id: "2",
    action: "Paiement réussi",
    user: "Patient Andriana",
    type: "success",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "3",
    action: "Médecin validé",
    user: "Admin",
    type: "success",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "4",
    action: "Erreur de connexion",
    user: "Système",
    type: "error",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
  },
];

const getLogIcon = (type: string) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case "info":
    default:
      return <Info className="h-4 w-4 text-blue-600" />;
  }
};

const getLogBadge = (type: string) => {
  switch (type) {
    case "success":
      return <Badge variant="default">Succès</Badge>;
    case "error":
      return <Badge variant="destructive">Erreur</Badge>;
    case "info":
    default:
      return <Badge variant="secondary">Info</Badge>;
  }
};

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs système</h1>
        <p className="text-muted-foreground">Journal des actions et événements système</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journal d'activité</CardTitle>
          <CardDescription>Historique des actions sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 border-b pb-4 last:border-0"
              >
                <div className="mt-1">{getLogIcon(log.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{log.action}</p>
                    {getLogBadge(log.type)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Par {log.user} • {new Date(log.timestamp).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

