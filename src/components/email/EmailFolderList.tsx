
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, Mail, Inbox, Send, Archive, FileWarning, Trash, Star } from 'lucide-react';
import { EmailFolder } from '@/types/email';
import { Button } from '@/components/ui/button';

interface EmailFolderListProps {
  folders: EmailFolder[] | null;
  isLoading: boolean;
}

export function EmailFolderList({ folders, isLoading }: EmailFolderListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isLoading) {
    return (
      <div className="pl-4 py-2">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-pulse bg-gray-200 rounded-full"></div>
          <div className="h-4 w-32 animate-pulse bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!folders || folders.length === 0) {
    return (
      <div className="text-sm text-muted-foreground pl-4 py-2">
        No folders found
      </div>
    );
  }

  // Function to get icon based on folder type
  const getFolderIcon = (type: string) => {
    switch (type) {
      case 'inbox': return <Inbox className="h-4 w-4 mr-2" />;
      case 'sent': return <Send className="h-4 w-4 mr-2" />;
      case 'archive': return <Archive className="h-4 w-4 mr-2" />;
      case 'spam': return <FileWarning className="h-4 w-4 mr-2" />;
      case 'trash': return <Trash className="h-4 w-4 mr-2" />;
      case 'drafts': return <Star className="h-4 w-4 mr-2" />;
      default: return <Mail className="h-4 w-4 mr-2" />;
    }
  };

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
              {getFolderIcon(folder.type)}
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
