
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LinkUsersDialog } from "./LinkUsersDialog";

type AdminUser = {
  id: string;
  email: string;
  linkedUsers: Array<{
    id: string;
    email: string;
  }>;
};

export function AdminUsersManager() {
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: admins, refetch: refetchAdmins } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (!adminRoles) return [];

      const { data: adminUsers } = await supabase.auth.admin.listUsers();
      if (!adminUsers?.users) return [];

      const adminList: AdminUser[] = adminRoles.map((role) => {
        const user = adminUsers.users.find((u) => u.id === role.user_id);
        return {
          id: role.user_id,
          email: user?.email || "Unknown",
          linkedUsers: [],
        };
      });

      // Fetch linked users for each admin
      for (const admin of adminList) {
        const { data: relationships } = await supabase
          .from("user_admin_relationships")
          .select("user_id")
          .eq("admin_id", admin.id);

        if (relationships) {
          const userIds = relationships.map((r) => r.user_id);
          const linkedUsers = adminUsers.users
            .filter((u) => userIds.includes(u.id))
            .map((u) => ({
              id: u.id,
              email: u.email || "Unknown",
            }));
          admin.linkedUsers = linkedUsers;
        }
      }

      return adminList;
    },
  });

  const handleCreateAdmin = async () => {
    try {
      setLoading(true);
      
      // Check if email exists in auth.users
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const user = existingUsers?.users.find(u => u.email === newAdminEmail);
      
      if (!user) {
        toast.error("Usuário não encontrado");
        return;
      }

      const { error } = await supabase
        .rpc("assign_admin_and_link_users", {
          target_user_id: user.id,
          users_to_link: [],
        });

      if (error) throw error;

      toast.success("Administrador criado com sucesso");
      setNewAdminEmail("");
      refetchAdmins();
    } catch (error: any) {
      toast.error("Erro ao criar administrador: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Email do novo administrador</label>
          <Input
            type="email"
            placeholder="exemplo@email.com"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleCreateAdmin}
          disabled={loading || !newAdminEmail}
        >
          Criar Administrador
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email do Administrador</TableHead>
            <TableHead>Usuários Vinculados</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins?.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>{admin.email}</TableCell>
              <TableCell>
                {admin.linkedUsers.map(user => user.email).join(", ") || "Nenhum usuário vinculado"}
              </TableCell>
              <TableCell>
                <LinkUsersDialog
                  adminId={admin.id}
                  adminEmail={admin.email}
                  onSuccess={refetchAdmins}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
