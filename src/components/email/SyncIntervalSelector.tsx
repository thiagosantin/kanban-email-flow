
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SyncIntervalSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function SyncIntervalSelector({ value, onChange }: SyncIntervalSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Sync Interval</Label>
      <Select 
        value={value.toString()} 
        onValueChange={(val) => onChange(Number(val))}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select sync interval" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">Every 5 minutes</SelectItem>
          <SelectItem value="15">Every 15 minutes</SelectItem>
          <SelectItem value="30">Every 30 minutes</SelectItem>
          <SelectItem value="60">Every hour</SelectItem>
          <SelectItem value="120">Every 2 hours</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
