import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimePercentageInputProps {
  hoursValue: string;
  percentageValue: string;
  onHoursChange: (value: string) => void;
  onPercentageChange: (value: string) => void;
  totalDayHours?: number;
  className?: string;
}

export const TimePercentageInput: React.FC<TimePercentageInputProps> = ({
  hoursValue,
  percentageValue,
  onHoursChange,
  onPercentageChange,
  totalDayHours = 8,
  className = ''
}) => {
  const [lastChanged, setLastChanged] = useState<'hours' | 'percentage'>('hours');

  const formatHours = (value: string): string => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '');
    return cleaned;
  };

  const formatPercentage = (value: string): string => {
    // Remove non-numeric characters
    const cleaned = value.replace(/[^\d]/g, '');
    const num = parseInt(cleaned) || 0;
    return Math.min(100, Math.max(0, num)).toString();
  };

  const calculatePercentageFromHours = (hours: string): string => {
    const hoursNum = parseFloat(hours) || 0;
    if (totalDayHours <= 0) return '0';
    const percentage = Math.round((hoursNum / totalDayHours) * 100);
    return Math.min(100, Math.max(0, percentage)).toString();
  };

  const calculateHoursFromPercentage = (percentage: string): string => {
    const percentageNum = parseFloat(percentage) || 0;
    const hours = (percentageNum / 100) * totalDayHours;
    return hours.toFixed(1);
  };

  const handleHoursChange = (value: string) => {
    const formattedHours = formatHours(value);
    onHoursChange(formattedHours);
    
    if (lastChanged !== 'hours') {
      setLastChanged('hours');
    }
    
    // Auto-calculate percentage
    const calculatedPercentage = calculatePercentageFromHours(formattedHours);
    onPercentageChange(calculatedPercentage);
  };

  const handlePercentageChange = (value: string) => {
    const formattedPercentage = formatPercentage(value);
    onPercentageChange(formattedPercentage);
    
    if (lastChanged !== 'percentage') {
      setLastChanged('percentage');
    }
    
    // Auto-calculate hours
    const calculatedHours = calculateHoursFromPercentage(formattedPercentage);
    onHoursChange(calculatedHours);
  };

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="hours" className="text-sm font-medium">
          Horas
        </Label>
        <div className="relative">
          <Input
            id="hours"
            type="text"
            value={hoursValue}
            onChange={(e) => handleHoursChange(e.target.value)}
            placeholder="0.0"
            className="pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            h
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="percentage" className="text-sm font-medium">
          Porcentagem
        </Label>
        <div className="relative">
          <Input
            id="percentage"
            type="text"
            value={percentageValue}
            onChange={(e) => handlePercentageChange(e.target.value)}
            placeholder="0"
            className="pr-8"
            max="100"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            %
          </span>
        </div>
      </div>
    </div>
  );
};