"use client";

import React from 'react';
import { use, useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

function isObject(val: any) {
  return val && typeof val === "object" && !Array.isArray(val);
}

export default function RuleCriteriaPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = React.use(params);
  const [client, setClient] = useState<any>(null);
  const [ruleCriteria, setRuleCriteria] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("number");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/clients/${clientId}`)
      .then((res) => res.json())
      .then((data) => {
        setClient(data);
        setRuleCriteria(data.ruleCriteria || {});
        setLoading(false);
      });
  }, [clientId]);

  const handleValueChange = (key: string, value: any, subkey?: string) => {
    setRuleCriteria((prev: any) => {
      const updated = { ...prev };
      if (subkey) {
        updated[key] = { ...updated[key], [subkey]: value };
      } else {
        updated[key] = value;
      }
      return updated;
    });
  };

  const handleArrayChange = (key: string, idx: number, value: any) => {
    setRuleCriteria((prev: any) => {
      const arr = Array.isArray(prev[key]) ? [...prev[key]] : [];
      arr[idx] = value;
      return { ...prev, [key]: arr };
    });
  };

  const handleArrayAdd = (key: string) => {
    setRuleCriteria((prev: any) => {
      const arr = Array.isArray(prev[key]) ? [...prev[key], ""] : [""];
      return { ...prev, [key]: arr };
    });
  };

  const handleArrayRemove = (key: string, idx: number) => {
    setRuleCriteria((prev: any) => {
      const arr = Array.isArray(prev[key]) ? [...prev[key]] : [];
      arr.splice(idx, 1);
      return { ...prev, [key]: arr };
    });
  };

  const handleRemoveKey = (key: string) => {
    setRuleCriteria((prev: any) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleAddKey = () => {
    if (!newKey) return;
    setRuleCriteria((prev: any) => {
      let value: any = "";
      if (newType === "number") value = 0;
      else if (newType === "boolean") value = false;
      else if (newType === "array") value = [""];
      else if (newType === "object") value = { subfield: "" };
      return { ...prev, [newKey]: value };
    });
    setNewKey("");
    setNewType("number");
  };

  const handleObjectFieldChange = (key: string, subkey: string, value: any) => {
    setRuleCriteria((prev: any) => {
      return {
        ...prev,
        [key]: {
          ...prev[key],
          [subkey]: value,
        },
      };
    });
  };

  const handleObjectFieldRemove = (key: string, subkey: string) => {
    setRuleCriteria((prev: any) => {
      const updated = { ...prev };
      const obj = { ...updated[key] };
      delete obj[subkey];
      updated[key] = obj;
      return updated;
    });
  };

  const handleObjectFieldAdd = (key: string) => {
    setRuleCriteria((prev: any) => {
      const obj = { ...prev[key], newField: "" };
      return { ...prev, [key]: obj };
    });
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
            <span className="text-lg font-semibold">Edit Rule Criteria</span>
            <div className="flex gap-2">
              <Input
                placeholder="New key name"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                className="w-40"
              />
              <select
                value={newType}
                onChange={e => setNewType(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array</option>
                <option value="object">Object</option>
                <option value="string">String</option>
              </select>
              <Button type="button" variant="outline" onClick={handleAddKey} className="gap-2">
                <Plus className="w-4 h-4" /> Add
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {(Object.keys(ruleCriteria).length === 0) && (
            <div className="text-muted-foreground">No rule criteria defined.</div>
          )}
          {(Object.entries(ruleCriteria) as [string, any][]).map(([key, value]) => (
            <div key={key} className="border rounded-xl p-4 mb-2 bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-base font-semibold">{key}</Label>
                <Button size="icon" variant="ghost" onClick={() => handleRemoveKey(key)} aria-label="Remove criteria">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              {/* Render value based on type */}
              {Array.isArray(value) ? (
                <div className="space-y-2">
                  {value.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        value={item}
                        onChange={e => handleArrayChange(key, idx, e.target.value)}
                        className="w-64"
                      />
                      <Button size="icon" variant="ghost" onClick={() => handleArrayRemove(key, idx)} aria-label="Remove item">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => handleArrayAdd(key)} className="gap-2 mt-2">
                    <Plus className="w-4 h-4" /> Add Item
                  </Button>
                </div>
              ) : typeof value === "boolean" ? (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={value}
                    onCheckedChange={val => handleValueChange(key, val)}
                    id={key}
                  />
                  <Label htmlFor={key}>{value ? "True" : "False"}</Label>
                </div>
              ) : typeof value === "number" ? (
                <Input
                  type="number"
                  value={value}
                  onChange={e => handleValueChange(key, Number(e.target.value))}
                  className="w-64"
                />
              ) : typeof value === "string" ? (
                <Input
                  value={value}
                  onChange={e => handleValueChange(key, e.target.value)}
                  className="w-64"
                />
              ) : isObject(value) ? (
                <div className="space-y-2">
                  {Object.entries(value).map(([subkey, subval]) => (
                    <div key={subkey} className="flex gap-2 items-center">
                      <Label className="w-32">{subkey}</Label>
                      <Input
                        value={String(subval)}
                        onChange={e => handleObjectFieldChange(key, subkey, e.target.value)}
                        className="w-64"
                      />
                      <Button size="icon" variant="ghost" onClick={() => handleObjectFieldRemove(key, subkey)} aria-label="Remove field">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => handleObjectFieldAdd(key)} className="gap-2 mt-2">
                    <Plus className="w-4 h-4" /> Add Field
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 