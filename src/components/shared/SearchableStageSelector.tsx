import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Stage } from '@/types/records';

interface SearchableStageSelectorProps {
  stages: Stage[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchableStageSelector: React.FC<SearchableStageSelectorProps> = ({
  stages,
  value,
  onValueChange,
  placeholder = "Buscar etapa...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);

  const selectedStage = stages.find(stage => stage.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedStage ? selectedStage.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar etapa..." />
          <CommandEmpty>Nenhuma etapa encontrada.</CommandEmpty>
          <CommandGroup>
            {stages.map((stage) => (
              <CommandItem
                key={stage.id}
                value={stage.name}
                onSelect={() => {
                  onValueChange(stage.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === stage.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {stage.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};