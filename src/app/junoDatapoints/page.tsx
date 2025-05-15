"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JunoDatapoint {
  _id?: string;
  id: string;
  type: string;
  category: string;
  questionText: string;
  options?: string[];
  specificParsingRules?: string;
}

const emptyDatapoint: JunoDatapoint = {
  id: "",
  type: "",
  category: "",
  questionText: "",
  options: [],
  specificParsingRules: "",
};

export default function JunoDatapointsPage() {
  const [datapoints, setDatapoints] = useState<JunoDatapoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JunoDatapoint | null>(null);
  const [form, setForm] = useState<JunoDatapoint>(emptyDatapoint);
  const [saving, setSaving] = useState(false);
  // Search and filter state
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("__all__");
  const [typeFilter, setTypeFilter] = useState("__all__");
  // Add new state for custom category and type
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomType, setShowCustomType] = useState(false);

  useEffect(() => {
    fetchDatapoints();
  }, []);

  const fetchDatapoints = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/juno-datapoints");
      const data = await res.json();
      setDatapoints(data);
    } catch (e) {
      setError("Failed to load datapoints.");
    }
    setLoading(false);
  };

  const openAddDialog = () => {
    setEditing(null);
    setForm(emptyDatapoint);
    setDialogOpen(true);
  };

  const openEditDialog = (dp: JunoDatapoint) => {
    setEditing(dp);
    setForm({ ...dp, options: dp.options ? [...dp.options] : [] });
    // Check if the category/type exists in our lists
    setShowCustomCategory(!categories.includes(dp.category));
    setShowCustomType(!types.includes(dp.type));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyDatapoint);
    setShowCustomCategory(false);
    setShowCustomType(false);
  };

  const handleFormChange = (field: keyof JunoDatapoint, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionsChange = (idx: number, value: string) => {
    setForm((prev) => {
      const options = prev.options ? [...prev.options] : [];
      options[idx] = value;
      return { ...prev, options };
    });
  };

  const handleAddOption = () => {
    setForm((prev) => ({ ...prev, options: [...(prev.options || []), ""] }));
  };

  const handleRemoveOption = (idx: number) => {
    setForm((prev) => {
      const options = prev.options ? [...prev.options] : [];
      options.splice(idx, 1);
      return { ...prev, options };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/juno-datapoints/${editing._id}` : "/api/juno-datapoints";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess(editing ? "Updated successfully!" : "Added successfully!");
      closeDialog();
      fetchDatapoints();
    } catch (e) {
      setError("Failed to save datapoint.");
    }
    setSaving(false);
  };

  const handleDelete = async (dp: JunoDatapoint) => {
    if (!window.confirm("Are you sure you want to delete this datapoint?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/juno-datapoints/${dp._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setSuccess("Deleted successfully!");
      fetchDatapoints();
    } catch (e) {
      setError("Failed to delete datapoint.");
    }
  };

  // Unique categories and types for filters
  const categories = useMemo(() => Array.from(new Set(datapoints.map(d => d.category).filter(Boolean))), [datapoints]);
  const types = useMemo(() => Array.from(new Set(datapoints.map(d => d.type).filter(Boolean))), [datapoints]);

  // Filtered datapoints
  const filteredDatapoints = useMemo(() => {
    return datapoints.filter(dp => {
      const matchesSearch =
        !search ||
        dp.id.toLowerCase().includes(search.toLowerCase()) ||
        dp.questionText.toLowerCase().includes(search.toLowerCase()) ||
        (dp.category && dp.category.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = categoryFilter === "__all__" || dp.category === categoryFilter;
      const matchesType = typeFilter === "__all__" || dp.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [datapoints, search, categoryFilter, typeFilter]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Juno Datapoints
          </h1>
          <p className="text-muted-foreground">Manage all available datapoints for rules and required details.</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" /> Add Datapoint
        </Button>
      </div>
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 items-end mb-2">
        <div className="w-64">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by ID, question, or category"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Label htmlFor="type">Type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger id="type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              {types.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          <span className="text-lg font-semibold">All Datapoints</span>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDatapoints.map((dp) => (
                    <TableRow key={dp._id || dp.id}>
                      <TableCell>{dp.id}</TableCell>
                      <TableCell>{dp.category}</TableCell>
                      <TableCell>{dp.type}</TableCell>
                      <TableCell>{dp.questionText}</TableCell>
                      <TableCell>
                        {dp.options && dp.options.length > 0 ? dp.options.join(", ") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(dp)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(dp)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Datapoint" : "Add Datapoint"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID</Label>
              <Input value={form.id} onChange={e => handleFormChange("id", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={form.category} 
                onValueChange={(value) => {
                  if (value === "others") {
                    setShowCustomCategory(true);
                    handleFormChange("category", "");
                  } else {
                    setShowCustomCategory(false);
                    handleFormChange("category", value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
              {showCustomCategory && (
                <Input 
                  value={form.category} 
                  onChange={e => handleFormChange("category", e.target.value)}
                  placeholder="Enter custom category"
                  className="mt-2"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={form.type} 
                onValueChange={(value) => {
                  if (value === "others") {
                    setShowCustomType(true);
                    handleFormChange("type", "");
                  } else {
                    setShowCustomType(false);
                    handleFormChange("type", value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                  <SelectItem value="others">Others</SelectItem>
                </SelectContent>
              </Select>
              {showCustomType && (
                <Input 
                  value={form.type} 
                  onChange={e => handleFormChange("type", e.target.value)}
                  placeholder="Enter custom type"
                  className="mt-2"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>Question Text</Label>
              <Input value={form.questionText} onChange={e => handleFormChange("questionText", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Options</Label>
              {(form.options || []).map((opt, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input value={opt} onChange={e => handleOptionsChange(idx, e.target.value)} className="w-64" />
                  <Button size="icon" variant="ghost" onClick={() => handleRemoveOption(idx)} aria-label="Remove option">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="gap-2 mt-2">
                <Plus className="w-4 h-4" /> Add Option
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Specific Parsing Rules</Label>
              <Input value={form.specificParsingRules} onChange={e => handleFormChange("specificParsingRules", e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={closeDialog} type="button">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 