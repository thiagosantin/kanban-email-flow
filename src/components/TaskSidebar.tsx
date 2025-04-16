import React from 'react';
import { CacheDebugger } from './CacheDebugger';

export function TaskSidebar() {
  return (
    <div className="bg-background rounded-lg border p-4 h-full overflow-y-auto">
      <h3 className="font-medium text-lg mb-4">Tasks & Tools</h3>
      
      {/* Other task sidebar content will remain */}
      
      {/* Add the Cache Debugger */}
      <div className="mt-4">
        <CacheDebugger />
      </div>
    </div>
  );
}
