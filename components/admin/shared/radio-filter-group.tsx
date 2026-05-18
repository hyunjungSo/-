"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ReactNode } from "react";

export interface RadioFilterOption {
  value: string;
  label: string;
  icon?: ReactNode;
  className?: string;
}

interface RadioFilterGroupProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioFilterOption[];
  name: string;
}

export function RadioFilterGroup({ 
  label, 
  value, 
  onChange, 
  options,
  name
}: RadioFilterGroupProps) {
  return (
    <div className="flex items-center gap-3">
      <Label className="text-sm font-medium whitespace-nowrap">{label}:</Label>
      <RadioGroup 
        value={value} 
        onValueChange={onChange}
        className="flex items-center gap-4"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-1.5">
            <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
            <Label 
              htmlFor={`${name}-${option.value}`} 
              className={`text-sm cursor-pointer flex items-center gap-1 ${option.className || ""}`}
            >
              {option.icon}
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
