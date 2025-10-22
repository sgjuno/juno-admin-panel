import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { UnifiedSelect, UnifiedSelectOption } from '@/components/ui/UnifiedSelect';

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
  // Filter out already used datapoints for ID field
  const availableDataPoints = React.useMemo(() => {
    if (!isIdField || !usedDatapoints) return dataPoints;
    return dataPoints.filter(dp => {
      const usageCount = usedDatapoints.get(dp) || 0;
      if (dp === currentDatapointId) return true;
      return usageCount === 0;
    });
  }, [dataPoints, isIdField, usedDatapoints, currentDatapointId]);

  const options: UnifiedSelectOption[] = availableDataPoints.map(dp => ({ label: dp, value: dp }));

  return (
    <div className="relative">
      <UnifiedSelect
        options={options}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        multi={Array.isArray(value)}
        searchable
        className="w-full"
      />
      {isDuplicate && (
        <Badge variant="destructive" className="absolute -top-2 -right-2">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Duplicate
        </Badge>
      )}
    </div>
  );
} 