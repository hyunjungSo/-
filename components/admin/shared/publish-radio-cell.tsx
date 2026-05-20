"use client";

import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PublishRadioCellProps {
  id: string;
  isPublished: boolean;
  onPublishChange: (published: boolean) => void;
}

export function PublishRadioCell({ 
  id, 
  isPublished, 
  onPublishChange 
}: PublishRadioCellProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => onPublishChange(true)}
        variant={isPublished ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-1"
      >
        <Eye className="h-3.5 w-3.5" />
        노출
      </Button>
      <Button
        onClick={() => onPublishChange(false)}
        variant={!isPublished ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-1"
      >
        <EyeOff className="h-3.5 w-3.5" />
        미노출
      </Button>
    </div>
  );
}
