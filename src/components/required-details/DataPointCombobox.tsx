import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ChevronsUpDown, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataPointComboboxProps {
  value: string | string[] | null | undefined;
  onChange: (value: string | string[] | null) => void;
  placeholder: string;
  dataPoints: string[];
  currentDatapointId: string;
  isDuplicate?: boolean;
  isIdField?: boolean;
  usedDatapoints?: Map<string, number>;
}

export function DataPointCombobox({ 
  value, 
  onChange, 
  placeholder, 
  dataPoints, 
  currentDatapointId, 
  isDuplicate,
  isIdField,
  usedDatapoints 
}: DataPointComboboxProps) {
  const [open, setOpen] = useState(false);

  // Support multi-select display for array values
  const isMulti = Array.isArray(value);
  const selectedValues: string[] = isMulti ? (value as string[]) : value ? [value as string] : [];
  const maxVisible = 4;
  const visibleSelections = selectedValues.slice(0, maxVisible);
  const hiddenSelections = selectedValues.slice(maxVisible);

  // Filter out already used datapoints for ID field
  const availableDataPoints = useMemo(() => {
    if (!isIdField || !usedDatapoints) return dataPoints;
    return dataPoints.filter(dp => {
      const usageCount = usedDatapoints.get(dp) || 0;
      if (dp === currentDatapointId) return true;
      return usageCount === 0;
    });
  }, [dataPoints, isIdField, usedDatapoints, currentDatapointId]);

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between min-h-[40px] flex flex-wrap items-center text-left",
              isDuplicate && "border-yellow-500"
            )}
          >
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto w-full">
              {visibleSelections.length > 0 ? (
                visibleSelections.map((val: string, idx: number) => (
                  <span key={val + idx} className="bg-muted px-2 py-0.5 rounded text-xs break-words whitespace-normal max-w-[120px] truncate">
                    {val}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              {Array.isArray(hiddenSelections) && hiddenSelections.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="bg-muted px-2 py-0.5 rounded text-xs cursor-pointer">+{hiddenSelections.length} more</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs break-words whitespace-normal">
                      {Array.isArray(hiddenSelections) ? hiddenSelections.join(', ') : ''}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
            <CommandEmpty>No data point found.</CommandEmpty>
            <CommandGroup>
              {availableDataPoints
                .filter(dp => dp !== currentDatapointId)
                .map((datapoint) => (
                  <CommandItem
                    key={datapoint}
                    value={datapoint}
                    onSelect={() => {
                      if (isMulti) {
                        // Toggle selection
                        const exists = selectedValues.includes(datapoint);
                        const newVals = exists
                          ? selectedValues.filter((v) => v !== datapoint)
                          : [...selectedValues, datapoint];
                        onChange(newVals);
                      } else {
                        onChange(datapoint);
                        setOpen(false);
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(datapoint) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {datapoint}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {isDuplicate && (
        <Badge variant="destructive" className="absolute -top-2 -right-2">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Duplicate
        </Badge>
      )}
    </div>
  );
} 