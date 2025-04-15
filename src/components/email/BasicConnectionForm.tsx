
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicConnectionFormProps {
  host: string;
  setHost: (value: string) => void;
  port: string;
  setPort: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
}

export function BasicConnectionForm({
  host,
  setHost,
  port,
  setPort,
  username,
  setUsername,
  password,
  setPassword
}: BasicConnectionFormProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>IMAP Host</Label>
        <Input 
          value={host} 
          onChange={(e) => setHost(e.target.value)} 
          placeholder="imap.example.com" 
        />
      </div>
      <div className="space-y-2">
        <Label>IMAP Port</Label>
        <Input 
          type="number" 
          value={port} 
          onChange={(e) => setPort(e.target.value)} 
          placeholder="993" 
        />
      </div>
      <div className="space-y-2">
        <Label>Username</Label>
        <Input 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="your username" 
        />
      </div>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="your password" 
        />
      </div>
    </>
  );
}
