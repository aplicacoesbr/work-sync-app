import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';

interface InlineEditProps {
  value: string | number;
  onSave: (value: string) => void;
  onCancel: () => void;
  type?: 'text' | 'number';
  step?: string;
  min?: string;
  max?: string;
  className?: string;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  onCancel,
  type = 'text',
  step,
  min,
  max,
  className = ''
}) => {
  const [editValue, setEditValue] = useState(String(value));

  const handleSave = () => {
    onSave(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        type={type}
        step={step}
        min={min}
        max={max}
        className="h-8"
        autoFocus
      />
      <Button size="sm" variant="ghost" onClick={handleSave}>
        <Check className="h-4 w-4 text-green-600" />
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>
        <X className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
};