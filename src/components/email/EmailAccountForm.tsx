
import React from 'react';
import { Input } from "@/components/ui/input";
import { ConnectionTypeSelector } from './ConnectionTypeSelector';
import { ProviderSelector } from './ProviderSelector';
import { BasicConnectionForm } from './BasicConnectionForm';

interface EmailAccountFormProps {
  connectionType: 'oauth2' | 'imap' | 'pop3';
  setConnectionType: (value: 'oauth2' | 'imap' | 'pop3') => void;
  provider: 'gmail' | 'outlook' | 'custom';
  setProvider: (value: 'gmail' | 'outlook' | 'custom') => void;
  email: string;
  setEmail: (value: string) => void;
  host: string;
  setHost: (value: string) => void;
  port: string;
  setPort: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
}

export function EmailAccountForm({
  connectionType,
  setConnectionType,
  provider,
  setProvider,
  email,
  setEmail,
  host,
  setHost,
  port,
  setPort,
  username,
  setUsername,
  password,
  setPassword
}: EmailAccountFormProps) {
  return (
    <div className="space-y-4">
      <ConnectionTypeSelector 
        connectionType={connectionType} 
        setConnectionType={setConnectionType} 
      />

      <ProviderSelector 
        provider={provider} 
        setProvider={setProvider} 
      />

      <div className="space-y-2">
        <Input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="you@example.com" 
        />
      </div>

      {connectionType !== 'oauth2' && (
        <BasicConnectionForm
          host={host}
          setHost={setHost}
          port={port}
          setPort={setPort}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
        />
      )}
    </div>
  );
}
