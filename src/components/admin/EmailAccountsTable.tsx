
import { RefreshCw } from "lucide-react";
import { EmailAccount } from "@/types/email";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface EmailAccountsTableProps {
  accounts: EmailAccount[];
  isLoading: boolean;
  error?: any;
}

export function EmailAccountsTable({ accounts, isLoading, error }: EmailAccountsTableProps) {
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

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center items-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Erro ao carregar contas de email. Por favor, tente novamente.
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhuma conta de email encontrada
      </div>
    );
  }

  return (
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
        {accounts.map((account) => (
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
        ))}
      </TableBody>
    </Table>
  );
}
