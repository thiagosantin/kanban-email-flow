
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function OAuthHelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Ajuda com OAuth</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-kanban-blue" />
            Configurando OAuth para Email Kanban
          </DialogTitle>
          <DialogDescription>
            Siga estas instruções para configurar a autenticação OAuth com provedores de email.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="gmail" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gmail">Gmail (Google)</TabsTrigger>
            <TabsTrigger value="outlook">Outlook (Microsoft)</TabsTrigger>
          </TabsList>
          <TabsContent value="gmail" className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Configurando OAuth para Gmail</h3>
              <ol className="list-decimal ml-5 space-y-2">
                <li>Acesse o <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-kanban-blue underline">Google Cloud Console</a></li>
                <li>Crie um novo projeto ou selecione um existente</li>
                <li>No menu lateral, vá para "APIs e Serviços" e depois "Tela de consentimento OAuth"</li>
                <li>Configure a tela de consentimento (tipo "Externo" para testes)</li>
                <li>Em "Credenciais", clique em "Criar Credenciais" e selecione "ID do cliente OAuth"</li>
                <li>Selecione "Aplicativo Web" como tipo de aplicativo</li>
                <li>Adicione URIs de redirecionamento autorizados:
                  <code className="block bg-gray-100 p-2 mt-1 rounded text-sm">
                    https://seuapp.com/auth/callback
                  </code>
                </li>
                <li>Anote o ID do cliente e o segredo do cliente gerados</li>
                <li>Insira estas credenciais nas configurações da sua aplicação</li>
              </ol>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-sm">
              <p className="font-medium text-amber-800">Importante:</p>
              <p className="text-amber-700 mt-1">
                Para que o login funcione, a URL do site e URL de redirecionamento
                corretas devem ser configuradas no Google Cloud Console. Caso contrário,
                você poderá ver erros como "requested path is invalid".
              </p>
            </div>
          </TabsContent>
          <TabsContent value="outlook" className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Configurando OAuth para Outlook</h3>
              <ol className="list-decimal ml-5 space-y-2">
                <li>Acesse o <a href="https://portal.azure.com/" target="_blank" rel="noopener noreferrer" className="text-kanban-blue underline">Portal Azure</a></li>
                <li>Navegue até "Registros de aplicativo" e clique em "Novo registro"</li>
                <li>Forneça um nome para o aplicativo</li>
                <li>Em "Tipos de conta com suporte", selecione "Contas em qualquer diretório organizacional e contas pessoais da Microsoft"</li>
                <li>Adicione URI de redirecionamento:
                  <code className="block bg-gray-100 p-2 mt-1 rounded text-sm">
                    https://seuapp.com/auth/callback
                  </code>
                </li>
                <li>Após o registro, vá para "Certificados e segredos" e crie um novo segredo do cliente</li>
                <li>Anote o ID do aplicativo (cliente) e o valor do segredo</li>
                <li>Em "Permissões de API", adicione as permissões necessárias (IMAP, SMTP)</li>
                <li>Insira estas credenciais nas configurações da sua aplicação</li>
              </ol>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-sm">
              <p className="font-medium text-amber-800">Importante:</p>
              <p className="text-amber-700 mt-1">
                Certifique-se de solicitar as permissões corretas para sua aplicação.
                Para acesso a emails, você precisará de permissões como Mail.Read ou
                Mail.ReadWrite.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
