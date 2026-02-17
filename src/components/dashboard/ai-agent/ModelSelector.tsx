"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Model {
  id?: string;
  model_name: string;
  model_title: string;
}

interface ModelSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  models?: Model[];
  trigger?: React.ReactNode;
}

export function ModelSelector({ value, onValueChange, disabled, models = [], trigger }: ModelSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={trigger ? "border-0 p-0 h-auto w-auto focus:ring-0" : "h-7 border-0 bg-transparent hover:bg-transparent focus:ring-0 text-xs font-medium gap-1 px-0"}>
        {trigger ? trigger : <SelectValue placeholder="Select model..." />}
      </SelectTrigger>
      <SelectContent className="min-w-[200px]">
        {models.map((model) => (
          <SelectItem key={model.model_name} value={model.model_name} className="text-xs">
            <div className="flex flex-col">
              <span className="font-medium">{model.model_title}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
