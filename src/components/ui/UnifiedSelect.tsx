import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';

export interface UnifiedSelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface UnifiedSelectProps {
  options: UnifiedSelectOption[];
  value: string | string[] | null;
  onChange: (value: string | string[] | null) => void;
  placeholder?: string;
  multi?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

export const UnifiedSelect: React.FC<UnifiedSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  multi = false,
  searchable = true,
  disabled = false,
  className = '',
}) => {
  const [open, setOpen] = React.useState(false);
  const selectedValues: string[] = multi
    ? Array.isArray(value)
      ? value as string[]
      : value
      ? [value as string]
      : []
    : value
    ? [value as string]
    : [];

  const displayLabel = () => {
    if (selectedValues.length === 0) return <span className="text-muted-foreground">{placeholder}</span>;
    if (multi) {
      return (
        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
          {selectedValues.map((val) => {
            const opt = options.find((o) => o.value === val);
            return (
              <span key={val} className="bg-muted px-2 py-0.5 rounded text-xs max-w-[120px] truncate">
                {opt?.icon && <span className="mr-1 inline-block align-middle">{opt.icon}</span>}
                {opt?.label || val}
              </span>
            );
          })}
        </div>
      );
    }
    const opt = options.find((o) => o.value === selectedValues[0]);
    return (
      <span className="truncate flex items-center">
        {opt?.icon && <span className="mr-1 inline-block align-middle">{opt.icon}</span>}
        {opt?.label || selectedValues[0]}
      </span>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between min-h-[40px] flex items-center text-left rounded-lg border shadow-sm transition-all',
            className
          )}
        >
          <div className="flex-1 flex flex-wrap gap-1">{displayLabel()}</div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-50 overflow-hidden rounded-lg" align="start">
        <Command className="w-full">
          {searchable && <CommandInput placeholder={`Search...`} className="cursor-text rounded-t-lg border-0 focus:ring-0 focus-visible:ring-0" />}
          <CommandList className="overflow-hidden rounded-lg">
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => {
                    if (multi) {
                      const exists = selectedValues.includes(opt.value);
                      const newVals = exists
                        ? selectedValues.filter((v) => v !== opt.value)
                        : [...selectedValues, opt.value];
                      onChange(newVals);
                    } else {
                      onChange(opt.value);
                      setOpen(false);
                    }
                  }}
                  className="cursor-pointer flex items-center"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedValues.includes(opt.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {opt.icon && <span className="mr-2">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}; 