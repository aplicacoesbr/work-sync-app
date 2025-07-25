import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Task } from '@/types/records';

interface SearchableTaskSelectorProps {
  tasks: Task[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchableTaskSelector: React.FC<SearchableTaskSelectorProps> = ({
  tasks,
  value,
  onValueChange,
  placeholder = "Buscar tarefa...",
  disabled = false
}) => {
  const [open, setOpen] = useState(false);

  const selectedTask = tasks.find(task => task.id === value);

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
          {selectedTask ? selectedTask.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar tarefa..." />
          <CommandEmpty>Nenhuma tarefa encontrada.</CommandEmpty>
          <CommandGroup>
            {tasks.map((task) => (
              <CommandItem
                key={task.id}
                value={task.name}
                onSelect={() => {
                  onValueChange(task.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === task.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {task.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};