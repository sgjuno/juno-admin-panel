'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, Save, Plus, Trash2, Settings, Shield, AlertTriangle, Users } from 'lucide-react';

interface Condition {
  operator: string;
  value: any;
  message: string;
}

interface RuleConfig {
  type?: string;
  allowed?: string[];
  hardDecline?: {
    conditions?: Condition[];
    upperBound?: number;
    lowerBound?: number;
    maxLtvPercentage?: number;
  };
  humanHandover?: {
    conditions?: Condition[];
    upperBound?: number;
    lowerBound?: number;
    maxLtvPercentage?: number;
  };
  isHardDecline?: boolean;
  isHumanHandover?: boolean;
}

interface RuleCriteria {
  [key: string]: RuleConfig | undefined;
  generalConfig?: {
    [key: string]: RuleConfig;
  };
}

interface Client {
  _id: string;
  companyName: string;
  ruleCriteria?: RuleCriteria;
}

export default function RuleCriteriaPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = React.use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [ruleCriteria, setRuleCriteria] = useState<RuleCriteria>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/clients/${clientId}`);
        const clientData = await res.json();
        console.log('Loaded client data:', JSON.stringify(clientData.ruleCriteria, null, 2));
        setClient(clientData);
        setRuleCriteria(clientData.ruleCriteria || {});
        setLoading(false);
      } catch (err) {
        console.error('Failed to load client data:', err);
        setError('Failed to load client data');
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  // Get all top-level rules (not in generalConfig)
  const getTopLevelRules = () => {
    return Object.entries(ruleCriteria).filter(([key, value]) => 
      key !== 'generalConfig' && value && typeof value === 'object' && !Array.isArray(value)
    );
  };

  // Get all generalConfig rules
  const getGeneralConfigRules = () => {
    return ruleCriteria.generalConfig ? Object.entries(ruleCriteria.generalConfig) : [];
  };

  const updateRule = (isGeneralConfig: boolean, ruleKey: string, updates: Partial<RuleConfig>) => {
    console.log('Updating rule:', { isGeneralConfig, ruleKey, updates });
    setRuleCriteria(prev => {
      const newState = isGeneralConfig ? {
        ...prev,
        generalConfig: {
          ...prev.generalConfig,
          [ruleKey]: {
            ...(prev.generalConfig?.[ruleKey] || {}),
            ...updates
          }
        }
      } : {
        ...prev,
        [ruleKey]: {
          ...(prev[ruleKey] as RuleConfig || {}),
          ...updates
        }
      };
      console.log('New rule criteria state after update:', JSON.stringify(newState, null, 2));
      return newState;
    });
  };

  const updateCondition = (isGeneralConfig: boolean, ruleKey: string, type: 'hardDecline' | 'humanHandover', conditionIndex: number, updates: Partial<Condition>) => {
    setRuleCriteria(prev => {
      const currentRule = isGeneralConfig ? prev.generalConfig?.[ruleKey] : prev[ruleKey] as RuleConfig;
      const currentConditions = currentRule?.[type]?.conditions || [];
      const newConditions = [...currentConditions];
      newConditions[conditionIndex] = { ...newConditions[conditionIndex], ...updates };

      const ruleUpdates = {
        [type]: {
          ...currentRule?.[type],
          conditions: newConditions
        }
      };

      if (isGeneralConfig) {
        return {
          ...prev,
          generalConfig: {
            ...prev.generalConfig,
            [ruleKey]: {
              ...(prev.generalConfig?.[ruleKey] || {}),
              ...ruleUpdates
            }
          }
        };
      } else {
        return {
          ...prev,
          [ruleKey]: {
            ...(prev[ruleKey] as RuleConfig || {}),
            ...ruleUpdates
          }
        };
      }
    });
  };

  const addCondition = (isGeneralConfig: boolean, ruleKey: string, type: 'hardDecline' | 'humanHandover') => {
    const newCondition: Condition = {
      operator: '=',
      value: '',
      message: ''
    };

    setRuleCriteria(prev => {
      const currentRule = isGeneralConfig ? prev.generalConfig?.[ruleKey] : prev[ruleKey] as RuleConfig;
      const currentConditions = currentRule?.[type]?.conditions || [];

      const ruleUpdates = {
        [type]: {
          ...currentRule?.[type],
          conditions: [...currentConditions, newCondition]
        }
      };

      if (isGeneralConfig) {
        return {
          ...prev,
          generalConfig: {
            ...prev.generalConfig,
            [ruleKey]: {
              ...(prev.generalConfig?.[ruleKey] || {}),
              ...ruleUpdates
            }
          }
        };
      } else {
        return {
          ...prev,
          [ruleKey]: {
            ...(prev[ruleKey] as RuleConfig || {}),
            ...ruleUpdates
          }
        };
      }
    });
  };

  const removeCondition = (isGeneralConfig: boolean, ruleKey: string, type: 'hardDecline' | 'humanHandover', conditionIndex: number) => {
    setRuleCriteria(prev => {
      const currentRule = isGeneralConfig ? prev.generalConfig?.[ruleKey] : prev[ruleKey] as RuleConfig;
      const currentConditions = currentRule?.[type]?.conditions || [];
      const newConditions = currentConditions.filter((_, index) => index !== conditionIndex);

      const ruleUpdates = {
        [type]: {
          ...currentRule?.[type],
          conditions: newConditions
        }
      };

      if (isGeneralConfig) {
        return {
          ...prev,
          generalConfig: {
            ...prev.generalConfig,
            [ruleKey]: {
              ...(prev.generalConfig?.[ruleKey] || {}),
              ...ruleUpdates
            }
          }
        };
      } else {
        return {
          ...prev,
          [ruleKey]: {
            ...(prev[ruleKey] as RuleConfig || {}),
            ...ruleUpdates
          }
        };
      }
    });
  };

  const addNewRule = (isGeneralConfig: boolean) => {
    const ruleKey = prompt('Enter rule name (e.g., newRule):');
    if (!ruleKey || ruleKey.trim() === '') return;
    
    const newRule: RuleConfig = {
      type: 'string',
      isHardDecline: false,
      isHumanHandover: false
    };

    setRuleCriteria(prev => {
      if (isGeneralConfig) {
        return {
          ...prev,
          generalConfig: {
            ...prev.generalConfig,
            [ruleKey]: newRule
          }
        };
      } else {
        return {
          ...prev,
          [ruleKey]: newRule
        };
      }
    });
  };

  const deleteRule = (isGeneralConfig: boolean, ruleKey: string) => {
    if (!confirm(`Are you sure you want to delete the rule "${ruleKey}"?`)) return;

    setRuleCriteria(prev => {
      if (isGeneralConfig) {
        const newGeneralConfig = { ...prev.generalConfig };
        delete newGeneralConfig[ruleKey];
        return {
          ...prev,
          generalConfig: newGeneralConfig
        };
      } else {
        // Only delete the specific rule, not generalConfig
        const { generalConfig, [ruleKey]: deletedRule, ...restRules } = prev;
        return {
          ...restRules,
          ...(generalConfig && { generalConfig })
        };
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    // Debug: Log what we're about to save
    console.log('About to save ruleCriteria:', JSON.stringify(ruleCriteria, null, 2));
    
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleCriteria }),
      });
      
      if (res.ok) {
        setSuccess('Rule criteria updated successfully!');
        // Debug: Log the response
        const responseData = await res.json();
        console.log('Save response:', responseData);
        
        // Verify the saved data by reloading
        setTimeout(async () => {
          try {
            const verifyRes = await fetch(`/api/clients/${clientId}`);
            const verifyData = await verifyRes.json();
            console.log('Verification - data in DB after save:', JSON.stringify(verifyData.ruleCriteria, null, 2));
            
            // If the data is empty or null, show an error
            if (!verifyData.ruleCriteria || Object.keys(verifyData.ruleCriteria).length === 0) {
              setError('WARNING: Rule criteria was cleared from database! Please reload the page and try again.');
              setSuccess('');
            }
          } catch (e) {
            console.error('Failed to verify saved data:', e);
          }
        }, 1000);
      } else {
        const errorData = await res.text();
        console.error('Save failed with response:', errorData);
        setError('Failed to update rule criteria.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save changes.');
    }
    
    setSaving(false);
  };

  // Component to render individual rule configuration
  const RuleConfigComponent = ({ ruleKey, ruleConfig, isGeneralConfig }: { ruleKey: string, ruleConfig: RuleConfig, isGeneralConfig: boolean }) => {
    const operators = [
      { value: '=', label: 'Equals' },
      { value: '!=', label: 'Not Equals' },
      { value: '>', label: 'Greater Than' },
      { value: '<', label: 'Less Than' },
      { value: '>=', label: 'Greater Than or Equal' },
      { value: '<=', label: 'Less Than or Equal' },
      { value: 'in', label: 'In List' },
      { value: 'notIn', label: 'Not In List' },
      { value: 'between', label: 'Between' },
      { value: 'notBetween', label: 'Not Between' }
    ];

    const formatRuleKey = (key: string) => {
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    const ConditionEditor = ({ condition, conditionIndex, type }: { condition: Condition, conditionIndex: number, type: 'hardDecline' | 'humanHandover' }) => (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Condition {conditionIndex + 1}</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeCondition(isGeneralConfig, ruleKey, type, conditionIndex)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Operator</Label>
            <Select 
              value={condition.operator} 
              onValueChange={(value) => updateCondition(isGeneralConfig, ruleKey, type, conditionIndex, { operator: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators.map(op => (
                  <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Value</Label>
            {condition.operator === 'between' || condition.operator === 'notBetween' ? (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={Array.isArray(condition.value) ? condition.value[0] || '' : ''}
                  onChange={(e) => {
                    const currentValue = Array.isArray(condition.value) ? condition.value : ['', ''];
                    let newValue: any = e.target.value;
                    if (ruleConfig.type === 'integer' && newValue !== '') {
                      newValue = parseInt(newValue) || 0;
                    }
                    updateCondition(isGeneralConfig, ruleKey, type, conditionIndex, { 
                      value: [newValue, currentValue[1] || ''] 
                    });
                  }}
                  type={ruleConfig.type === 'integer' ? 'number' : 'text'}
                  placeholder="From"
                />
                <Input
                  value={Array.isArray(condition.value) ? condition.value[1] || '' : ''}
                  onChange={(e) => {
                    const currentValue = Array.isArray(condition.value) ? condition.value : ['', ''];
                    let newValue: any = e.target.value;
                    if (ruleConfig.type === 'integer' && newValue !== '') {
                      newValue = parseInt(newValue) || 0;
                    }
                    updateCondition(isGeneralConfig, ruleKey, type, conditionIndex, { 
                      value: [currentValue[0] || '', newValue] 
                    });
                  }}
                  type={ruleConfig.type === 'integer' ? 'number' : 'text'}
                  placeholder="To"
                />
              </div>
            ) : condition.operator === 'in' || condition.operator === 'notIn' ? (
              <Textarea
                value={Array.isArray(condition.value) ? condition.value.join('\n') : condition.value}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(line => line.trim()).map(line => {
                    if (ruleConfig.type === 'integer') {
                      return parseInt(line.trim()) || line.trim();
                    }
                    return line.trim();
                  });
                  updateCondition(isGeneralConfig, ruleKey, type, conditionIndex, { value: lines });
                }}
                placeholder="One value per line"
                rows={3}
              />
            ) : (
              <Input
                value={condition.value || ''}
                onChange={(e) => {
                  let value: any = e.target.value;
                  if (ruleConfig.type === 'integer' && value !== '') {
                    value = parseInt(value) || 0;
                  } else if (ruleConfig.type === 'boolean') {
                    value = value === 'true';
                  }
                  updateCondition(isGeneralConfig, ruleKey, type, conditionIndex, { value });
                }}
                type={ruleConfig.type === 'integer' ? 'number' : ruleConfig.type === 'boolean' ? 'text' : 'text'}
                placeholder={ruleConfig.type === 'boolean' ? 'true or false' : 'Enter value'}
              />
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Message</Label>
          <Input
            value={condition.message}
            onChange={(e) => updateCondition(isGeneralConfig, ruleKey, type, conditionIndex, { message: e.target.value })}
            placeholder="Message to show when condition is met"
          />
        </div>
      </div>
    );

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="flex items-center gap-2">
                  {formatRuleKey(ruleKey)}
                  {ruleConfig.type && <Badge variant="outline">{ruleConfig.type}</Badge>}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRule(isGeneralConfig, ruleKey)}
                  className="text-red-600 hover:text-red-700 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                Configure {isGeneralConfig ? 'general' : 'specific'} rule criteria for {formatRuleKey(ruleKey).toLowerCase()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={ruleConfig.isHardDecline || false}
                  onCheckedChange={(checked) => updateRule(isGeneralConfig, ruleKey, { isHardDecline: checked })}
                />
                <Label className="text-sm">Hard Decline</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={ruleConfig.isHumanHandover || false}
                  onCheckedChange={(checked) => updateRule(isGeneralConfig, ruleKey, { isHumanHandover: checked })}
                />
                <Label className="text-sm">Human Handover</Label>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rule Type Selector */}
          <div className="space-y-2">
            <Label>Data Type</Label>
            <Select 
              value={ruleConfig.type || 'string'} 
              onValueChange={(value) => updateRule(isGeneralConfig, ruleKey, { type: value })}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">String</SelectItem>
                <SelectItem value="integer">Integer</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allowed values for simple rules */}
          {ruleConfig.allowed && (
            <div className="space-y-2">
              <Label>Allowed Values</Label>
              <Textarea
                value={ruleConfig.allowed.join('\n')}
                onChange={(e) => {
                  const values = e.target.value.split('\n').filter(v => v.trim());
                  updateRule(isGeneralConfig, ruleKey, { allowed: values });
                }}
                placeholder="One value per line"
                rows={3}
              />
            </div>
          )}

          {/* Hard Decline Conditions */}
          {ruleConfig.isHardDecline && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  <Label className="font-medium text-red-600">Hard Decline Conditions</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCondition(isGeneralConfig, ruleKey, 'hardDecline')}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Condition
                </Button>
              </div>
              
              {ruleConfig.hardDecline?.conditions?.map((condition, index) => (
                <ConditionEditor
                  key={index}
                  condition={condition}
                  conditionIndex={index}
                  type="hardDecline"
                />
              ))}
            </div>
          )}

          {/* Human Handover Conditions */}
          {ruleConfig.isHumanHandover && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  <Label className="font-medium text-orange-600">Human Handover Conditions</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCondition(isGeneralConfig, ruleKey, 'humanHandover')}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Condition
                </Button>
              </div>
              
              {ruleConfig.humanHandover?.conditions?.map((condition, index) => (
                <ConditionEditor
                  key={index}
                  condition={condition}
                  conditionIndex={index}
                  type="humanHandover"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Client not found.</AlertDescription>
      </Alert>
    );
  }

  const topLevelRules = getTopLevelRules();
  const generalConfigRules = getGeneralConfigRules();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Rule Criteria</h1>
          <p className="text-muted-foreground">
            Configure rule criteria for {client.companyName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="gap-2"
          >
            Reload Data
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {success && (
        <Alert className="bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            General Config ({generalConfigRules.length})
          </TabsTrigger>
          <TabsTrigger value="specific" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Specific Rules ({topLevelRules.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => addNewRule(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add New General Rule
            </Button>
          </div>
          
          {generalConfigRules.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No General Config Rules</h3>
                  <p className="text-muted-foreground mb-4">
                    General config rules will appear here when configured in the database.
                  </p>
                  <Button onClick={() => addNewRule(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First General Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {generalConfigRules.map(([ruleKey, ruleConfig]) => (
                <RuleConfigComponent
                  key={ruleKey}
                  ruleKey={ruleKey}
                  ruleConfig={ruleConfig as RuleConfig}
                  isGeneralConfig={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="specific" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => addNewRule(false)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Specific Rule
            </Button>
          </div>
          
          {topLevelRules.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Specific Rules</h3>
                  <p className="text-muted-foreground mb-4">
                    Specific rules (outside generalConfig) will appear here when configured.
                  </p>
                  <Button onClick={() => addNewRule(false)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Specific Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {topLevelRules.map(([ruleKey, ruleConfig]) => (
                <RuleConfigComponent
                  key={ruleKey}
                  ruleKey={ruleKey}
                  ruleConfig={ruleConfig as RuleConfig}
                  isGeneralConfig={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 