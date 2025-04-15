
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface ManualConnectionFormProps {
  provider: 'gmail' | 'outlook' | 'custom';
  setProvider: (value: 'gmail' | 'outlook' | 'custom') => void;
  email: string;
  setEmail: (value: string) => void;
  server: string;
  setServer: (value: string) => void;
  port: string;
  setPort: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  smtpServer: string;
  setSmtpServer: (value: string) => void;
  smtpPort: string;
  setSmtpPort: (value: string) => void;
  smtpUsername: string;
  setSmtpUsername: (value: string) => void;
  smtpPassword: string;
  setSmtpPassword: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function ManualConnectionForm({
  provider,
  setProvider,
  email,
  setEmail,
  server,
  setServer,
  port,
  setPort,
  username,
  setUsername,
  password,
  setPassword,
  smtpServer,
  setSmtpServer,
  smtpPort,
  setSmtpPort,
  smtpUsername,
  setSmtpUsername,
  smtpPassword,
  setSmtpPassword,
  onSubmit,
  loading
}: ManualConnectionFormProps) {
  const handleProviderChange = (value: 'gmail' | 'outlook' | 'custom') => {
    setProvider(value);
    if (value === 'gmail') {
      setServer('imap.gmail.com');
      setSmtpServer('smtp.gmail.com');
    } else if (value === 'outlook') {
      setServer('outlook.office365.com');
      setSmtpServer('smtp.office365.com');
    } else {
      setServer('');
      setSmtpServer('');
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Provider</Label>
        <Select 
          value={provider} 
          onValueChange={(value: 'gmail' | 'outlook' | 'custom') => handleProviderChange(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gmail">Gmail</SelectItem>
            <SelectItem value="outlook">Outlook</SelectItem>
            <SelectItem value="custom">Custom Provider</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Email Address</Label>
        <Input 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="you@example.com" 
        />
      </div>

      <div className="grid gap-2">
        <Label>Server</Label>
        <Input 
          value={server} 
          onChange={(e) => setServer(e.target.value)} 
          placeholder="imap.example.com" 
        />
      </div>

      <div className="grid gap-2">
        <Label>Port</Label>
        <Input 
          type="number" 
          value={port} 
          onChange={(e) => setPort(e.target.value)} 
        />
      </div>

      <div className="grid gap-2">
        <Label>Username</Label>
        <Input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
      </div>

      <div className="grid gap-2">
        <Label>Password</Label>
        <Input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>

      <div className="grid gap-2">
        <Label>SMTP Server</Label>
        <Input 
          value={smtpServer} 
          onChange={(e) => setSmtpServer(e.target.value)} 
          placeholder="smtp.example.com" 
        />
      </div>

      <div className="grid gap-2">
        <Label>SMTP Port</Label>
        <Input 
          type="number" 
          value={smtpPort} 
          onChange={(e) => setSmtpPort(e.target.value)} 
        />
      </div>

      <div className="grid gap-2">
        <Label>SMTP Username (optional)</Label>
        <Input 
          value={smtpUsername} 
          onChange={(e) => setSmtpUsername(e.target.value)} 
          placeholder="Same as above if left empty"
        />
      </div>

      <div className="grid gap-2">
        <Label>SMTP Password (optional)</Label>
        <Input 
          type="password" 
          value={smtpPassword} 
          onChange={(e) => setSmtpPassword(e.target.value)} 
          placeholder="Same as above if left empty"
        />
      </div>

      <Button onClick={onSubmit} disabled={loading} className="w-full">
        <Mail className="mr-2 h-4 w-4" /> Connect Account
      </Button>
    </div>
  );
}
