
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logout realizado com sucesso");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Erro ao fazer logout: " + error.message);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      onClick={handleLogout}
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sair
    </Button>
  );
}
