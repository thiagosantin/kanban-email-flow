
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cacheService } from '@/utils/cacheService';
import { Database, RefreshCw, Trash } from 'lucide-react';
import { toast } from 'sonner';

export function CacheDebugger() {
  const [cacheSize, setCacheSize] = useState(0);
  const [keys, setKeys] = useState<string[]>([]);
  
  const updateStats = () => {
    setCacheSize(cacheService.size());
    setKeys(cacheService.keys());
  };
  
  useEffect(() => {
    updateStats();
    
    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);
  
  const clearAllCache = () => {
    cacheService.clear();
    updateStats();
    toast.success("Cache limpo com sucesso");
  };
  
  const clearExpiredCache = () => {
    cacheService.clearExpired();
    updateStats();
    toast.success("Cache expirado limpo");
  };

  const clearEmailCache = () => {
    const emailKeys = keys.filter(key => key.startsWith('emails_') || key === 'email_accounts');
    emailKeys.forEach(key => cacheService.delete(key));
    toast.success(`${emailKeys.length} chaves de email removidas do cache`);
    updateStats();
  };
  
  return (
    <div className="p-4 border rounded-md bg-muted/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Status do Cache</h3>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {cacheSize} itens
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={clearAllCache}
        >
          <Trash className="h-3 w-3 mr-1" />
          Limpar Tudo
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={clearExpiredCache}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Limpar Expirados
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={clearEmailCache}
        >
          <Trash className="h-3 w-3 mr-1" />
          Limpar Cache de Email
        </Button>
      </div>
      
      {keys.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-1">Itens em cache:</p>
          <div className="max-h-36 overflow-y-auto">
            {keys.map(key => (
              <div key={key} className="text-xs py-0.5 border-b border-border/20 last:border-0">
                {key}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
