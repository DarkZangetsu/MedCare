"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Bienvenue, {user?.name || user?.email}</h2>
        <Badge variant={user?.role === "admin" ? "default" : "secondary"}>
          {user?.role === "admin" ? "Administrateur" : "Médecin"}
        </Badge>
      </div>
      <Avatar>
        <AvatarImage src="" alt={user?.name || user?.email} />
        <AvatarFallback>
          {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </header>
  );
}

