
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGmailLogin = () => {
    setIsLoading(true);
    // Simulando o processo de OAuth
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  const handleOutlookLogin = () => {
    setIsLoading(true);
    // Simulando o processo de OAuth
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-kanban-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-kanban-blue flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Entrar</CardTitle>
          <CardDescription className="text-center">
            Conecte suas contas de email para começar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
              className="w-full py-6 flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-black border border-kanban-gray-200"
              disabled={isLoading}
              onClick={handleGmailLogin}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 186.69 190.5"
              >
                <g transform="translate(1184.583 765.171)">
                  <path
                    d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z"
                    fill="#4285f4"
                  />
                  <path
                    d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z"
                    fill="#34a853"
                  />
                  <path
                    d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z"
                    fill="#fbbc05"
                  />
                  <path
                    d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z"
                    fill="#ea4335"
                  />
                </g>
              </svg>
              <span>Continuar com Gmail</span>
            </Button>

            <Button
              className="w-full py-6 flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-black border border-kanban-gray-200"
              disabled={isLoading}
              onClick={handleOutlookLogin}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 23 23"
                fill="none"
              >
                <path
                  d="M23 10.1282V3.07692C23 1.37821 21.6218 0 19.9231 0H3.07692C1.37821 0 0 1.37821 0 3.07692V19.9231C0 21.6218 1.37821 23 3.07692 23H19.9231C21.6218 23 23 21.6218 23 19.9231V12.8718"
                  fill="#0078D4"
                />
                <path
                  d="M10.9998 5.98717H4.8074C4.26304 5.98717 3.8252 6.42501 3.8252 6.96937V16.0304C3.8252 16.5748 4.26304 17.0126 4.8074 17.0126H10.9998C11.5442 17.0126 11.982 16.5748 11.982 16.0304V6.96937C11.982 6.42501 11.5442 5.98717 10.9998 5.98717Z"
                  fill="white"
                />
                <path
                  d="M18.6844 8.69238L13.9536 5.75648C13.6727 5.59342 13.3248 5.83649 13.3248 6.15522V16.8447C13.3248 17.1635 13.6727 17.4065 13.9536 17.2435L18.6844 14.3076C18.8805 14.188 18.8805 14.8811 18.6844 14.769L13.9536 11.8331C13.6727 11.67 13.3248 11.9131 13.3248 12.2318V13.7681C13.3248 14.0869 13.6727 14.3299 13.9536 14.1669L17.1787 12.2318C17.3748 12.1122 17.3748 11.8877 17.1787 11.7681L13.9536 9.83295C13.6727 9.6699 13.3248 9.91297 13.3248 10.2317V9.76822C13.3248 10.0869 13.6727 10.33 13.9536 10.1669L18.6844 7.23097C18.8805 7.11138 18.8805 8.81197 18.6844 8.69238Z"
                  fill="white"
                />
              </svg>
              <span>Continuar com Outlook</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-kanban-gray-500 text-center mt-4">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
