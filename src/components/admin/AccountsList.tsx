
import React from "react";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmailAccount } from "@/types/email";

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString('pt-BR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface AccountsListProps {
  accounts: EmailAccount[];
  loading: boolean;
}

export const AccountsList = ({ accounts, loading }: AccountsListProps) => {
  return (
    <Card>
      <CardContent>
        {loading ? (
          <div className="py-8 flex justify-center items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Provedor</TableHead>
                <TableHead>Tipo de Autenticação</TableHead>
                <TableHead>Última Sincronização</TableHead>
                <TableHead>Intervalo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhuma conta de email encontrada
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account: EmailAccount) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.email}</TableCell>
                    <TableCell>{account.provider}</TableCell>
                    <TableCell>{account.auth_type}</TableCell>
                    <TableCell>
                      {account.last_synced ? 
                        formatDateTime(account.last_synced) : 
                        "Nunca sincronizado"}
                    </TableCell>
                    <TableCell>
                      {account.sync_interval_minutes ? 
                        `${account.sync_interval_minutes} minutos` : 
                        "Manual"}
                    </TableCell>
                    <TableCell>
                      {account.last_synced ? 
                        <Badge className="bg-green-500">Ativo</Badge> : 
                        <Badge variant="outline">Não Configurado</Badge>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
