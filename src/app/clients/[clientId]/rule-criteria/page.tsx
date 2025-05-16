"use client";

import { use, useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DetailRequired = {
  datapoint: string;
  id: string;
  questionText?: string;
  options?: string[] | Record<string, string | string[]>;
};

type Category = {
  category: string;
  detailRequired: DetailRequired[];
};

type RuleType = "range" | "number" | "array" | "boolean";

type RuleConfig = {
  type: RuleType;
  label: string;
  fields?: string[];
  fieldLabels?: Record<string, string>;
  options?: string[];
};

type RuleValue = {
  range: { lowerBound: number; upperBound: number };
  number: { value: number };
  array: string[];
  boolean: boolean;
};

const RULE_TYPES: Record<RuleType, RuleConfig> = {
  range: {
    type: "range",
    label: "Range",
    fields: ["lowerBound", "upperBound"],
    fieldLabels: {
      lowerBound: "Minimum Value",
      upperBound: "Maximum Value"
    }
  },
  number: {
    type: "number",
    label: "Number",
    fields: ["value"],
    fieldLabels: {
      value: "Value"
    }
  },
  array: {
    type: "array",
    label: "Array of Values",
    options: []
  },
  boolean: {
    type: "boolean",
    label: "Boolean"
  }
};

export default function RuleCriteriaPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const [client, setClient] = useState<any>(null);
  const [ruleCriteria, setRuleCriteria] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<string>("");
  const [selectedRuleType, setSelectedRuleType] = useState<RuleType | "">("");
  const [availableDetails, setAvailableDetails] = useState<DetailRequired[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/clients/${clientId}`)
      .then((res) => res.json())
      .then((data) => {
        setClient(data);
        setRuleCriteria(data.ruleCriteria || {});
        
        // Extract all available details from the client's detailsRequired
        const details: DetailRequired[] = [];
        data.detailsRequired?.forEach((category: Category) => {
          category.detailRequired.forEach((detail) => {
            details.push(detail);
          });
        });
        setAvailableDetails(details);
        
        setLoading(false);
      });
  }, [clientId]);

  const handleValueChange = (detailId: string, ruleType: string, value: any, subkey?: string) => {
    setRuleCriteria((prev: any) => {
      const updated = { ...prev };
      if (!updated[detailId]) {
        updated[detailId] = {};
      }
      if (subkey) {
        updated[detailId][ruleType] = { ...updated[detailId][ruleType], [subkey]: value };
      } else {
        updated[detailId][ruleType] = value;
      }
      return updated;
    });
  };

  const handleArrayChange = (detailId: string, ruleType: string, value: string[]) => {
    setRuleCriteria((prev: any) => ({
      ...prev,
      [detailId]: {
        ...prev[detailId],
        [ruleType]: value
      }
    }));
  };

  const handleRemoveRule = (detailId: string, ruleType: string) => {
    setRuleCriteria((prev: any) => {
      const updated = { ...prev };
      if (updated[detailId]) {
        delete updated[detailId][ruleType];
        if (Object.keys(updated[detailId]).length === 0) {
          delete updated[detailId];
        }
      }
      return updated;
    });
  };

  const handleAddRule = () => {
    if (!selectedDetail || !selectedRuleType) return;

    const detail = availableDetails.find(d => d.id === selectedDetail);
    if (!detail) return;

    const ruleConfig = RULE_TYPES[selectedRuleType];
    let initialValue: any;

    switch (ruleConfig.type) {
      case "range":
        initialValue = { lowerBound: 0, upperBound: 0 };
        break;
      case "number":
        initialValue = { value: 0 };
        break;
      case "array":
        initialValue = [];
        break;
      case "boolean":
        initialValue = false;
        break;
      default:
        initialValue = "";
    }

    setRuleCriteria((prev: any) => ({
        ...prev,
      [selectedDetail]: {
        ...prev[selectedDetail],
        [selectedRuleType]: initialValue
      }
    }));
    setSelectedDetail("");
    setSelectedRuleType("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ruleCriteria }),
    });
    if (res.ok) {
      setSuccess("Saved successfully!");
    } else {
      setError("Failed to save.");
    }
    setSaving(false);
  };

  const filteredDetails = availableDetails.filter(detail => 
    detail.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (detail.questionText || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
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
        <AlertDescription>Client not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Rule Criteria for {client.companyName}</h1>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      {success && (
        <Alert className="bg-green-50">
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card className="rounded-2xl shadow-md border p-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Add New Rule</span>
            <div className="flex gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between"
                  >
                    {selectedDetail
                      ? availableDetails.find((detail) => detail.id === selectedDetail)?.id
                      : "Select a detail..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search details..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>No details found.</CommandEmpty>
                    <CommandGroup>
                      {filteredDetails.map((detail) => (
                        <CommandItem
                          key={detail.id}
                          value={detail.id}
                          onSelect={(currentValue) => {
                            setSelectedDetail(currentValue === selectedDetail ? "" : currentValue);
                            setOpen(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{detail.id}</span>
                            {detail.questionText && (
                              <span className="text-sm text-muted-foreground">{detail.questionText}</span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Select value={selectedRuleType} onValueChange={(value: RuleType) => setSelectedRuleType(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RULE_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddRule} 
                className="gap-2" 
                disabled={!selectedDetail || !selectedRuleType}
              >
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {(Object.keys(ruleCriteria).length === 0) && (
            <div className="text-muted-foreground">No rule criteria defined.</div>
          )}
          {Object.entries(ruleCriteria).map(([detailId, rules]) => {
            // Try to find the detail in availableDetails
            const detail = availableDetails.find(d => d.id === detailId);
            // If not found, fallback to generic label
            const label = detail ? (
              <div className="flex flex-col">
                <Label className="text-base font-semibold">{detail.id}</Label>
                {detail.questionText && (
                  <span className="text-sm text-muted-foreground">{detail.questionText}</span>
                )}
              </div>
            ) : (
              <Label className="text-base font-semibold">{detailId}</Label>
            );

            return (
              <div key={detailId} className="border rounded-xl p-4 mb-2 bg-muted/50">
                <div className="flex items-center justify-between mb-4">
                  {label}
                </div>
                {/* If rules is an object, show each ruleType, else show value directly */}
                {typeof rules === 'object' && !Array.isArray(rules) && rules !== null ? (
                  Object.entries(rules).map(([ruleType, value]) => {
                    const ruleConfig = RULE_TYPES[ruleType as RuleType];
                    if (!ruleConfig) {
                      // Fallback for unknown rule types
                      return (
                        <div key={ruleType} className="mt-4 p-4 border rounded-lg bg-background">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">{ruleType}</Label>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleRemoveRule(detailId, ruleType)} 
                              aria-label="Remove rule"
                            >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                          <pre className="text-xs bg-muted p-2 rounded">{JSON.stringify(value, null, 2)}</pre>
                        </div>
                      );
                    }
                    const typedValue = value as RuleValue[RuleType];
                    return (
                      <div key={ruleType} className="mt-4 p-4 border rounded-lg bg-background">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium">{ruleConfig.label}</Label>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleRemoveRule(detailId, ruleType)} 
                            aria-label="Remove rule"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
                        {ruleConfig.type === "range" && (
                          <div className="grid grid-cols-2 gap-4">
                            {ruleConfig.fields?.map((field) => (
                              <div key={field} className="space-y-2">
                                <Label>{ruleConfig.fieldLabels?.[field]}</Label>
                                <Input
                                  type="number"
                                  value={(typedValue as RuleValue["range"])[field as keyof RuleValue["range"]] || 0}
                                  onChange={(e) => handleValueChange(detailId, ruleType, Number(e.target.value), field)}
                                />
                              </div>
                            ))}
                </div>
                        )}
                        {ruleConfig.type === "number" && (
                          <div className="space-y-2">
                            <Label>{ruleConfig.fieldLabels?.value}</Label>
                <Input
                  type="number"
                              value={(typedValue as RuleValue["number"]).value || 0}
                              onChange={(e) => handleValueChange(detailId, ruleType, Number(e.target.value), "value")}
                            />
                          </div>
                        )}
                        {ruleConfig.type === "array" && (
                          <div className="space-y-2">
                            <Label>Allowed Values</Label>
                            <div className="flex flex-wrap gap-2">
                              {(Array.isArray(detail?.options) ? detail.options : Object.keys(detail?.options || {})).map((option) => (
                                <label key={option} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={(typedValue as RuleValue["array"]).includes(option)}
                                    onChange={(e) => {
                                      const newValue = e.target.checked
                                        ? [...(typedValue as RuleValue["array"]), option]
                                        : (typedValue as RuleValue["array"]).filter((v: string) => v !== option);
                                      handleArrayChange(detailId, ruleType, newValue);
                                    }}
                                  />
                                  <span className="text-sm">{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        {ruleConfig.type === "boolean" && (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={typedValue as RuleValue["boolean"]}
                              onCheckedChange={(val) => handleValueChange(detailId, ruleType, val)}
                              id={`${detailId}-${ruleType}`}
                            />
                            <Label htmlFor={`${detailId}-${ruleType}`}>{(typedValue as RuleValue["boolean"]) ? "Enabled" : "Disabled"}</Label>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // If rules is not an object, just show its value
                  <div className="mt-4 p-4 border rounded-lg bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Value</Label>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleRemoveRule(detailId, "value")} 
                        aria-label="Remove rule"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <pre className="text-xs bg-muted p-2 rounded">{JSON.stringify(rules, null, 2)}</pre>
                </div>
                )}
            </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
} 