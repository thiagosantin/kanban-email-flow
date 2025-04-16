
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cacheService } from '@/utils/cacheService';
import { Database, RefreshCw } from 'lucide-react';

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
  };
  
  const clearExpiredCache = () => {
    cacheService.clearExpired();
    updateStats();
  };
  
  return (
    <div className="p-4 border rounded-md bg-muted/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Cache Status</h3>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {cacheSize} items
        </span>
      </div>
      
      <div className="flex space-x-2 mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={clearAllCache}
        >
          Clear All
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={clearExpiredCache}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Clear Expired
        </Button>
      </div>
      
      {keys.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-1">Cached items:</p>
          <div className="max-h-24 overflow-y-auto">
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
