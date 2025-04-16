
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
            <img 
              src="https://via.placeholder.com/1200x600?text=Email+Kanban+Preview" 
              alt="Preview do Kanban de Emails" 
              className="w-full object-cover transition-transform hover:scale-105 duration-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
