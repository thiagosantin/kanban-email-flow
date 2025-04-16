
import React, { useState } from "react";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface LinkUsersDialogProps {
  adminId: string;
  adminEmail: string;
  onSuccess: () => void;
}

export function LinkUsersDialog({ adminId, adminEmail, onSuccess }: LinkUsersDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: { users } } = await supabase.auth.admin.listUsers();
      return users || [];
    },
  });

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleLinkUsers = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc("assign_admin_and_link_users", {
        target_user_id: adminId,
        users_to_link: selectedUsers,
      });

      if (error) throw error;

      toast.success("Usuários vinculados com sucesso");
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error("Erro ao vincular usuários: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vincular Usuários</DialogTitle>
          <DialogDescription>
            Selecione os usuários que serão vinculados ao administrador {adminEmail}
          </DialogDescription>
        </DialogHeader>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Selecionar</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={() => handleToggleUser(user.id)}
                  />
                </TableCell>
                <TableCell>{user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleLinkUsers}
            disabled={loading || selectedUsers.length === 0}
          >
            Vincular Usuários
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
