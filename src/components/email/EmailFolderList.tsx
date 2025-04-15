
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, Mail } from 'lucide-react';
import { EmailFolder } from '@/types/email';
import { Button } from '@/components/ui/button';

interface EmailFolderListProps {
  folders: EmailFolder[] | null;
  isLoading: boolean;
}

export function EmailFolderList({ folders, isLoading }: EmailFolderListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!folders || folders.length === 0) {
    return (
      <div className="text-sm text-muted-foreground pl-4 py-2">
        No folders found
      </div>
    );
  }

  return (
    <div className="pl-4">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start mb-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 mr-2" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-2" />
        )}
        <Folder className="h-4 w-4 mr-2" />
        Folders ({folders.length})
      </Button>
      
      {isExpanded && (
        <div className="space-y-1">
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant="ghost"
              size="sm"
              className="w-full justify-start pl-8"
            >
              <Mail className="h-4 w-4 mr-2" />
              {folder.name}
              {folder.unread_count > 0 && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {folder.unread_count}
                </span>
              )}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
