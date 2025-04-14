
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Integração com Gmail e Outlook",
      description: "Conecte suas contas do Gmail e Outlook para centralizar todos os seus e-mails em um único lugar."
    },
    {
      title: "Organização em Kanban",
      description: "Visualize e organize seus e-mails em um quadro Kanban intuitivo para melhorar sua produtividade."
    },
    {
      title: "Autenticação Segura",
      description: "Utilizamos o protocolo OAuth 2.0 para garantir que suas credenciais estejam sempre seguras."
    },
    {
      title: "Interface Responsiva",
      description: "Acesse sua caixa de entrada em qualquer dispositivo, com uma experiência otimizada para desktop e mobile."
    }
  ];

  return (
    <div className="min-h-screen bg-kanban-gray-100">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Mail className="h-6 w-6 text-kanban-blue mr-2" />
            <h1 className="text-xl font-bold text-kanban-gray-900">Email Kanban</h1>
          </div>
          <Button 
            onClick={() => navigate("/login")}
            className="bg-kanban-blue hover:bg-kanban-blue/90"
          >
            Entrar
          </Button>
        </div>
      </header>

      <main>
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-kanban-gray-900 mb-4">
              Sobre o Email Kanban
            </h2>
            <p className="text-lg text-kanban-gray-600">
              O Email Kanban é uma solução moderna para gerenciamento de e-mails, projetada para 
              ajudar você a organizar sua comunicação de forma eficiente usando a metodologia Kanban.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-kanban-gray-200">
                <div className="flex items-start mb-4">
                  <CheckCircle2 className="h-6 w-6 text-kanban-green mr-3 mt-1 flex-shrink-0" />
                  <h3 className="text-xl font-semibold text-kanban-gray-900">{feature.title}</h3>
                </div>
                <p className="text-kanban-gray-600 ml-9">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section className="py-16 bg-gradient-to-r from-kanban-blue to-kanban-purple text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Pronto para organizar seus e-mails?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Experimente o Email Kanban hoje e transforme a maneira como você lida com sua comunicação.
            </p>
            <Button 
              onClick={() => navigate("/login")}
              className="bg-white text-kanban-blue hover:bg-gray-100 px-8 py-3 text-lg"
            >
              Começar Gratuitamente
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="bg-kanban-gray-900 text-kanban-gray-400 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Mail className="h-6 w-6 mr-2 text-kanban-blue" />
              <span className="text-white font-semibold">Email Kanban</span>
            </div>
            <div className="text-sm">
              &copy; {new Date().getFullYear()} Email Kanban. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
