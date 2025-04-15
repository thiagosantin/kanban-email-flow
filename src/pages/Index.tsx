
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-kanban-gray-100">
      <div className="max-w-3xl px-6 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-kanban-gray-900 mb-6">
          Gerencie seus Emails com Eficiência
        </h1>
        <p className="text-lg md:text-xl text-kanban-gray-600 mb-8">
          Organize suas mensagens em um quadro Kanban intuitivo. 
          Conecte suas contas Gmail e Outlook para uma experiência de email unificada.
        </p>
        <div className="space-x-4">
          <Button 
            onClick={() => navigate("/auth")} 
            className="bg-kanban-blue hover:bg-kanban-blue/90 text-white px-8 py-2 rounded-md text-lg"
          >
            Começar agora
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/about")}
            className="border-kanban-blue text-kanban-blue hover:bg-kanban-blue/10 px-8 py-2 rounded-md text-lg"
          >
            Saiba mais
          </Button>
        </div>
      </div>
      <div className="mt-12 w-full max-w-5xl px-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <img 
            src="https://via.placeholder.com/1200x600?text=Email+Kanban+Preview" 
            alt="Preview do Kanban de Emails" 
            className="w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
