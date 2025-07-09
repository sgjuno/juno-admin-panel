"use client";
import React, { useEffect, useState } from "react";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Badge } from "@/components/ui/badge";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Lead {
  _id: string;
  threadId: string;
  status: string;
  clientId: any;
  clientCode: string;
  createdAt: number;
  updatedAt: number;
}

const statusOptions = ["New", "In Progress", "Closed", "Rejected"];
const pageSizeOptions = [10, 20, 50, 100];

export default function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [clientCodes, setClientCodes] = useState<string[]>([]);
  const [allClientCodes, setAllClientCodes] = useState<string[]>([]);
  const [createdRange, setCreatedRange] = useState<DateRange | undefined>();
  const [updatedRange, setUpdatedRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line
  }, [search, status, clientCodes, createdRange, updatedRange, page, pageSize]);

  useEffect(() => {
    fetch("/api/leads/client-codes")
      .then(res => res.json())
      .then(setAllClientCodes);
  }, []);

  async function fetchLeads() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status && status !== "all") params.append("status", status);
    clientCodes.forEach(code => params.append("clientCode", code));
    if (createdRange?.from) params.append("createdFrom", createdRange.from.getTime().toString());
    if (createdRange?.to) params.append("createdTo", createdRange.to.getTime().toString());
    if (updatedRange?.from) params.append("updatedFrom", updatedRange.from.getTime().toString());
    if (updatedRange?.to) params.append("updatedTo", updatedRange.to.getTime().toString());
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    const res = await fetch(`/api/leads?${params.toString()}`);
    const data = await res.json();
    setLeads(data.leads);
    setTotal(data.total);
    setLoading(false);
  }

  function clearFilters() {
    setStatus("all");
    setClientCodes([]);
    setCreatedRange(undefined);
    setUpdatedRange(undefined);
    setPage(1);
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by client code, thread ID, status..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" onClick={() => { setPage(1); fetchLeads(); }} aria-label="Search">
              <Search className="w-5 h-5 mr-2" />Search
            </Button>
          </div>
        </div>
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="mt-6" aria-label="Filters">
              <Filter className="w-5 h-5 mr-2" /> Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Client Code</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {clientCodes.length === 0 ? "Select client codes" : (
                        <div className="flex flex-wrap gap-1">
                          {clientCodes.map(code => (
                            <Badge key={code} variant="secondary">{code}</Badge>
                          ))}
                        </div>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-72">
                    <Command>
                      <CommandInput placeholder="Search client codes..." />
                      <CommandList>
                        <CommandEmpty>No client codes found.</CommandEmpty>
                        {allClientCodes.map(code => (
                          <CommandItem
                            key={code}
                            onSelect={() => {
                              setClientCodes((prev) =>
                                prev.includes(code)
                                  ? prev.filter((c) => c !== code)
                                  : [...prev, code]
                              );
                            }}
                          >
                            <span className={clientCodes.includes(code) ? "font-semibold" : ""}>{code}</span>
                            {clientCodes.includes(code) && <Badge className="ml-2">Selected</Badge>}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Created Date Range</label>
                <DateRangePicker value={createdRange} onChange={setCreatedRange} placeholder="Select created date range" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Updated Date Range</label>
                <DateRangePicker value={updatedRange} onChange={setUpdatedRange} placeholder="Select updated date range" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" onClick={clearFilters}>Clear</Button>
                <Button onClick={() => { setPage(1); setFilterOpen(false); fetchLeads(); }}>Apply</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="overflow-x-auto rounded-2xl shadow-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Code</TableHead>
              <TableHead>Thread ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>Loading...</TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No leads found.</TableCell>
              </TableRow>
            ) : (
              leads.map(lead => (
                <TableRow key={lead._id}>
                  <TableCell className="max-w-[140px] truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate">{lead.clientCode}</span>
                        </TooltipTrigger>
                        <TooltipContent>{lead.clientCode}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate">{lead.threadId}</span>
                        </TooltipTrigger>
                        <TooltipContent>{lead.threadId}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="max-w-[100px] truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate">{lead.status}</span>
                        </TooltipTrigger>
                        <TooltipContent>{lead.status}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate">{new Date(lead.createdAt).toLocaleString()}</span>
                        </TooltipTrigger>
                        <TooltipContent>{new Date(lead.createdAt).toLocaleString()}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate">{new Date(lead.updatedAt).toLocaleString()}</span>
                        </TooltipTrigger>
                        <TooltipContent>{new Date(lead.updatedAt).toLocaleString()}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(opt => (
                <SelectItem key={opt} value={opt.toString()}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous Page">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span>Page {page} of {totalPages || 1}</span>
          <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} aria-label="Next Page">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 