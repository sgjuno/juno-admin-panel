import * as React from "react";
import { UnifiedSelect, UnifiedSelectOption } from "./UnifiedSelect";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

export interface SearchableSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  allowCustom?: boolean;
  onCustomValueChange?: (value: string) => void;
}

export function SearchableSelect({
  value = '',
  onValueChange,
  options,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found.",
  disabled = false,
  className,
  allowCustom = false,
  onCustomValueChange,
}: SearchableSelectProps) {
  const [customValue, setCustomValue] = React.useState("");
  const unifiedOptions: UnifiedSelectOption[] = allowCustom && customValue
    ? [...options, { value: customValue, label: customValue }]
    : options;

  return (
    <div className={className}>
      <UnifiedSelect
        options={unifiedOptions}
        value={value || ''}
        onChange={val => {
          if (typeof val === 'string') {
            onValueChange(val);
          }
        }}
        placeholder={placeholder}
        searchable
        disabled={disabled}
        className="w-full"
      />
      {allowCustom && (
        <input
          type="text"
          value={customValue}
          onChange={e => {
            setCustomValue(e.target.value);
            if (onCustomValueChange) onCustomValueChange(e.target.value);
          }}
          placeholder="Type custom value..."
          className="mt-2 w-full border rounded px-2 py-1"
        />
      )}
    </div>
  );
} 