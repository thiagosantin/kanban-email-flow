
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-kanban-blue/5 to-kanban-purple/5">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
      
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="flex items-center gap-3 text-kanban-blue">
            <Mail className="h-8 w-8" />
            <h2 className="text-xl font-semibold">Email Kanban</h2>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-kanban-blue via-kanban-purple to-kanban-pink bg-clip-text text-transparent">
            Gerencie seus Emails com Eficiência
          </h1>

          <p className="text-lg md:text-xl text-kanban-gray-600 max-w-2xl">
            Organize suas mensagens em um quadro Kanban intuitivo. 
            Conecte suas contas Gmail e Outlook para uma experiência de email unificada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate("/auth")} 
              size="lg"
              className="bg-gradient-to-r from-kanban-blue to-kanban-purple hover:opacity-90 text-white"
            >
              Começar agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/about")}
              size="lg"
              className="border-2 border-kanban-blue/20 hover:border-kanban-blue/40"
            >
              Saiba mais
            </Button>
          </div>
        </div>

        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
          <div className="relative z-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex gap-4 p-6 bg-white">
              {/* Coluna Caixa de Entrada */}
              <div className="flex-1 min-w-[250px]">
                <div className="bg-kanban-blue text-white p-3 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Caixa de Entrada</h3>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-sm">3</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-b-lg space-y-3">
                  {/* Email Cards */}
                  <div className="bg-white p-3 rounded border shadow-sm">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-kanban-blue/20 flex items-center justify-center text-kanban-blue">JD</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">João Silva</p>
                        <p className="text-xs text-gray-600 truncate">Relatório mensal de vendas</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border shadow-sm">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-kanban-purple/20 flex items-center justify-center text-kanban-purple">MA</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Maria Alves</p>
                        <p className="text-xs text-gray-600 truncate">Reunião de equipe</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Em Processamento */}
              <div className="flex-1 min-w-[250px]">
                <div className="bg-kanban-purple text-white p-3 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Em Processamento</h3>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-sm">2</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-b-lg space-y-3">
                  <div className="bg-white p-3 rounded border shadow-sm">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-kanban-yellow/20 flex items-center justify-center text-kanban-yellow">CP</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Carlos Pereira</p>
                        <p className="text-xs text-gray-600 truncate">Proposta comercial</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Concluído */}
              <div className="flex-1 min-w-[250px]">
                <div className="bg-kanban-green text-white p-3 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Concluído</h3>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-sm">1</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-b-lg space-y-3">
                  <div className="bg-white p-3 rounded border shadow-sm opacity-75">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-kanban-green/20 flex items-center justify-center text-kanban-green">AF</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ana Ferreira</p>
                        <p className="text-xs text-gray-600 truncate">Feedback do projeto</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
