'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import AddClientModal from '@/components/AddClientModal';
import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Pencil, Trash2, Settings } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditClientModal from '@/components/EditClientModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Client {
  _id: string;
  pocName: string;
  pocContact: string;
  type: string;
  website: string;
  companyName: string;
  companyNumber: string;
  address: string;
  country: string;
  isActive: boolean;
  clientCode: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [addClientError, setAddClientError] = useState<string | null>(null);
  const [editClientError, setEditClientError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (clientData: any) => {
    try {
      setAddClientError(null);
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add client');
      }

      // Refresh the clients list
      await fetchClients();
      return true;
    } catch (err) {
      setAddClientError(err instanceof Error ? err.message : 'Failed to add client');
      return false;
    }
  };

  const handleEditClient = async (clientData: any) => {
    try {
      setEditClientError(null);
      const response = await fetch(`/api/clients/${clientData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update client');
      }
      await fetchClients();
      setEditClient(null);
      return true;
    } catch (err) {
      setEditClientError(err instanceof Error ? err.message : 'Failed to update client');
      return false;
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteClient) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/clients/${deleteClient._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete client');
      }
      setDeleteClient(null);
      await fetchClients();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete client');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Client
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 min-w-[180px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 min-w-[120px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">POC</th>
                <th className="px-6 py-3 min-w-[120px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 min-w-[100px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 min-w-[100px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 min-w-[120px] text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Code</th>
                <th className="px-6 py-3 min-w-[180px] text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{client.companyName || client.pocName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.pocName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.pocContact}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.type === 'BROKER' ? 'Broker' : client.type === 'LENDER' ? 'Lender' : client.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{client.isActive ? 'Active' : 'Not Active'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.clientCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex gap-2 justify-end">
                    <Link href={`/clients/${client._id}`}>
                      <Button variant="outline" className="gap-2" aria-label="Configure client">
                        <Settings className="w-5 h-5 mr-2" /> Configure
                      </Button>
                    </Link>
                    <Button variant="outline" className="gap-2" aria-label="Edit client" onClick={() => setEditClient(client)}>
                      <Pencil className="w-5 h-5 mr-2" /> Edit
                    </Button>
                    <Button variant="destructive" className="gap-2" aria-label="Delete client" onClick={() => setDeleteClient(client)}>
                      <Trash2 className="w-5 h-5 mr-2" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={async (clientData) => {
          const success = await handleAddClient(clientData);
          if (success) setIsAddModalOpen(false);
        }}
        existingClients={clients}
        error={addClientError}
      />

      <EditClientModal
        isOpen={!!editClient}
        onClose={() => setEditClient(null)}
        client={editClient}
        onEdit={handleEditClient}
        error={editClientError}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteClient} onOpenChange={(open) => { if (!open) setDeleteClient(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>
          <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{deleteClient?.companyName || deleteClient?.pocName}</span>? This action cannot be undone.</p>
          {deleteError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteClient(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteClient} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 