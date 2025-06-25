import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trash2, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { DataPointCombobox } from './DataPointCombobox';

export function OptionsConfigurator({ 
  value, 
  onChange, 
  dataPoints 
}: { 
  value: any, 
  onChange: (value: any) => void,
  dataPoints: string[]
}) {
  const [configType, setConfigType] = useState<'simple' | 'mapping' | 'numeric'>(
    Array.isArray(value) ? 'simple' : 
    typeof value === 'object' && Object.values(value).some(v => Array.isArray(v)) ? 'mapping' :
    'numeric'
  );

  const [simpleOptions, setSimpleOptions] = useState<string[]>(Array.isArray(value) ? value : []);
  const [mappingOptions, setMappingOptions] = useState<{ [key: string]: string[] }>(
    typeof value === 'object' && !Array.isArray(value) ? value : {}
  );
  const [numericOptions, setNumericOptions] = useState<{ [key: string]: string[] }>(
    typeof value === 'object' && !Array.isArray(value) ? value : {}
  );

  // Handlers for each config type (simple, mapping, numeric)
  const handleSimpleOptionAdd = () => {
    setSimpleOptions([...simpleOptions, '']);
  };
  const handleSimpleOptionChange = (index: number, newValue: string) => {
    const newOptions = [...simpleOptions];
    newOptions[index] = newValue;
    setSimpleOptions(newOptions);
    onChange(newOptions);
  };
  const handleSimpleOptionRemove = (index: number) => {
    const newOptions = simpleOptions.filter((_, i) => i !== index);
    setSimpleOptions(newOptions);
    onChange(newOptions);
  };
  const handleMappingOptionAdd = () => {
    setMappingOptions({ ...mappingOptions, '': [] });
  };
  const handleMappingOptionChange = (key: string, newKey: string, values: string[]) => {
    const newOptions = { ...mappingOptions };
    delete newOptions[key];
    newOptions[newKey] = values;
    setMappingOptions(newOptions);
    onChange(newOptions);
  };
  const handleMappingOptionRemove = (key: string) => {
    const newOptions = { ...mappingOptions };
    delete newOptions[key];
    setMappingOptions(newOptions);
    onChange(newOptions);
  };
  const handleNumericOptionAdd = () => {
    setNumericOptions({ ...numericOptions, '': [] });
  };
  const handleNumericOptionChange = (key: string, newKey: string, values: string[]) => {
    const newOptions = { ...numericOptions };
    delete newOptions[key];
    newOptions[newKey] = values;
    setNumericOptions(newOptions);
    onChange(newOptions);
  };
  const handleNumericOptionRemove = (key: string) => {
    const newOptions = { ...numericOptions };
    delete newOptions[key];
    setNumericOptions(newOptions);
    onChange(newOptions);
  };

  return (
    <div className="space-y-4">
      <Tabs value={configType} onValueChange={(v) => setConfigType(v as typeof configType)}>
        <TabsList>
          <TabsTrigger value="simple">Simple Options</TabsTrigger>
          <TabsTrigger value="mapping">Option Mapping</TabsTrigger>
          <TabsTrigger value="numeric">Numeric Branching</TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="space-y-4">
          {simpleOptions.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={option}
                onChange={(e) => handleSimpleOptionChange(index, e.target.value)}
                placeholder="Enter option"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSimpleOptionRemove(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleSimpleOptionAdd} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Option
          </Button>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          {Object.entries(mappingOptions).map(([key, values]) => (
            <div key={key} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={key}
                  onChange={(e) => handleMappingOptionChange(key, e.target.value, values)}
                  placeholder="Option key"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleMappingOptionRemove(key)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="pl-4 space-y-2">
                <Label className="text-sm text-muted-foreground">Next Data Points:</Label>
                <DataPointCombobox
                  value={Array.isArray(values) ? values : []}
                  onChange={(value) => handleMappingOptionChange(key, key, Array.isArray(value) ? value : value ? [value] : [])}
                  placeholder="Select data points"
                  dataPoints={dataPoints}
                  currentDatapointId=""
                />
              </div>
            </div>
          ))}
          <Button onClick={handleMappingOptionAdd} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Option Mapping
          </Button>
        </TabsContent>

        <TabsContent value="numeric" className="space-y-4">
          {Object.entries(numericOptions).map(([key, values]) => (
            <div key={key} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={key}
                  onChange={(e) => handleNumericOptionChange(key, e.target.value, values)}
                  placeholder="Number"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleNumericOptionRemove(key)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="pl-4 space-y-2">
                <Label className="text-sm text-muted-foreground">Next Data Points:</Label>
                <DataPointCombobox
                  value={Array.isArray(values) ? values : []}
                  onChange={(value) => handleNumericOptionChange(key, key, Array.isArray(value) ? value : value ? [value] : [])}
                  placeholder="Select data points"
                  dataPoints={dataPoints}
                  currentDatapointId=""
                />
              </div>
            </div>
          ))}
          <Button onClick={handleNumericOptionAdd} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Numeric Option
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
} 