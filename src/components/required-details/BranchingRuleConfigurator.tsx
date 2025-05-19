import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Trash2, Plus } from 'lucide-react';
import { DataPointCombobox } from './DataPointCombobox';

function renderSelectedFields(valueArray: string[], setSelectedFields: (fields: string[]) => void): React.ReactElement | null {
  if (!valueArray.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {valueArray.map((field, idx) => (
        <span key={field + idx} className="bg-muted px-2 py-0.5 rounded text-xs">
          {field}
        </span>
      ))}
    </div>
  );
}

export function BranchingRuleConfigurator({
  value,
  onChange,
  dataPoints
}: {
  value: any,
  onChange: (value: any) => void,
  dataPoints: string[]
}) {
  const [rules, setRules] = useState<{ [key: string]: string[] | string }>(
    typeof value === 'object' ? value : {}
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Prevent duplicate fields
  const allSelected = Object.values(rules).flatMap(v => Array.isArray(v) ? v : [v]);

  const handleAddRule = () => {
    setRules({ ...rules, '': [] });
  };

  const handleRuleChange = (key: string, newKey: string, values: string[] | string) => {
    const newRules = { ...rules };
    delete newRules[key];
    newRules[newKey] = values;
    setRules(newRules);
    onChange(newRules);
  };

  const handleRuleRemove = (key: string) => {
    const newRules = { ...rules };
    delete newRules[key];
    setRules(newRules);
    onChange(newRules);
  };

  // Open dialog for a specific rule key
  const openFieldDialog = (key: string, values: string[] | string) => {
    setCurrentKey(key);
    setSelectedFields(Array.isArray(values) ? values : values ? [values] : []);
    setDialogOpen(true);
  };

  // Save selected fields to rule
  const saveSelectedFields = () => {
    if (currentKey) {
      handleRuleChange(currentKey, currentKey, selectedFields);
    }
    setDialogOpen(false);
  };

  const filteredDataPoints = useMemo(() => {
    if (!searchTerm) return dataPoints;
    return dataPoints.filter(dp => dp.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [dataPoints, searchTerm]);

  return (
    <div className="space-y-4">
      {Object.entries(rules).map(([key, values]) => {
        // Type guard for array values
        const valueArray: string[] = Array.isArray(values) ? values : typeof values === 'string' && values ? [values] : [];
        return (
          <div key={key} className="space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                value={key}
                onChange={(e) => handleRuleChange(key, e.target.value, values)}
                placeholder="Condition"
              />
              <ArrowRight className="w-4 h-4 self-center" />
              <Dialog open={dialogOpen && currentKey === key} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => openFieldDialog(key, values)}>
                    Select fields
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Select Fields</DialogTitle>
                  </DialogHeader>
                  {renderSelectedFields(selectedFields, setSelectedFields)}
                  <Separator className="mb-2" />
                  <input
                    placeholder="Search fields..."
                    className="mb-2 border rounded px-2 py-1 w-full"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {filteredDataPoints.map((dp: string) => (
                      <label key={dp} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedFields.includes(dp)}
                          onChange={() => {
                            if (selectedFields.includes(dp)) {
                              setSelectedFields(selectedFields.filter(f => f !== dp));
                            } else {
                              setSelectedFields([...selectedFields, dp]);
                            }
                          }}
                          disabled={allSelected.includes(dp) && !selectedFields.includes(dp)}
                        />
                        <span className="text-sm break-words whitespace-normal">{dp}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveSelectedFields}>
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRuleRemove(key)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
      <Button onClick={handleAddRule} variant="outline" className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Add Rule
      </Button>
    </div>
  );
} 