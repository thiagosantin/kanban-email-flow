
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ConnectionTypeSelectorProps {
  connectionType: 'oauth2' | 'imap' | 'pop3';
  setConnectionType: (value: 'oauth2' | 'imap' | 'pop3') => void;
}

export function ConnectionTypeSelector({ 
  connectionType, 
  setConnectionType 
}: ConnectionTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Tipo de Conexão</Label>
      <Select 
        value={connectionType} 
        onValueChange={(value: 'oauth2' | 'imap' | 'pop3') => setConnectionType(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o tipo de conexão" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="oauth2">OAuth2 (Gmail, Outlook)</SelectItem>
          <SelectItem value="imap">IMAP</SelectItem>
          <SelectItem value="pop3">POP3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
