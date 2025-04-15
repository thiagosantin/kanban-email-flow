
import React from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SystemError } from "@/types/admin";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

interface SystemErrorListProps {
  errors: SystemError[];
  loading: boolean;
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('pt-BR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getSeverityBadge = (severity: SystemError['severity']) => {
  switch (severity) {
    case 'high':
      return <Badge variant="destructive">Alta</Badge>;
    case 'medium':
      return <Badge variant="outline" className="text-amber-500 border-amber-500">Média</Badge>;
    case 'low':
      return <Badge variant="outline" className="text-blue-500 border-blue-500">Baixa</Badge>;
    default:
      return <Badge variant="outline">Desconhecida</Badge>;
  }
};

const getErrorResolution = (error: SystemError) => {
  if (error.message.includes('Authentication failed')) {
    return "1. Verifique as credenciais do usuário\n2. Confirme se o token está válido\n3. Verifique as políticas de RLS no Supabase";
  }
  if (error.message.includes('sync failed')) {
    return "1. Verifique a conexão com o servidor de email\n2. Confirme se as credenciais IMAP estão corretas\n3. Verifique se o servidor está respondendo";
  }
  return "Contate o suporte técnico para assistência.";
};

export function SystemErrorList({ errors, loading }: SystemErrorListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs de Erro do Sistema</CardTitle>
        <CardDescription>
          Monitore e resolva erros do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 flex justify-center items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Severidade</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>Componente</TableHead>
                <TableHead>Caminho</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Resolução</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Nenhum erro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                errors.map((error) => (
                  <TableRow key={error.id}>
                    <TableCell>{getSeverityBadge(error.severity)}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>{error.message}</span>
                      </div>
                    </TableCell>
                    <TableCell>{error.component || 'N/A'}</TableCell>
                    <TableCell>{error.path || 'N/A'}</TableCell>
                    <TableCell>
                      {formatDateTime(error.timestamp)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => {
                          toast.info(getErrorResolution(error), {
                            description: "Passos para resolução",
                            duration: 10000
                          });
                        }}
                      >
                        Ver solução
                      </Button>
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
}
