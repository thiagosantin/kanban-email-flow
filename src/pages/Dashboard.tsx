
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Inbox, Loader2, Mail, MoreHorizontal, Star, Trash } from "lucide-react";
import { KanbanHeader } from "@/components/KanbanHeader";
import { EmailCard } from "@/components/EmailCard";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

// Dados de exemplo para os emails
const initialEmails = {
  inbox: [
    {
      id: "email-1",
      from: "marketing@empresa.com",
      subject: "Oferta Especial para Você!",
      preview: "Descubra nossas ofertas exclusivas de final de semana...",
      date: "10:30 AM",
      read: false,
      flagged: false,
      avatar: "",
    },
    {
      id: "email-2",
      from: "equipe@projeto.com",
      subject: "Atualização do Status do Projeto",
      preview: "Estamos no caminho certo para cumprir o prazo. A entrega está...",
      date: "Ontem",
      read: true,
      flagged: true,
      avatar: "",
    },
    {
      id: "email-3",
      from: "newsletter@tecnologia.com",
      subject: "Novidades Tecnológicas da Semana",
      preview: "Confira as tendências mais recentes no mundo da tecnologia...",
      date: "23 Abr",
      read: false,
      flagged: false,
      avatar: "",
    },
  ],
  awaiting: [
    {
      id: "email-4",
      from: "recursos@empresa.com",
      subject: "Seu pedido de recursos foi aprovado",
      preview: "Temos o prazer de informar que seu pedido de recursos adicionais foi...",
      date: "22 Abr",
      read: true,
      flagged: false,
      avatar: "",
    },
  ],
  processing: [
    {
      id: "email-5",
      from: "joao.silva@parceiro.com",
      subject: "Re: Proposta de Colaboração",
      preview: "Obrigado pelo seu e-mail. Estou analisando a proposta e...",
      date: "20 Abr",
      read: true,
      flagged: true,
      avatar: "",
    },
  ],
  done: [
    {
      id: "email-6",
      from: "sistema@pagamentos.com",
      subject: "Confirmação de Pagamento",
      preview: "Seu pagamento foi processado com sucesso. O valor de R$...",
      date: "15 Abr",
      read: true,
      flagged: false,
      avatar: "",
    },
    {
      id: "email-7",
      from: "notificacao@plataforma.com",
      subject: "Sua assinatura foi renovada",
      preview: "Informamos que sua assinatura mensal foi renovada automaticamente...",
      date: "10 Abr",
      read: true,
      flagged: false,
      avatar: "",
    },
  ],
};

const Dashboard = () => {
  const [emails, setEmails] = useState(initialEmails);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // Se não tiver destino, cancela
    if (!destination) {
      return;
    }

    // Se a origem e o destino forem o mesmo, cancela
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Origem e colunas de destino
    const sourceColumn = emails[source.droppableId as keyof typeof emails];
    const destColumn = emails[destination.droppableId as keyof typeof emails];

    // Se for a mesma coluna
    if (source.droppableId === destination.droppableId) {
      const newEmails = Array.from(sourceColumn);
      const [removed] = newEmails.splice(source.index, 1);
      newEmails.splice(destination.index, 0, removed);

      setEmails({
        ...emails,
        [source.droppableId]: newEmails,
      });
      return;
    }

    // Se for uma coluna diferente
    const sourceEmails = Array.from(sourceColumn);
    const destEmails = Array.from(destColumn);
    const [removed] = sourceEmails.splice(source.index, 1);
    destEmails.splice(destination.index, 0, removed);

    setEmails({
      ...emails,
      [source.droppableId]: sourceEmails,
      [destination.droppableId]: destEmails,
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-kanban-gray-100">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <KanbanHeader />
          
          <div className="p-4 md:p-6 flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 text-kanban-blue animate-spin" />
                <span className="ml-2 text-lg text-kanban-gray-600">Carregando emails...</span>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex space-x-4 h-full min-w-[900px]">
                  <KanbanColumn 
                    id="inbox" 
                    title="Caixa de Entrada" 
                    emails={emails.inbox} 
                    count={emails.inbox.length}
                    color="blue"
                  />
                  <KanbanColumn 
                    id="awaiting" 
                    title="Aguardando" 
                    emails={emails.awaiting} 
                    count={emails.awaiting.length}
                    color="yellow"
                  />
                  <KanbanColumn 
                    id="processing" 
                    title="Em Processamento" 
                    emails={emails.processing} 
                    count={emails.processing.length}
                    color="purple"
                  />
                  <KanbanColumn 
                    id="done" 
                    title="Concluído" 
                    emails={emails.done} 
                    count={emails.done.length}
                    color="green"
                  />
                </div>
              </DragDropContext>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

type KanbanColumnProps = {
  id: string;
  title: string;
  emails: any[];
  count: number;
  color: "blue" | "yellow" | "purple" | "green";
};

const KanbanColumn = ({ id, title, emails, count, color }: KanbanColumnProps) => {
  const colorMap = {
    blue: "bg-kanban-blue text-white",
    yellow: "bg-kanban-yellow text-black",
    purple: "bg-kanban-purple text-white",
    green: "bg-kanban-green text-white"
  };

  return (
    <div className="flex-1 flex flex-col min-w-[250px] max-w-[350px] bg-white rounded-lg shadow">
      <div className={`p-3 rounded-t-lg ${colorMap[color]}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{title}</h3>
          <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
            {count}
          </Badge>
        </div>
      </div>
      
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 p-2 overflow-y-auto"
            style={{ minHeight: "100px" }}
          >
            {emails.map((email, index) => (
              <Draggable key={email.id} draggableId={email.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`mb-2 ${
                      snapshot.isDragging ? "opacity-70" : ""
                    }`}
                  >
                    <EmailCard email={email} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Dashboard;
