"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    <RadioGroup 
      value={isPublished ? "published" : "unpublished"}
      onValueChange={(value) => onPublishChange(value === "published")}
      className="flex items-center gap-3"
    >
      <div className="flex items-center gap-1.5">
        <RadioGroupItem value="published" id={`publish-${id}`} />
        <Label htmlFor={`publish-${id}`} className="text-xs cursor-pointer flex items-center gap-1">
          <Eye className="h-3 w-3" />
          노출
        </Label>
      </div>
      <div className="flex items-center gap-1.5">
        <RadioGroupItem value="unpublished" id={`unpublish-${id}`} />
        <Label htmlFor={`unpublish-${id}`} className="text-xs cursor-pointer flex items-center gap-1">
          <EyeOff className="h-3 w-3" />
          미노출
        </Label>
      </div>
    </RadioGroup>
  );
}
