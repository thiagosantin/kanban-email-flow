
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  ChevronLeft, 
  Key, 
  Mail, 
  Palette, 
  Save, 
  Trash, 
  User, 
  UserPlus 
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Configurações salvas com sucesso!");
    }, 1000);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-kanban-gray-100">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-kanban-gray-200 p-3 sticky top-0 z-10">
            <div className="flex items-center">
              <SidebarTrigger />
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2" 
                onClick={() => navigate("/dashboard")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-kanban-gray-900">Configurações</h1>
            </div>
          </header>
          
          <div className="p-4 md:p-6 flex-1">
            <Tabs defaultValue="account" className="w-full">
              <div className="flex border-b overflow-x-auto">
                <TabsList className="bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="account" 
                    className="py-3 px-4 border-b-2 data-[state=active]:border-kanban-blue data-[state=active]:text-kanban-blue rounded-none"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Conta
                  </TabsTrigger>
                  <TabsTrigger 
                    value="emails" 
                    className="py-3 px-4 border-b-2 data-[state=active]:border-kanban-blue data-[state=active]:text-kanban-blue rounded-none"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    E-mails
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="py-3 px-4 border-b-2 data-[state=active]:border-kanban-blue data-[state=active]:text-kanban-blue rounded-none"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notificações
                  </TabsTrigger>
                  <TabsTrigger 
                    value="appearance" 
                    className="py-3 px-4 border-b-2 data-[state=active]:border-kanban-blue data-[state=active]:text-kanban-blue rounded-none"
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Aparência
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="py-3 px-4 border-b-2 data-[state=active]:border-kanban-blue data-[state=active]:text-kanban-blue rounded-none"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Segurança
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="account" className="mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-kanban-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Informações da Conta</h2>
                  
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex flex-col items-center md:items-start">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src="" alt="Foto de perfil" />
                        <AvatarFallback className="bg-kanban-blue text-white text-2xl">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm">
                        Alterar foto
                      </Button>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">Nome</Label>
                          <Input id="first-name" defaultValue="João" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Sobrenome</Label>
                          <Input id="last-name" defaultValue="Silva" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" defaultValue="joao.silva@exemplo.com" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Nome de Usuário</Label>
                        <Input id="username" defaultValue="joaosilva" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => toast.error("Operação cancelada.")}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={loading}
                      className="bg-kanban-blue hover:bg-kanban-blue/90"
                    >
                      {loading ? (
                        <>
                          <span className="mr-2">Salvando...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="emails" className="mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-kanban-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Contas de Email Conectadas</h2>
                  
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="#EA4335"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium">Gmail - Pessoal</h3>
                          <p className="text-sm text-kanban-gray-500">joao.silva@gmail.com</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button variant="ghost" size="sm" className="text-red-500 mr-2">
                          <Trash className="h-4 w-4 mr-1" />
                          Desconectar
                        </Button>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Conectado</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H21C22.1 20 23 19.1 23 18V6C23 4.9 22.1 4 21 4ZM21 18H3V6H21V18Z" fill="#0078D4"/>
                            <path d="M12 10L3 6V18L12 14V10Z" fill="#0078D4"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium">Outlook - Trabalho</h3>
                          <p className="text-sm text-kanban-gray-500">joao.silva@empresa.com</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button variant="ghost" size="sm" className="text-red-500 mr-2">
                          <Trash className="h-4 w-4 mr-1" />
                          Desconectar
                        </Button>
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Conectado</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4 bg-white text-kanban-blue border border-kanban-blue hover:bg-kanban-blue/10">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Conectar Nova Conta
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-kanban-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Preferências de Notificação</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Notificações por Email</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Resumo diário</p>
                          <p className="text-sm text-kanban-gray-500">Receba um resumo diário dos emails em sua caixa de entrada</p>
                        </div>
                        <Switch id="daily-digest" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Emails importantes</p>
                          <p className="text-sm text-kanban-gray-500">Seja notificado sobre emails marcados como importantes</p>
                        </div>
                        <Switch id="important-emails" defaultChecked />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Notificações no Navegador</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Notificações Push</p>
                          <p className="text-sm text-kanban-gray-500">Mostrar notificações no navegador quando novos emails chegarem</p>
                        </div>
                        <Switch id="push-notifications" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Som de notificação</p>
                          <p className="text-sm text-kanban-gray-500">Tocar um som quando novos emails chegarem</p>
                        </div>
                        <Switch id="notification-sound" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button 
                      onClick={handleSave} 
                      disabled={loading}
                      className="bg-kanban-blue hover:bg-kanban-blue/90"
                    >
                      {loading ? "Salvando..." : "Salvar Preferências"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="appearance" className="mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-kanban-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Aparência</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Tema</h3>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border-2 border-kanban-blue rounded-lg p-4 text-center">
                          <div className="h-20 bg-white mb-2 rounded"></div>
                          <p className="font-medium">Claro</p>
                        </div>
                        <div className="border border-kanban-gray-200 rounded-lg p-4 text-center">
                          <div className="h-20 bg-kanban-gray-800 mb-2 rounded"></div>
                          <p className="font-medium">Escuro</p>
                        </div>
                        <div className="border border-kanban-gray-200 rounded-lg p-4 text-center">
                          <div className="h-20 bg-gradient-to-b from-white to-kanban-gray-800 mb-2 rounded"></div>
                          <p className="font-medium">Sistema</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Cor de Destaque</h3>
                      
                      <div className="flex flex-wrap gap-3">
                        <button className="w-8 h-8 rounded-full bg-kanban-blue ring-2 ring-offset-2 ring-kanban-blue"></button>
                        <button className="w-8 h-8 rounded-full bg-purple-500"></button>
                        <button className="w-8 h-8 rounded-full bg-green-500"></button>
                        <button className="w-8 h-8 rounded-full bg-orange-500"></button>
                        <button className="w-8 h-8 rounded-full bg-red-500"></button>
                        <button className="w-8 h-8 rounded-full bg-pink-500"></button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg">Tamanho da Fonte</h3>
                      
                      <div className="flex items-center space-x-4">
                        <span className="text-sm">A</span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          defaultValue="3"
                          className="flex-1 h-2 bg-kanban-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-lg">A</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button 
                      onClick={handleSave} 
                      disabled={loading}
                      className="bg-kanban-blue hover:bg-kanban-blue/90"
                    >
                      {loading ? "Aplicando..." : "Aplicar Alterações"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-kanban-gray-200 p-6">
                  <h2 className="text-xl font-semibold mb-6">Segurança e Autenticação</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Senha</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Senha Atual</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                      
                      <Button variant="outline">Alterar Senha</Button>
                    </div>
                    
                    <div className="pt-4 border-t border-kanban-gray-200">
                      <h3 className="font-medium text-lg mb-4">Autenticação em Duas Etapas</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Ativar autenticação em duas etapas</p>
                          <p className="text-sm text-kanban-gray-500">Adiciona uma camada extra de segurança à sua conta</p>
                        </div>
                        <Switch id="two-factor" />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-kanban-gray-200">
                      <h3 className="font-medium text-lg mb-4">Sessões Ativas</h3>
                      
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Este Navegador</p>
                              <p className="text-sm text-kanban-gray-500">Chrome • Windows • São Paulo, Brasil</p>
                              <p className="text-xs text-kanban-gray-400 mt-1">Ativo agora</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-red-500">Encerrar</Button>
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Aplicativo Móvel</p>
                              <p className="text-sm text-kanban-gray-500">Android • São Paulo, Brasil</p>
                              <p className="text-xs text-kanban-gray-400 mt-1">Último acesso: 3 horas atrás</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-red-500">Encerrar</Button>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="mt-4 text-red-500">
                        Encerrar Todas as Sessões
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
