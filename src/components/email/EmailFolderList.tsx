
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, Mail, Inbox, Send, Archive, FileWarning, Trash, Star } from 'lucide-react';
import { EmailFolder } from '@/types/email';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface EmailFolderListProps {
  folders: EmailFolder[] | null;
  isLoading: boolean;
  onFolderClick?: (folderId: string) => void;
}

export function EmailFolderList({ folders, isLoading, onFolderClick }: EmailFolderListProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="py-2">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-pulse bg-slate-200 rounded-full"></div>
          <div className="h-4 w-32 animate-pulse bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!folders || folders.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2 px-1">
        No folders found
      </div>
    );
  }

  // Function to get icon based on folder type
  const getFolderIcon = (type: string) => {
    switch (type) {
      case 'inbox': return <Inbox className="h-4 w-4 text-blue-500" />;
      case 'sent': return <Send className="h-4 w-4 text-green-500" />;
      case 'archive': return <Archive className="h-4 w-4 text-amber-500" />;
      case 'spam': return <FileWarning className="h-4 w-4 text-red-500" />;
      case 'trash': return <Trash className="h-4 w-4 text-gray-500" />;
      case 'drafts': return <Star className="h-4 w-4 text-purple-500" />;
      default: return <Mail className="h-4 w-4 text-slate-500" />;
    }
  };

  const handleFolderClick = (folderId: string) => {
    console.log('Folder clicked:', folderId);
    if (onFolderClick) {
      onFolderClick(folderId);
    } else {
      // If no callback is provided, navigate to a folder view
      navigate(`/emails/folder/${folderId}`);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start mb-1 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
        )}
        <Folder className="h-3.5 w-3.5 mr-1.5 text-primary" />
        <span>Folders</span>
        <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
          {folders.length}
        </span>
      </Button>
      
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-1 mt-1 pl-2">
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant="ghost"
              size="sm"
              className="justify-start w-full h-auto py-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-md transition-colors"
              onClick={() => handleFolderClick(folder.id)}
            >
              <div className="flex items-center overflow-hidden">
                <span className="mr-1.5 flex-shrink-0">
                  {getFolderIcon(folder.type)}
                </span>
                <span className="truncate">
                  {folder.name}
                </span>
                {folder.unread_count > 0 && (
                  <span className="ml-1.5 text-[10px] flex-shrink-0 bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    {folder.unread_count}
                  </span>
                )}
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
