
import React from "react";
import { UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AdminUsersManager } from "./AdminUsersManager";

export function AdminUsersButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UsersIcon className="h-4 w-4" />
          Gerenciar Administradores
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Administradores</DialogTitle>
          <DialogDescription>
            Crie novos administradores e vincule usuários a eles.
          </DialogDescription>
        </DialogHeader>
        <AdminUsersManager />
      </DialogContent>
    </Dialog>
  );
}
