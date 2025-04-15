
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ProviderSelectorProps {
  provider: 'gmail' | 'outlook' | 'custom';
  setProvider: (value: 'gmail' | 'outlook' | 'custom') => void;
}

export function ProviderSelector({ provider, setProvider }: ProviderSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Provider</Label>
      <Select 
        value={provider} 
        onValueChange={(value: 'gmail' | 'outlook' | 'custom') => setProvider(value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select email provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gmail">Gmail</SelectItem>
          <SelectItem value="outlook">Outlook</SelectItem>
          <SelectItem value="custom">Custom Provider</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
