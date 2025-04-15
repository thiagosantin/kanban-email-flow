
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
  connectionType: 'oauth2' | 'basic';
  setConnectionType: (value: 'oauth2' | 'basic') => void;
}

export function ConnectionTypeSelector({ 
  connectionType, 
  setConnectionType 
}: ConnectionTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Connection Type</Label>
      <Select 
        value={connectionType} 
        onValueChange={(value: 'oauth2' | 'basic') => setConnectionType(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select connection type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="oauth2">OAuth2 (Gmail, Outlook)</SelectItem>
          <SelectItem value="basic">IMAP/SMTP</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
